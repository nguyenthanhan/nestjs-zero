# Architecture Guidelines

This document outlines the architectural principles, patterns, and guidelines for the NestJS Zero project. It defines how to structure modules, implement dependency injection, and organize features within the NestJS framework.

## Table of Contents

- [Architectural Principles](#architectural-principles)
- [Project Structure](#project-structure)
- [Module Organization](#module-organization)
- [Dependency Injection Patterns](#dependency-injection-patterns)
- [Controller Guidelines](#controller-guidelines)
- [Service Layer Architecture](#service-layer-architecture)
- [Data Layer Patterns](#data-layer-patterns)
- [Feature Organization](#feature-organization)
- [Cross-Cutting Concerns](#cross-cutting-concerns)

## Architectural Principles

### Core Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Inversion**: Depend on abstractions, not concretions
3. **Single Responsibility**: Each class should have one reason to change
4. **Open/Closed Principle**: Open for extension, closed for modification
5. **Modularity**: Features are organized in self-contained modules
6. **Testability**: Architecture supports easy unit and integration testing

### NestJS-Specific Principles

- **Decorator-Driven**: Use decorators for metadata and configuration
- **Module-Based**: Organize code into feature modules
- **Provider Pattern**: Use providers for dependency injection
- **Guard-Driven Security**: Implement security through guards
- **Pipe-Based Validation**: Use pipes for input validation and transformation

## Project Structure

### High-Level Structure

```
src/
├── app.module.ts              # Root application module
├── main.ts                    # Application entry point
├── common/                    # Shared utilities and components
│   ├── decorators/           # Custom decorators
│   ├── filters/              # Exception filters
│   ├── guards/               # Authentication/authorization guards
│   ├── interceptors/         # Request/response interceptors
│   ├── pipes/                # Validation and transformation pipes
│   ├── middleware/           # Custom middleware
│   └── utils/                # Utility functions
├── config/                   # Configuration modules
│   ├── database.config.ts
│   ├── app.config.ts
│   └── validation.config.ts
├── [feature]/                # Feature modules (user, auth, etc.)
│   ├── dto/                  # Data Transfer Objects
│   ├── entities/             # Domain entities/models
│   ├── interfaces/           # TypeScript interfaces
│   ├── [feature].controller.ts
│   ├── [feature].service.ts
│   ├── [feature].module.ts
│   └── tests/                # Feature-specific tests
└── database/                 # Database-related files
    ├── migrations/
    ├── seeds/
    └── factories/
```

### Layer Responsibilities

```
┌─────────────────────────────────────────┐
│              Presentation Layer          │
│         (Controllers, DTOs)             │
├─────────────────────────────────────────┤
│              Business Layer             │
│            (Services, Guards)           │
├─────────────────────────────────────────┤
│               Data Layer                │
│        (Repositories, Entities)         │
├─────────────────────────────────────────┤
│            Infrastructure Layer         │
│       (Database, External APIs)         │
└─────────────────────────────────────────┘
```

## Module Organization

### Feature Module Structure

```typescript
// user.module.ts
@Module({
  imports: [
    // External modules this feature depends on
    ConfigModule,
    DatabaseModule,
  ],
  controllers: [
    // Controllers for this feature
    UserController,
  ],
  providers: [
    // Services, repositories, and other providers
    UserService,
    UserRepository,
    {
      provide: 'USER_CONFIG',
      useFactory: (configService: ConfigService) => ({
        maxUsers: configService.get('MAX_USERS'),
      }),
      inject: [ConfigService],
    },
  ],
  exports: [
    // Services that other modules can use
    UserService,
  ],
})
export class UserModule {}
```

### Module Types

1. **Feature Modules**: Contain business logic for specific features
2. **Shared Modules**: Contain reusable components across features
3. **Core Module**: Contains singleton services (database, config)
4. **Common Module**: Contains utilities, pipes, guards, etc.

```typescript
// Core module example
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
  ],
  providers: [DatabaseService, LoggerService],
  exports: [DatabaseService, LoggerService],
})
export class CoreModule {}
```

## Dependency Injection Patterns

### Constructor Injection (Preferred)

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
  ) {}
}
```

### Property Injection (When Necessary)

```typescript
@Injectable()
export class UserService {
  @Inject('USER_CONFIG')
  private readonly config: UserConfig;
}
```

### Custom Providers

```typescript
// Factory provider
{
  provide: 'DATABASE_CONNECTION',
  useFactory: async (configService: ConfigService) => {
    return createConnection(configService.get('DATABASE_URL'));
  },
  inject: [ConfigService],
}

// Class provider with custom token
{
  provide: 'USER_REPOSITORY',
  useClass: TypeOrmUserRepository,
}

// Value provider
{
  provide: 'API_CONFIG',
  useValue: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
  },
}
```

## Controller Guidelines

### Controller Structure

```typescript
@Controller('users')
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);
    return this.transformToResponseDto(user);
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserResponseDto> {
    const user = await this.userService.findOne(id);
    return this.transformToResponseDto(user);
  }

  private transformToResponseDto(user: User): UserResponseDto {
    // Transform entity to response DTO
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
```

### Controller Best Practices

1. **Thin Controllers**: Keep business logic in services
2. **DTO Validation**: Use DTOs for input validation
3. **Response Transformation**: Transform entities to response DTOs
4. **Error Handling**: Let global filters handle exceptions
5. **HTTP Status Codes**: Use appropriate status codes
6. **Route Parameters**: Use pipes for parameter validation

## Service Layer Architecture

### Service Structure

```typescript
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 1. Validate business rules
    await this.validateUserCreation(createUserDto);

    // 2. Create user entity
    const user = this.userRepository.create(createUserDto);

    // 3. Save to database
    const savedUser = await this.userRepository.save(user);

    // 4. Emit domain event
    this.eventEmitter.emit('user.created', { user: savedUser });

    // 5. Send welcome email (async)
    this.emailService.sendWelcomeEmail(savedUser.email).catch((error) => {
      this.logger.error('Failed to send welcome email', error);
    });

    return savedUser;
  }

  private async validateUserCreation(
    createUserDto: CreateUserDto,
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
  }
}
```

### Service Best Practices

1. **Business Logic**: Contains core business logic
2. **Transaction Management**: Handle database transactions
3. **Event Emission**: Emit domain events for side effects
4. **Error Handling**: Throw appropriate HTTP exceptions
5. **Logging**: Log important operations and errors
6. **Async Operations**: Handle async operations properly

## Data Layer Patterns

### Repository Pattern

```typescript
// Abstract repository interface
export interface UserRepositoryInterface {
  create(userData: CreateUserDto): User;
  save(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(options?: FindOptions): Promise<User[]>;
  update(id: number, updateData: UpdateUserDto): Promise<User>;
  delete(id: number): Promise<void>;
}

// Implementation
@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  create(userData: CreateUserDto): User {
    return this.repository.create(userData);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  // ... other methods
}
```

### Entity Definition

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
```

## Feature Organization

### Feature Module Template

```typescript
// 1. Module definition
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'USER_REPOSITORY',
      useClass: UserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}

// 2. Controller (presentation layer)
@Controller('users')
export class UserController {
  // HTTP endpoint handlers
}

// 3. Service (business layer)
@Injectable()
export class UserService {
  // Business logic
}

// 4. Repository (data layer)
@Injectable()
export class UserRepository {
  // Data access logic
}

// 5. DTOs (data transfer objects)
export class CreateUserDto {
  // Input validation
}

export class UserResponseDto {
  // Output formatting
}

// 6. Entity (domain model)
@Entity()
export class User {
  // Domain model
}
```

### Inter-Module Communication

```typescript
// Event-driven communication
@Injectable()
export class UserService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.createUser(createUserDto);

    // Emit event for other modules to handle
    this.eventEmitter.emit('user.created', {
      userId: user.id,
      email: user.email,
    });

    return user;
  }
}

// Event listener in another module
@Injectable()
export class NotificationService {
  @OnEvent('user.created')
  async handleUserCreated(payload: { userId: number; email: string }) {
    await this.sendWelcomeNotification(payload.email);
  }
}
```

## Cross-Cutting Concerns

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
```

### Logging Interceptor

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`${method} ${url} - ${responseTime}ms`);
      }),
    );
  }
}
```

### Authentication Guard

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## Architecture Best Practices

1. **Keep modules focused**: Each module should have a single responsibility
2. **Use interfaces**: Define contracts between layers
3. **Implement proper error handling**: Use appropriate HTTP exceptions (see [Technical Standards](TECHNICAL_STANDARDS.md#error-handling))
4. **Follow dependency injection**: Don't create dependencies manually
5. **Use events for decoupling**: Emit events for cross-module communication
6. **Implement proper logging**: Log important operations and errors (see [Technical Standards](TECHNICAL_STANDARDS.md#logging-practices))
7. **Write testable code**: Design for easy unit and integration testing (see [Technical Standards](TECHNICAL_STANDARDS.md#testing-standards))
8. **Use configuration**: Externalize configuration values (see [Technical Standards](TECHNICAL_STANDARDS.md#configuration-management))
9. **Implement security**: Use guards, pipes, and filters appropriately (see [Technical Standards](TECHNICAL_STANDARDS.md#security-practices))
10. **Follow coding standards**: Maintain consistent code style (see [Coding Standards](CODING_STANDARDS.md))
11. **Document your architecture**: Keep this document updated

## Related Documentation

- **[Coding Standards](CODING_STANDARDS.md)** - Code style and formatting guidelines
- **[Technical Standards](TECHNICAL_STANDARDS.md)** - Implementation best practices
- **[Contributing Guidelines](CONTRIBUTING.md)** - Development workflow and processes

---

This architecture provides a solid foundation for building scalable and maintainable NestJS applications. Follow these guidelines to ensure consistency and quality across the codebase.
