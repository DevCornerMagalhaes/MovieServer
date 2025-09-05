# Changelog

All notable changes to MovieServer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-09-05

### Added
- 🎬 **Core Streaming Features**
  - Netflix-like web interface with React + TypeScript
  - ASP.NET Core backend with REST API
  - Direct file streaming for compatible formats
  - VLC mobile app integration

- 🔧 **Smart Transcoding System**
  - Node.js transcoding service with FFmpeg
  - Automatic codec analysis and detection
  - Audio-only transcoding for MKV files with video passthrough
  - HEVC (H.265) support with web compatibility
  - Smart streaming decisions based on codec analysis

- 🐳 **Docker Containerization**
  - Multi-service Docker Compose setup
  - Health checks for all services
  - Production-ready container configuration
  - Automatic service dependencies and orchestration

- 🔐 **Security & Configuration**
  - Environment variable-based configuration
  - Secure password management with `.env` files
  - JWT-based authentication system
  - Configurable admin credentials
  - RabbitMQ with secure credentials

- 📊 **Process Management & Monitoring**
  - Transcoding process cleanup on client disconnect
  - Active process monitoring and tracking
  - Emergency process termination endpoints
  - Periodic orphaned process cleanup
  - PowerShell and Bash monitoring scripts

- 🔄 **Message Queue Integration**
  - RabbitMQ for background task processing
  - Event-driven architecture support
  - Reliable message delivery

### Technical Features
- **Frontend**: React 18, TypeScript, responsive design
- **Backend**: .NET 8, ASP.NET Core, Entity Framework ready
- **Transcoding**: Node.js 20, fluent-ffmpeg, Alpine Linux
- **Database**: Ready for SQL Server/PostgreSQL integration
- **Caching**: Nginx reverse proxy for static assets
- **Monitoring**: Health checks, process tracking, logging

### Infrastructure
- **Development Tools**: PowerShell and Bash scripts for development
- **Documentation**: Comprehensive README with setup instructions
- **Configuration**: Template-based environment configuration
- **Testing**: Health endpoints and integration testing support

### Supported Formats
- **Video**: MP4, MKV, AVI, MOV, WMV (with smart transcoding)
- **Codecs**: H.264, H.265/HEVC, VP8, VP9, AV1
- **Audio**: AAC, MP3, AC3, DTS (with automatic transcoding)

[Unreleased]: https://github.com/your-username/MovieServerReact/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/MovieServerReact/releases/tag/v1.0.0
