# Contributing to MovieServer

Thank you for your interest in contributing to MovieServer! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Bugs
- Use the GitHub Issues tab to report bugs
- Include detailed reproduction steps
- Provide system information (OS, Docker version, etc.)
- Include relevant log files

### Feature Requests
- Check existing issues to avoid duplicates
- Clearly describe the feature and its benefits
- Consider implementation complexity and maintenance

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
6. **Push to your fork**
7. **Create a Pull Request**

## 🔧 Development Setup

### Prerequisites
- Docker & Docker Compose
- .NET 8 SDK (for local development)
- Node.js 18+ (for local development)
- FFmpeg (for transcoding)

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/MovieServerReact.git
cd MovieServerReact

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Start development environment
docker-compose up -d
```

### Testing Changes
- Test all Docker services: `docker-compose ps`
- Verify frontend: http://localhost:3000
- Test API: http://localhost:5000/api/movies
- Check transcoding: http://localhost:5001/health

## 🎯 Code Guidelines

### Backend (.NET)
- Follow C# coding standards
- Use dependency injection
- Include XML documentation
- Write unit tests for new features

### Frontend (React)
- Use TypeScript
- Follow React best practices
- Include PropTypes or TypeScript interfaces
- Test components

### Transcoding Service (Node.js)
- Use modern JavaScript/ES6+
- Include error handling
- Add logging for debugging
- Consider performance impact

## 🧪 Testing

### Running Tests
```bash
# Backend tests
dotnet test backend.Tests/

# Frontend tests (if implemented)
cd frontend && npm test

# Integration tests
docker-compose up -d && curl http://localhost:5000/api/movies
```

### Test Requirements
- All new features should include tests
- Maintain or improve code coverage
- Test edge cases and error scenarios

## 📝 Documentation

- Update README.md for new features
- Add inline code documentation
- Update API documentation if relevant
- Include configuration examples

## 🔒 Security Considerations

- Never commit secrets or passwords
- Use environment variables for sensitive data
- Follow security best practices
- Report security issues privately

## 🚀 Pull Request Process

1. **Ensure CI passes** (when implemented)
2. **Update documentation** as needed
3. **Add tests** for new functionality
4. **Keep PR focused** - one feature per PR
5. **Write clear commit messages**
6. **Respond to review feedback**

### PR Template
```
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No sensitive data committed
```

## 💬 Community Guidelines

- Be respectful and constructive
- Help newcomers
- Stay on topic in discussions
- Follow the code of conduct

## 📞 Contact

- GitHub Issues: For bugs and feature requests
- GitHub Discussions: For questions and community chat

## 🎉 Recognition

Contributors will be recognized in the README.md file and release notes.

Thank you for making MovieServer better! 🎬
