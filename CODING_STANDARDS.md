# Coding Standards

This document defines the coding standards and conventions for the NestJS Zero project. Following these standards ensures consistency, readability, and maintainability across the codebase.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [Naming Conventions](#naming-conventions)
- [File and Directory Structure](#file-and-directory-structure)
- [Code Organization](#code-organization)
- [Formatting Rules](#formatting-rules)
- [Import/Export Standards](#importexport-standards)
- [Comments and Documentation](#comments-and-documentation)

## General Principles

### Code Quality Principles

1. **Readability**: Code should be self-documenting and easy to understand
2. **Consistency**: Follow established patterns throughout the codebase
3. **Simplicity**: Prefer simple, straightforward solutions
4. **DRY (Don't Repeat Yourself)**: Avoid code duplication
5. **SOLID Principles**: Follow SOLID design principles
6. **Single Responsibility**: Each class/function should have one responsibility

### Performance Considerations

- Avoid premature optimization
- Use appropriate data structures
- Consider memory usage in loops and large datasets
- Use async/await for I/O operations

## TypeScript Standards

### Type Definitions

```typescript
// ✅ Good: Explicit types for public APIs
interface CreateUserRequest {
  name: string;
  email: string;
  age?: number;
}

// ✅ Good: Use union types appropriately
type UserStatus = 'active' | 'inactive' | 'pending';

// ✅ Good: Generic types for reusability
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// ❌ Bad: Using 'any' type
function processData(data: any): any {
  return data;
}

// ✅ Good: Proper typing
function processData<T>(data: T): T {
  return data;
}
```

### Interface vs Type

- Use **interfaces** for object shapes that might be extended
- Use **type aliases** for unions, primitives, and computed types

```typescript
// ✅ Good: Interface for extensible object shapes
interface User {
  id: number;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// ✅ Good: Type alias for unions
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
```

### Strict TypeScript Configuration

Our `tsconfig.json` enforces:

- `strictNullChecks: true`
- `forceConsistentCasingInFileNames: true`
- `noImplicitAny: false` (project-specific setting)

## Naming Conventions

### Files and Directories

```
// ✅ Good: Kebab-case for files
user-profile.controller.ts
email-notification.service.ts
create-user.dto.ts

// ✅ Good: Lowercase for directories
src/user/
src/auth/
src/common/utils/

// ❌ Bad: Mixed case
UserProfile.controller.ts
src/User/
```

### Classes

```typescript
// ✅ Good: PascalCase for classes
export class UserController {
  // ...
}

export class EmailNotificationService {
  // ...
}

export class CreateUserDto {
  // ...
}

// ❌ Bad: Other cases
export class userController {
  // ...
}
```

### Methods and Variables

```typescript
// ✅ Good: camelCase for methods and variables
class UserService {
  private readonly userRepository: UserRepository;

  async findUserById(userId: number): Promise<User> {
    const foundUser = await this.userRepository.findOne(userId);
    return foundUser;
  }

  private validateUserData(userData: CreateUserDto): boolean {
    // validation logic
    return true;
  }
}

// ❌ Bad: Other cases
async find_user_by_id(user_id: number) {
  // ...
}
```

### Constants

```typescript
// ✅ Good: SCREAMING_SNAKE_CASE for constants
export const MAX_FILE_SIZE = 1024 * 1024; // 1MB
export const DEFAULT_PAGE_SIZE = 20;
export const API_ENDPOINTS = {
  USERS: '/api/users',
  AUTH: '/api/auth',
} as const;

// ❌ Bad: Other cases
const maxFileSize = 1024 * 1024;
```

### Enums

```typescript
// ✅ Good: PascalCase for enum names, PascalCase for values
enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
}

enum HttpStatusCode {
  Ok = 200,
  BadRequest = 400,
  NotFound = 404,
}
```

## File and Directory Structure

### NestJS Module Structure

```
src/
├── user/                          # Feature module (current)
│   ├── dto/                       # Data Transfer Objects
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/                  # Domain entities
│   │   └── user.entity.ts
│   ├── user.controller.ts         # Controller
│   ├── user.controller.spec.ts    # Controller tests
│   ├── user.service.ts            # Service
│   ├── user.service.spec.ts       # Service tests
│   └── user.module.ts             # Module definition
├── common/                        # Shared utilities (future)
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
├── config/                        # Configuration (future)
│   └── database.config.ts
├── app.controller.ts              # Root controller
├── app.controller.spec.ts         # Root controller tests
├── app.module.ts                  # Root module
├── app.service.ts                 # Root service
└── main.ts                        # Application entry point
```

### File Naming Patterns

- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Modules**: `*.module.ts`
- **DTOs**: `*.dto.ts`
- **Entities**: `*.entity.ts`
- **Interfaces**: `*.interface.ts`
- **Guards**: `*.guard.ts`
- **Pipes**: `*.pipe.ts`
- **Filters**: `*.filter.ts`
- **Interceptors**: `*.interceptor.ts`
- **Decorators**: `*.decorator.ts`
- **Tests**: `*.spec.ts` (unit), `*.e2e-spec.ts` (e2e)

## Code Organization

### Class Structure Order

```typescript
// Current project example (note: uses 'user' not 'users')
@Controller('user')
export class UserController {
  // 1. Constructor (current implementation is simpler)
  constructor(private readonly userService: UserService) {}

  // 2. Public methods (HTTP endpoints)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
}

// Enhanced example with logging and async/await
@Controller('users')
export class EnhancedUserController {
  private readonly logger = new Logger(EnhancedUserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log('Creating new user');
    return this.userService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }
}
```

### Import Organization

```typescript
// 1. Node.js built-in modules
import { join } from 'path';

// 2. Third-party libraries
import { Controller, Get, Post, Body } from '@nestjs/common';
import { IsEmail, IsString } from 'class-validator';

// 3. Internal modules (absolute imports)
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

// 4. Relative imports (if necessary)
import { validateEmail } from '../utils/validation.util';
```

## Formatting Rules

### Prettier Configuration

Our project uses Prettier with these settings (defined in `.prettierrc`):

- Single quotes for strings (`"singleQuote": true`)
- Trailing commas where valid (`"trailingComma": "all"`)
- 2-space indentation (default)
- Line width: 80 characters (default)

### Code Formatting Examples

```typescript
// ✅ Good: Proper formatting
const userConfig = {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true,
  },
};

// ✅ Good: Method chaining
const result = await this.userRepository
  .createQueryBuilder('user')
  .where('user.email = :email', { email })
  .andWhere('user.isActive = :isActive', { isActive: true })
  .getOne();

// ✅ Good: Array formatting
const permissions = ['user:read', 'user:write', 'user:delete'];
```

### ESLint Rules

Key ESLint rules enforced:

- `@typescript-eslint/no-explicit-any: off` (project-specific)
- `@typescript-eslint/no-floating-promises: warn`
- `@typescript-eslint/no-unsafe-argument: warn`

## Import/Export Standards

### Export Patterns

```typescript
// ✅ Good: Named exports for utilities
export const validateEmail = (email: string): boolean => {
  // validation logic
  return true;
};

export const formatDate = (date: Date): string => {
  // formatting logic
  return date.toISOString();
};

// ✅ Good: Default export for main class
export default class UserService {
  // ...
}

// ✅ Good: Re-exports for barrel files
export { UserController } from './user.controller';
export { UserService } from './user.service';
export { UserModule } from './user.module';
```

### Barrel Exports (index.ts)

```typescript
// src/user/index.ts
export * from './user.controller';
export * from './user.service';
export * from './user.module';
export * from './dto';
export * from './entities';
```

## Comments and Documentation

### JSDoc Comments

```typescript
/**
 * Service responsible for user management operations
 */
@Injectable()
export class UserService {
  /**
   * Creates a new user with the provided data
   * @param createUserDto - The user data to create
   * @returns Promise<User> - The created user
   * @throws BadRequestException - When validation fails
   * @throws ConflictException - When user already exists
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Implementation
  }
}
```

### Inline Comments

```typescript
// ✅ Good: Explain complex business logic
const calculateDiscount = (user: User, order: Order): number => {
  // Premium users get 15% discount on orders over $100
  if (user.isPremium && order.total > 100) {
    return order.total * 0.15;
  }

  // Regular users get 5% discount on orders over $50
  if (order.total > 50) {
    return order.total * 0.05;
  }

  return 0;
};

// ❌ Bad: Obvious comments
const userId = 1; // Set user ID to 1
```

### TODO Comments

```typescript
// TODO: Implement caching for user data
// FIXME: Handle edge case when user has no email
// NOTE: This is a temporary solution until API v2 is ready
```

## Best Practices Summary

1. **Use TypeScript features**: Leverage types, interfaces, and generics
2. **Follow NestJS conventions**: Use decorators, dependency injection, and modules properly (see [Architecture Guidelines](ARCHITECTURE.md))
3. **Write self-documenting code**: Use descriptive names and clear structure
4. **Keep functions small**: Single responsibility principle
5. **Use async/await**: Prefer over Promises for readability
6. **Handle errors properly**: Use appropriate HTTP exceptions (see [Technical Standards](TECHNICAL_STANDARDS.md#error-handling))
7. **Validate input**: Use DTOs with class-validator (see [Technical Standards](TECHNICAL_STANDARDS.md#input-validation))
8. **Test your code**: Write unit and integration tests (see [Technical Standards](TECHNICAL_STANDARDS.md#testing-standards))
9. **Use linting tools**: ESLint and Prettier are configured
10. **Document public APIs**: Use JSDoc for public methods

## Related Documentation

- **[Architecture Guidelines](ARCHITECTURE.md)** - Project structure and design patterns
- **[Technical Standards](TECHNICAL_STANDARDS.md)** - Implementation best practices
- **[Contributing Guidelines](CONTRIBUTING.md)** - Development workflow and code review process

## Quick Reference

### Current Project Structure

```
src/user/
├── dto/create-user.dto.ts     # ✅ Has validation decorators
├── dto/update-user.dto.ts     # ✅ Extends PartialType
├── entities/user.entity.ts    # ✅ Simple interface
├── user.controller.ts         # ✅ Uses @Controller('user')
├── user.service.ts           # ✅ In-memory implementation
└── user.module.ts            # ✅ Standard module structure
```

### Key Configuration Files

- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint rules
- `.prettierrc` - Code formatting
- `package.json` - Scripts and dependencies

---

These standards should be followed consistently across the project. When in doubt, refer to the existing codebase for examples or ask for clarification during code review (see [Contributing Guidelines](CONTRIBUTING.md#code-review-requirements)).
