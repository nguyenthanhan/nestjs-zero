# Contributing to NestJS Zero

Welcome to the NestJS Zero project! This document provides guidelines for contributing to the project, including development workflow, code review processes, and documentation standards.

## Table of Contents

- [Development Workflow](#development-workflow)
- [Git Workflow](#git-workflow)
- [Commit Message Format](#commit-message-format)
- [Code Review Requirements](#code-review-requirements)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Pull Request Process](#pull-request-process)

## Development Workflow

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Git

### Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd nestjs-zero
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment setup (optional):

   ```bash
   # Copy environment template (when available)
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start development server:
   ```bash
   npm run start:dev
   ```

The application will be available at `http://localhost:3000`.

### Development Commands

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Git Workflow

### Branching Strategy

We follow a **Git Flow** branching strategy:

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature branches (`feature/user-authentication`)
- **bugfix/**: Bug fix branches (`bugfix/user-validation-error`)
- **hotfix/**: Critical fixes for production (`hotfix/security-patch`)
- **release/**: Release preparation branches (`release/v1.2.0`)

### Branch Naming Conventions

- Feature branches: `feature/short-description` or `feature/TICKET-123-short-description`
- Bug fix branches: `bugfix/short-description` or `bugfix/TICKET-123-short-description`
- Hotfix branches: `hotfix/short-description` or `hotfix/TICKET-123-short-description`
- Release branches: `release/v1.2.0`

### Working with Branches

1. Create a new branch from `develop`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit regularly
3. Push your branch and create a pull request
4. After review and approval, merge into `develop`

## Commit Message Format

We follow the **Conventional Commits** specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries

### Examples

```
feat(user): add user registration endpoint

fix(auth): resolve token validation issue

docs(api): update API documentation for user endpoints

test(user): add unit tests for user service

chore(deps): update dependencies to latest versions
```

### Scope Guidelines

Common scopes in this project:

- `user`: User-related functionality
- `auth`: Authentication and authorization
- `api`: API-related changes
- `config`: Configuration changes
- `deps`: Dependency updates
- `ci`: Continuous integration changes

## Code Review Requirements

### Before Submitting a Pull Request

1. **Self-review**: Review your own code first
2. **Tests**: Ensure all tests pass (`npm run test` and `npm run test:e2e`)
3. **Linting**: Fix all linting issues (`npm run lint`)
4. **Formatting**: Format code (`npm run format`)
5. **Documentation**: Update relevant documentation

### Pull Request Checklist

- [ ] Code follows the project's coding standards
- [ ] All tests pass
- [ ] Code coverage is maintained or improved
- [ ] Documentation is updated (if applicable)
- [ ] Commit messages follow the conventional format
- [ ] No merge conflicts
- [ ] PR description clearly explains the changes

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Peer Review**: At least one team member must review and approve
3. **Testing**: Reviewer should test the changes locally if needed
4. **Documentation Review**: Ensure documentation is accurate and complete

### Review Criteria

- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code clean, readable, and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are there any security concerns?
- **Testing**: Are there adequate tests?
- **Documentation**: Is the code and changes well documented?

## Testing Requirements

### Test Coverage

- **Minimum Coverage**: 80% overall code coverage
- **Critical Paths**: 100% coverage for critical business logic
- **New Features**: All new features must include tests

### Test Types

1. **Unit Tests** (`*.spec.ts`)
   - Test individual functions and methods
   - Mock external dependencies
   - Fast execution

2. **Integration Tests**
   - Test interaction between components
   - Test database operations (when applicable)
   - Test API endpoints

3. **End-to-End Tests** (`*.e2e-spec.ts`)
   - Test complete user workflows
   - Test from HTTP request to response
   - Use test database

### Test Organization

```
src/
├── user/
│   ├── user.controller.ts
│   ├── user.controller.spec.ts    # Unit tests
│   ├── user.service.ts
│   └── user.service.spec.ts       # Unit tests
test/
├── user.e2e-spec.ts              # E2E tests
└── jest-e2e.json                 # E2E test config
```

### Writing Tests

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Test both success and error scenarios
- Use proper mocking for external dependencies

## Documentation Standards

### Code Documentation

1. **JSDoc Comments**: Use for public methods and complex logic

   ```typescript
   /**
    * Creates a new user with the provided data
    * @param createUserDto - The user data to create
    * @returns Promise<User> - The created user
    * @throws NotFoundException - When user creation fails
    */
   async create(createUserDto: CreateUserDto): Promise<User> {
     // implementation
   }
   ```

2. **Inline Comments**: Use sparingly for complex business logic
3. **README Updates**: Update README.md for significant changes
4. **API Documentation**: Document all API endpoints

### Documentation Files

- **README.md**: Project overview and setup instructions
- **CONTRIBUTING.md**: This file - contribution guidelines
- **CODING_STANDARDS.md**: Code style and formatting rules
- **ARCHITECTURE.md**: Project architecture and structure guidelines
- **TECHNICAL_STANDARDS.md**: Technical standards and best practices

### API Documentation

- Document all endpoints with examples
- Include request/response schemas
- Document error responses
- Use OpenAPI/Swagger when possible

## Pull Request Process

### Creating a Pull Request

1. **Title**: Use a clear, descriptive title
2. **Description**: Include:
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Any breaking changes
   - Screenshots (if UI changes)

3. **Labels**: Add appropriate labels (feature, bugfix, documentation, etc.)
4. **Reviewers**: Request review from relevant team members
5. **Linked Issues**: Link to related issues or tickets

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Merging

- Use **Squash and Merge** for feature branches
- Use **Merge Commit** for release branches
- Delete feature branches after merging
- Update local branches after merging

## Development Environment

### Docker Support (Future)

When Docker support is added, you'll be able to run the application using:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run tests in Docker
docker-compose run --rm app npm test

# Run linting in Docker
docker-compose run --rm app npm run lint
```

### IDE Setup

#### VS Code (Recommended)

Install these extensions for the best development experience:

- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint** - Real-time linting
- **Prettier** - Code formatting
- **Jest** - Test runner integration
- **Thunder Client** - API testing (alternative to Postman)

#### VS Code Settings

Add to your `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Continuous Integration (Future)

When CI/CD is implemented, the pipeline will include:

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml (future implementation)
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run build
```

### Quality Gates

- ✅ All tests must pass
- ✅ Code coverage > 80%
- ✅ No ESLint errors
- ✅ Successful build
- ✅ Security audit passes

## Getting Help

- **Documentation**: Check existing documentation first
  - [Architecture Guidelines](ARCHITECTURE.md)
  - [Coding Standards](CODING_STANDARDS.md)
  - [Technical Standards](TECHNICAL_STANDARDS.md)
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Don't hesitate to ask for clarification during reviews

## Code of Conduct

- Be respectful and professional
- Provide constructive feedback
- Help others learn and grow
- Focus on the code, not the person
- Be open to feedback and suggestions

## Quick Links

- 📖 [Project README](README.md)
- 🏗️ [Architecture Guidelines](ARCHITECTURE.md)
- 📝 [Coding Standards](CODING_STANDARDS.md)
- ⚙️ [Technical Standards](TECHNICAL_STANDARDS.md)

---

Thank you for contributing to NestJS Zero! 🚀
