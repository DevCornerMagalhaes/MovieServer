const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration
const PORT = process.env.TRANSCODING_PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Track active transcoding processes
const activeProcesses = new Map();

// FFmpeg configuration - different paths for Docker vs local development
let ffmpegPath, ffprobePath;

if (NODE_ENV === 'production' || process.platform === 'linux') {
    // Docker/Linux environment - use system FFmpeg
    ffmpegPath = 'ffmpeg';
    ffprobePath = 'ffprobe';
} else {
    // Windows development environment
    const username = os.userInfo().username;
    const FFMPEG_BASE_PATH = `C:\\Users\\${username}\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0-essentials_build\\bin`;
    ffmpegPath = path.join(FFMPEG_BASE_PATH, 'ffmpeg.exe');
    ffprobePath = path.join(FFMPEG_BASE_PATH, 'ffprobe.exe');
}

// Configure FFmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

console.log(`📁 FFmpeg path: ${ffmpegPath}`);
console.log(`📁 FFprobe path: ${ffprobePath}`);
console.log(`🌍 Environment: ${NODE_ENV}`);

// Codec configuration
const PROBLEMATIC_AUDIO_CODECS = ['ac-3', 'eac3', 'dts', 'truehd', 'pcm_s16le', 'pcm_s24le'];
const WEB_COMPATIBLE_VIDEO_CODECS = ['h264', 'h265', 'hevc', 'vp8', 'vp9', 'av1'];

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Range, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    next();
});

/**
 * Analyzes video file codecs to determine transcoding requirements
 */
const analyzeCodecRequirements = async (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            
            const audioStreams = metadata.streams.filter(stream => stream.codec_type === 'audio');
            const videoStreams = metadata.streams.filter(stream => stream.codec_type === 'video');
            
            // Check if audio codec needs transcoding
            const needsAudioTranscoding = audioStreams.some(stream => 
                PROBLEMATIC_AUDIO_CODECS.includes(stream.codec_name)
            );
            
            // Check if video codec is web-compatible
            const needsVideoTranscoding = !videoStreams.some(stream => 
                WEB_COMPATIBLE_VIDEO_CODECS.includes(stream.codec_name)
            );
            
            resolve({
                needsAudioTranscoding,
                needsVideoTranscoding,
                audioCodecs: audioStreams.map(s => s.codec_name),
                videoCodecs: videoStreams.map(s => s.codec_name),
                metadata
            });
        });
    });
};

/**
 * Smart transcoding endpoint - analyzes file and transcodes only what's needed
 */
app.get('/transcode/:movieId', async (req, res) => {
    const { movieId } = req.params;
    const { filePath } = req.query;
    
    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Movie file not found' });
    }
    
    try {
        // Analyze the file first
        console.log(`🔍 Analyzing codec requirements for: ${path.basename(filePath)}`);
        const analysis = await analyzeCodecRequirements(filePath);
        
        console.log(`📊 Analysis result:`, {
            audio: analysis.audioCodecs,
            video: analysis.videoCodecs,
            needsAudioTranscoding: analysis.needsAudioTranscoding,
            needsVideoTranscoding: analysis.needsVideoTranscoding
        });
        
        // If no transcoding needed, redirect to the original direct stream endpoint
        if (!analysis.needsAudioTranscoding && !analysis.needsVideoTranscoding) {
            console.log(`✅ No transcoding needed, redirecting to direct stream`);
            return res.redirect(`http://localhost:5000/api/stream/${movieId}`);
        }
        
        // Set headers for streaming
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        console.log(`🔄 Starting smart transcoding...`);
        
        // Create ffmpeg command with optimized settings
        let command = ffmpeg(filePath)
            .format('mp4')
            .outputOptions([
                '-movflags', 'frag_keyframe+empty_moov+faststart',
                '-frag_duration', '1000000',
                '-min_frag_duration', '1000000'
            ]);
        
        // Smart video handling
        if (analysis.needsVideoTranscoding) {
            console.log(`🎥 Transcoding video to H.264`);
            command = command
                .videoCodec('libx264')
                .outputOptions([
                    '-preset', 'veryfast',
                    '-crf', '23'
                ]);
        } else {
            console.log(`🎥 Copying video stream (no transcoding needed)`);
            command = command.videoCodec('copy');
        }
        
        // Smart audio handling
        if (analysis.needsAudioTranscoding) {
            console.log(`🔊 Transcoding audio to AAC`);
            command = command
                .audioCodec('aac')
                .audioBitrate('128k')
                .audioChannels(2)
                .outputOptions([
                    '-af', 'aresample=async=1000'  // Handle audio sync issues
                ]);
        } else {
            console.log(`🔊 Copying audio stream (no transcoding needed)`);
            command = command.audioCodec('copy');
        }
        
        // Track if the process is running
        let isProcessing = true;
        let ffmpegProcess = null;
        const processId = `${movieId}_${Date.now()}`;
        
        // Handle client disconnect - multiple event handlers for robustness
        const cleanup = () => {
            if (isProcessing && ffmpegProcess) {
                console.log(`🛑 Client disconnected, killing ffmpeg process for: ${path.basename(filePath)} (ID: ${processId})`);
                isProcessing = false;
                try {
                    ffmpegProcess.kill('SIGKILL');
                    activeProcesses.delete(processId);
                } catch (killError) {
                    console.warn(`⚠️  Error killing process ${processId}:`, killError.message);
                }
            }
        };

        req.on('close', cleanup);
        req.on('aborted', cleanup);
        res.on('close', cleanup);
        res.on('finish', () => {
            isProcessing = false;
            activeProcesses.delete(processId);
        });
        
        // Start streaming
        command
            .on('start', (commandLine) => {
                console.log(`▶️  FFmpeg started for ${path.basename(filePath)} (ID: ${processId}): ${commandLine}`);
                ffmpegProcess = command;
                activeProcesses.set(processId, {
                    movieId,
                    fileName: path.basename(filePath),
                    startTime: new Date(),
                    process: ffmpegProcess
                });
            })
            .on('progress', (progress) => {
                // Only log every 30 seconds to reduce spam and check if still processing
                if (!isProcessing) {
                    console.log(`🛑 Process ${processId} marked for cleanup, stopping progress reports`);
                    return;
                }
                if (progress.timemark && (
                    progress.timemark.includes(':00') || 
                    progress.timemark.includes(':30')
                )) {
                    console.log(`📈 Progress for ${path.basename(filePath)} (${processId}): ${progress.timemark} (${progress.percent ? progress.percent.toFixed(1) : 'N/A'}%)`);
                }
            })
            .on('error', (err) => {
                isProcessing = false;
                activeProcesses.delete(processId);
                console.error(`❌ FFmpeg error for ${path.basename(filePath)} (${processId}):`, err.message);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Transcoding failed', details: err.message });
                }
            })
            .on('end', () => {
                isProcessing = false;
                activeProcesses.delete(processId);
                console.log(`✅ Transcoding completed for ${path.basename(filePath)} (${processId})`);
            })
            .pipe(res, { end: true });
            
    } catch (error) {
        console.error(`❌ Error in transcoding:`, error);
        res.status(500).json({ error: 'Failed to analyze or transcode file', details: error.message });
    }
});

