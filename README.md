# NestJS Zero

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A modern, scalable NestJS application built with TypeScript, following best practices and industry standards.</p>

## Description

NestJS Zero is a production-ready NestJS application template that demonstrates modern web development practices. Built with TypeScript and following SOLID principles, this project serves as a foundation for building scalable server-side applications.

### Key Features

- **Modern Architecture**: Clean architecture with proper separation of concerns
- **Type Safety**: Full TypeScript support with strict type checking
- **Validation**: Input validation using class-validator and DTOs
- **Testing**: Comprehensive unit and e2e testing setup
- **Code Quality**: ESLint and Prettier configuration for consistent code style
- **Documentation**: Extensive documentation and coding standards

## Project Guidelines

This project follows comprehensive guidelines to ensure code quality, consistency, and maintainability:

- **[Contributing Guidelines](CONTRIBUTING.md)** - Development workflow, Git practices, and contribution process
- **[Coding Standards](CODING_STANDARDS.md)** - Code style, formatting rules, and naming conventions
- **[Architecture Guidelines](ARCHITECTURE.md)** - Project structure, module organization, and design patterns
- **[Technical Standards](TECHNICAL_STANDARDS.md)** - Error handling, logging, API design, and security practices

## Project Structure

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application entry point
├── user/                      # User feature module
│   ├── dto/                   # Data Transfer Objects
│   ├── entities/              # Domain entities
│   ├── user.controller.ts     # HTTP request handlers
│   ├── user.service.ts        # Business logic
│   └── user.module.ts         # Feature module definition
├── common/                    # Shared utilities (future)
└── config/                    # Configuration files (future)
test/                          # End-to-end tests
```

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd nestjs-zero
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run start:dev

# Start development server with debug mode
npm run start:debug

# Build the application
npm run build

# Start production server
npm run start:prod
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

## API Endpoints

The application provides the following REST API endpoints:

### Users

- `GET /user` - Get all users
- `GET /user/:id` - Get user by ID
- `POST /user` - Create a new user
- `PATCH /user/:id` - Update user by ID
- `DELETE /user/:id` - Delete user by ID

### Example Usage

```bash
# Create a user
curl -X POST http://localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Get all users
curl http://localhost:3000/user

# Get user by ID
curl http://localhost:3000/user/1
```

## Contributing

We welcome contributions to this project! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Development workflow and Git practices
- Code review process
- Testing requirements
- Documentation standards

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our [Coding Standards](CODING_STANDARDS.md)
4. Write tests for your changes
5. Run the test suite: `npm run test`
6. Submit a pull request

## Deployment

For production deployment, build the application and run it:

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

For more deployment options and best practices, check out the [NestJS deployment documentation](https://docs.nestjs.com/deployment).

## Technology Stack

This project is built with:

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript
- **[class-validator](https://github.com/typestack/class-validator)** - Validation library
- **[Jest](https://jestjs.io/)** - Testing framework
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

## Learning Resources

### NestJS Resources

- [NestJS Documentation](https://docs.nestjs.com) - Official documentation
- [NestJS Courses](https://courses.nestjs.com/) - Official video courses
- [NestJS Discord](https://discord.gg/G7Qnnhy) - Community support

### Project-Specific Resources

- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute to this project
- [Coding Standards](CODING_STANDARDS.md) - Code style and conventions
- [Architecture Guidelines](ARCHITECTURE.md) - Project structure and patterns
- [Technical Standards](TECHNICAL_STANDARDS.md) - Technical best practices

## Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing code improvements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using [NestJS](https://nestjs.com/)
