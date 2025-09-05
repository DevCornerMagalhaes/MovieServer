# MovieServer 🎬

A Netflix-like streaming server that transforms your home PC into a personal media streaming platform. Access your movie collection from anywhere using VLC on mobile or any web browser.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-supported-blue.svg)](https://www.docker.com/)
[![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.0-green.svg)](https://nodejs.org/)

## ✨ Features

### 🎥 **Smart Streaming**
- **Direct Streaming**: Compatible formats (H.264 + AAC) stream directly without transcoding
- **Smart Transcoding**: Automatic conversion for incompatible formats using FFmpeg
- **HEVC Support**: H.265 videos automatically transcoded for web browsers
- **Audio Optimization**: MKV files with compatible video but incompatible audio get audio-only transcoding

### 📱 **Multi-Platform Access**
- **Web Interface**: Modern React-based Netflix-like UI
- **VLC Mobile**: Direct streaming URLs for VLC on Android/iOS
- **Any Device**: Works with any device that supports HTTP streaming

### 🔧 **Advanced Technical Features**
- **Codec Analysis**: Automatic detection of video/audio codecs
- **Process Management**: Automatic cleanup of transcoding processes
- **Health Monitoring**: Built-in health checks and process monitoring
- **Resource Management**: CPU usage optimization and orphaned process cleanup

### 🐳 **Production Ready**
- **Docker Containerized**: Complete multi-service setup
- **Environment Configured**: Secure credential management
- **Message Queue**: RabbitMQ for background processing
- **Load Balancing**: Nginx reverse proxy support

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Windows PC with PowerShell (or Linux/Mac with equivalent tools)

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/MovieServerReact.git
cd MovieServerReact
```

### 2. Configure Environment

Create your `.env` file from the template:

```bash
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
# Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# RabbitMQ
RABBITMQ_DEFAULT_USER=movieuser
RABBITMQ_DEFAULT_PASS=your_rabbitmq_password_here

# Services
BACKEND_PORT=5000
FRONTEND_PORT=3000
TRANSCODING_PORT=3001
RABBITMQ_PORT=5672
```

### 3. Add Your Movies

Place your movie files in the `movies/` directory:
```
movies/
├── Action/
│   ├── Movie1.mp4
│   └── Movie2.mkv
├── Comedy/
│   └── Funny Movie.avi
└── Drama/
    └── Serious Film.mov
```

### 4. Start the Server

```bash
docker-compose up -d
```

### 5. Access Your Movies

- **Web Interface**: http://localhost:3000
- **VLC Mobile**: Use URLs like `http://your-pc-ip:5000/api/movies/stream/Movie1.mp4`

## 📋 Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   React Frontend│◄──►│ ASP.NET Core API │◄──►│ Node.js Transcoding │
│   (Port 3000)   │    │   (Port 5000)    │    │    (Port 3001)      │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    RabbitMQ     │
                       │   (Port 5672)   │
                       └─────────────────┘
```

### Services

1. **Frontend (React + TypeScript)**
   - Netflix-like interface
   - Codec information display
   - Responsive design for all devices

2. **Backend (ASP.NET Core)**
   - RESTful API
   - File serving and streaming
   - Authentication and authorization

3. **Transcoding Service (Node.js)**
   - FFmpeg-powered video conversion
   - Smart codec detection
   - Process management and cleanup

4. **Message Queue (RabbitMQ)**
   - Background task processing
   - Inter-service communication

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `password123` |
| `RABBITMQ_DEFAULT_USER` | RabbitMQ username | `guest` |
| `RABBITMQ_DEFAULT_PASS` | RabbitMQ password | `guest` |
| `BACKEND_PORT` | Backend API port | `5000` |
| `FRONTEND_PORT` | Frontend web port | `3000` |
| `TRANSCODING_PORT` | Transcoding service port | `3001` |

### Supported Formats

#### ✅ **Direct Streaming** (No transcoding needed)
- **Containers**: MP4 with H.264 video + AAC audio
- **Bandwidth**: Minimal server resources required

#### 🔄 **Smart Transcoding** (Automatic conversion)
- **Video**: MKV, AVI, MOV, WMV, HEVC/H.265
- **Audio**: Any audio format gets converted to AAC
- **Strategy**: Audio-only transcoding when possible to save CPU

## 📱 Using with VLC Mobile

### Android/iOS VLC App

1. Open VLC on your mobile device
2. Go to "Media" or "Network Stream"
3. Enter the URL: `http://YOUR_PC_IP:5000/api/movies/stream/filename.ext`
4. Replace `YOUR_PC_IP` with your PC's local IP address
5. Replace `filename.ext` with your movie filename

### Finding Your PC's IP Address

**Windows:**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}
```

**Linux/Mac:**
```bash
ip addr show | grep inet | grep -v 127.0.0.1
```

## 🔧 Development

### Prerequisites for Development
- .NET 8 SDK
- Node.js 20+
- Docker Desktop
- Visual Studio or VS Code

### Development Setup

1. **Start dependencies:**
   ```bash
   docker-compose up rabbitmq -d
   ```

2. **Run backend:**
   ```bash
   cd Backend
   dotnet run
   ```

3. **Run frontend:**
   ```bash
   cd Frontend
   npm install
   npm start
   ```

4. **Run transcoding service:**
   ```bash
   cd TranscodingService
   npm install
   npm start
   ```

### Monitoring and Debugging

#### Health Checks
- Backend: http://localhost:5000/health
- Transcoding: http://localhost:3001/health
- Active processes: http://localhost:3001/processes

#### Process Management
Emergency process cleanup:
```bash
# Kill all transcoding processes
curl -X POST http://localhost:3001/kill-all

# Or use the monitoring script
./Scripts/monitor_transcoding.ps1
```

## 🐳 Docker Details

### Services Overview

```yaml
services:
  backend:      # ASP.NET Core API
  frontend:     # React application  
  transcoding:  # Node.js FFmpeg service
  rabbitmq:     # Message queue
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Stop everything
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

### Volume Mounts

- `./movies:/app/movies` - Your movie collection
- `./Backend:/app` - Backend source code (development)
- `./Frontend:/app` - Frontend source code (development)

## 📊 Performance & Optimization

### System Requirements

**Minimum:**
- 4GB RAM
- 2-core CPU
- 10GB free storage

**Recommended:**
- 8GB+ RAM (for 4K transcoding)
- 4+ core CPU (for multiple simultaneous streams)
- SSD storage for better file I/O

### Performance Tips

1. **Direct Streaming**: Use H.264 + AAC in MP4 containers when possible
2. **CPU Usage**: Monitor transcoding processes with the included scripts
3. **Storage**: Store frequently accessed movies on faster drives
4. **Network**: Use wired connection for 4K streaming

## � Security Considerations

⚠️ **Important Security Notes:**

1. **Network Access**: This server is designed for home network use
2. **Authentication**: Change default passwords in `.env` file
3. **Firewall**: Configure your firewall appropriately for external access
4. **Content Rights**: Ensure you own or have rights to all content you serve

### Securing for Internet Access

If exposing to the internet:
1. Use HTTPS with proper certificates
2. Implement rate limiting
3. Use VPN for remote access instead of direct exposure
4. Regular security updates

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to:

- Set up the development environment
- Submit bug reports and feature requests  
- Create pull requests
- Follow coding standards

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Follow the coding standards in CONTRIBUTING.md
5. Submit a pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Copyright Notice

**Important**: This software is for personal use with content you own or have rights to use. Users are responsible for ensuring they comply with all applicable copyright laws and licensing requirements for any content they serve through this application.

## 📞 Support

### Common Issues

**Movies not appearing:**
- Check that files are in the `movies/` directory
- Verify file permissions
- Check Docker volume mounts

**Transcoding not working:**
- Verify FFmpeg is available in container
- Check transcoding service logs: `docker-compose logs transcoding`
- Use monitoring script to check processes

**Can't connect from mobile:**
- Verify firewall settings
- Check your PC's IP address
- Ensure services are running: `docker-compose ps`

### Getting Help

1. Check the [Issues](https://github.com/your-username/MovieServerReact/issues) page
2. Review logs with: `docker-compose logs [service-name]`
3. Use health check endpoints for diagnostics
4. Create a new issue with detailed error information

## 🎯 Roadmap

### Planned Features

- [ ] User management and multiple profiles
- [ ] Subtitle support (.srt files)
- [ ] Playlist and favorite movies
- [ ] Mobile app development
- [ ] 4K streaming optimizations
- [ ] Content metadata integration (TMDB/IMDB)
- [ ] Download for offline viewing
- [ ] Chromecast/AirPlay support

### Technical Improvements

- [ ] Database integration for metadata
- [ ] Caching layer for improved performance  
- [ ] Advanced codec analysis
- [ ] Progressive web app (PWA) features
- [ ] Advanced security features
- [ ] Automated testing suite

## 🌟 Acknowledgments

- [FFmpeg](https://ffmpeg.org/) for video processing
- [React](https://reactjs.org/) for the frontend framework
- [ASP.NET Core](https://dotnet.microsoft.com/) for the backend API
- [RabbitMQ](https://www.rabbitmq.com/) for message queuing
- [Docker](https://www.docker.com/) for containerization

---

Made with ❤️ for home media streaming. Transform your PC into your personal Netflix! 🍿