/**
 * Movie codec analysis endpoint
 */
app.get('/analyze/:movieId', async (req, res) => {
    const { filePath } = req.query;
    
    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Movie file not found' });
    }
    
    try {
        const analysis = await analyzeCodecRequirements(filePath);
        res.json(analysis);
    } catch (error) {
        console.error(`❌ Error analyzing file:`, error);
        res.status(500).json({ error: 'Failed to analyze file', details: error.message });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'Smart Transcoding Service', 
        port: PORT,
        ffmpeg: ffmpegPath,
        ffprobe: ffprobePath,
        activeProcesses: activeProcesses.size
    });
});

/**
 * Process monitoring endpoint
 */
app.get('/processes', (req, res) => {
    const processes = Array.from(activeProcesses.entries()).map(([id, info]) => ({
        id,
        movieId: info.movieId,
        fileName: info.fileName,
        startTime: info.startTime,
        duration: Math.round((new Date() - info.startTime) / 1000) + 's'
    }));
    
    res.json({
        count: activeProcesses.size,
        processes
    });
});

/**
 * Kill all processes endpoint (emergency cleanup)
 */
app.post('/kill-all', (req, res) => {
    console.log(`🚨 Emergency: Killing all ${activeProcesses.size} active processes`);
    
    let killedCount = 0;
    for (const [id, info] of activeProcesses.entries()) {
        try {
            info.process.kill('SIGKILL');
            activeProcesses.delete(id);
            killedCount++;
            console.log(`💀 Killed process ${id} (${info.fileName})`);
        } catch (error) {
            console.warn(`⚠️  Failed to kill process ${id}:`, error.message);
        }
    }
    
    res.json({
        message: `Killed ${killedCount} processes`,
        remaining: activeProcesses.size
    });
});

/**
 * Kill specific process endpoint
 */
app.post('/kill/:processId', (req, res) => {
    const { processId } = req.params;
    const info = activeProcesses.get(processId);
    
    if (!info) {
        return res.status(404).json({ error: 'Process not found' });
    }
    
    try {
        info.process.kill('SIGKILL');
        activeProcesses.delete(processId);
        console.log(`💀 Killed process ${processId} (${info.fileName})`);
        res.json({ message: `Process ${processId} killed successfully` });
    } catch (error) {
        console.warn(`⚠️  Failed to kill process ${processId}:`, error.message);
        res.status(500).json({ error: 'Failed to kill process', details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🎬 Smart Transcoding Service running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`👁️  Process monitor: http://localhost:${PORT}/processes`);
});

// Periodic cleanup task - check for orphaned processes every 5 minutes
setInterval(() => {
    if (activeProcesses.size > 0) {
        console.log(`🧹 Cleanup check: ${activeProcesses.size} active processes`);
        
        // Check for processes older than 30 minutes (potential orphans)
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
        
        for (const [id, info] of activeProcesses.entries()) {
            if (info.startTime.getTime() < thirtyMinutesAgo) {
                console.warn(`⚠️  Found potentially orphaned process ${id} (${info.fileName}), running for ${Math.round((Date.now() - info.startTime.getTime()) / 1000 / 60)} minutes`);
                try {
                    info.process.kill('SIGTERM'); // Try graceful kill first
                    setTimeout(() => {
                        if (activeProcesses.has(id)) {
                            console.log(`💀 Force killing orphaned process ${id}`);
                            info.process.kill('SIGKILL');
                            activeProcesses.delete(id);
                        }
                    }, 5000);
                } catch (error) {
                    console.warn(`⚠️  Failed to clean up orphaned process ${id}:`, error.message);
                    activeProcesses.delete(id); // Remove from tracking anyway
                }
            }
        }
    }
}, 5 * 60 * 1000); // Every 5 minutes

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    
    // Kill all active processes
    for (const [id, info] of activeProcesses.entries()) {
        try {
            info.process.kill('SIGKILL');
            console.log(`💀 Shutdown: Killed process ${id}`);
        } catch (error) {
            console.warn(`⚠️  Error killing process ${id} during shutdown:`, error.message);
        }
    }
    
    process.exit(0);
});
