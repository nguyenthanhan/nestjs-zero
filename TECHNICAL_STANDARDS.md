# Technical Standards

This document defines the technical standards and best practices for the NestJS Zero project, covering error handling, logging, API design, database interactions, security practices, and other technical aspects.

## Table of Contents

- [Error Handling](#error-handling)
- [Logging Practices](#logging-practices)
- [API Design Standards](#api-design-standards)
- [Database Interactions](#database-interactions)
- [Security Practices](#security-practices)
- [Performance Guidelines](#performance-guidelines)
- [Configuration Management](#configuration-management)
- [Testing Standards](#testing-standards)

## Error Handling

### Exception Hierarchy

```typescript
// Use NestJS built-in HTTP exceptions
import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

// ✅ Good: Specific exception types
throw new NotFoundException(`User with ID ${id} not found`);
throw new ConflictException('Email already exists');
throw new BadRequestException('Invalid input data');

// ❌ Bad: Generic exceptions
throw new Error('Something went wrong');
```

### Custom Exceptions

```typescript
// Custom business exception
export class InsufficientFundsException extends BadRequestException {
  constructor(balance: number, required: number) {
    super(`Insufficient funds. Balance: ${balance}, Required: ${required}`);
  }
}

// Domain-specific exception
export class UserNotActiveException extends ForbiddenException {
  constructor(userId: number) {
    super(`User ${userId} is not active`);
  }
}
```

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logger.error(
      `${request.method} ${request.url} - ${errorResponse.statusCode}`,
      exception instanceof Error ? exception.stack : exception,
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request) {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'object') {
        message = (response as any).message || exception.message;
        details = (response as any).details;
      } else {
        message = response;
      }
    }

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && { details }),
    };
  }
}
```

### Error Handling Best Practices

1. **Use specific exceptions**: Choose the most appropriate HTTP exception
2. **Provide meaningful messages**: Include context and actionable information
3. **Log errors appropriately**: Log stack traces for server errors
4. **Don't expose sensitive data**: Sanitize error messages for production
5. **Handle async errors**: Use proper error handling in async operations

## Logging Practices

### Logger Configuration

```typescript
// main.ts
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  await app.listen(3000);
  logger.log('Application is running on port 3000');
}
```

### Service Logging

```typescript
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    try {
      const user = await this.userRepository.save(createUserDto);
      this.logger.log(`User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to create user with email: ${createUserDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number): Promise<User> {
    this.logger.debug(`Finding user with ID: ${id}`);

    const user = await this.userRepository.findOne(id);
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
```

### Logging Levels

- **ERROR**: System errors, exceptions, critical issues
- **WARN**: Warning conditions, deprecated usage, recoverable errors
- **LOG**: General application flow, important business events
- **DEBUG**: Detailed information for debugging
- **VERBOSE**: Very detailed information, typically only in development

### Structured Logging

```typescript
// Use structured logging for better searchability
this.logger.log({
  message: 'User login attempt',
  userId: user.id,
  email: user.email,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  timestamp: new Date().toISOString(),
});
```

## API Design Standards

### RESTful Endpoints

```typescript
// ✅ Good: RESTful resource naming
@Controller('users')
export class UserController {
  @Get()           // GET /users
  @Get(':id')      // GET /users/:id
  @Post()          // POST /users
  @Put(':id')      // PUT /users/:id
  @Patch(':id')    // PATCH /users/:id
  @Delete(':id')   // DELETE /users/:id
}

// ✅ Good: Nested resources
@Controller('users/:userId/orders')
export class UserOrderController {
  @Get()           // GET /users/:userId/orders
  @Post()          // POST /users/:userId/orders
}
```

### HTTP Status Codes

```typescript
@Controller('users')
export class UserController {
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201 for resource creation
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK) // 200 for successful retrieval
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 for successful deletion
  async remove(@Param('id') id: number) {
    await this.userService.remove(id);
  }
}
```

### Request/Response DTOs

```typescript
// Request DTO with validation (current project example)
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsEmail()
  email: string;
}

// Extended example with optional fields
export class CreateUserWithAgeDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  age?: number;
}

// Response DTO
export class UserResponseDto {
  id: number;
  name: string;
  email: string;
  createdAt: Date;

  // Exclude sensitive fields like password
}

// Pagination DTO
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
```

### API Versioning

```typescript
// Version in URL
@Controller({ path: 'users', version: '1' })
export class UserV1Controller {
  // v1 implementation
}

@Controller({ path: 'users', version: '2' })
export class UserV2Controller {
  // v2 implementation
}

// Enable versioning in main.ts
app.enableVersioning({
  type: VersioningType.URI,
  prefix: 'v',
});
```

### Response Formatting

```typescript
// Consistent response format
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Response interceptor
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: 'Operation successful',
      })),
    );
  }
}
```

## Database Interactions

### Repository Pattern

```typescript
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['profile', 'orders'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'email', 'name'], // Select specific fields
    });
  }

  async findWithPagination(options: PaginationDto): Promise<[User[], number]> {
    return this.repository.findAndCount({
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      order: { createdAt: 'DESC' },
    });
  }
}
```

### Transaction Management

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
  ) {}

  async createUserWithProfile(userData: CreateUserDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      // Create user
      const user = manager.create(User, userData);
      const savedUser = await manager.save(user);

      // Create profile
      const profile = manager.create(Profile, {
        userId: savedUser.id,
        ...userData.profile,
      });
      await manager.save(profile);

      return savedUser;
    });
  }
}
```

### Query Optimization

```typescript
// ✅ Good: Use specific selects
const users = await this.repository.find({
  select: ['id', 'name', 'email'],
  where: { isActive: true },
});

// ✅ Good: Use joins instead of N+1 queries
const usersWithOrders = await this.repository.find({
  relations: ['orders'],
  where: { isActive: true },
});

// ✅ Good: Use query builder for complex queries
const result = await this.repository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.orders', 'order')
  .where('user.isActive = :isActive', { isActive: true })
  .andWhere('order.createdAt > :date', { date: lastMonth })
  .getMany();
```

## Security Practices

### Authentication & Authorization

```typescript
// JWT Authentication Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

// Role-based authorization
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### Input Validation

```typescript
// DTO with comprehensive validation
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  name: string;

  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password: string;
}

// Custom validation pipe
@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    });
  }
}
```

### Security Headers

```typescript
// Security middleware
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  await app.listen(3000);
}
```

### Data Sanitization

```typescript
// Sanitize user input
@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      // Remove HTML tags and dangerous characters
      return value.replace(/<[^>]*>?/gm, '').trim();
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.transform(val);
      }
      return sanitized;
    }

    return value;
  }
}
```

## Performance Guidelines

### Caching Strategies

```typescript
// Redis caching
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOne(id: number): Promise<User> {
    const cacheKey = `user:${id}`;

    // Try cache first
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    // Fetch from database
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache for 5 minutes
    await this.cacheManager.set(cacheKey, user, 300);

    return user;
  }
}
```

### Database Optimization

```typescript
// Use indexes for frequently queried fields
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index() // Add index for email lookups
  email: string;

  @Column()
  @Index() // Add index for status filtering
  status: string;

  @Column()
  @Index(['createdAt']) // Add index for date range queries
  createdAt: Date;
}

// Use database-level constraints
@Entity('users')
export class User {
  @Column({ unique: true }) // Database-level unique constraint
  email: string;

  @Column({ default: true })
  isActive: boolean;
}
```

## Configuration Management

### Environment Configuration

The current project uses basic environment configuration. Here's how to extend it:

```typescript
// Current main.ts configuration
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Uses environment variable or default
  await app.listen(process.env.PORT ?? 3000);
}

// Extended configuration example (future implementation)
// config/app.config.ts
export const appConfig = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});

// Environment validation schema (when using @nestjs/config)
export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  JWT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});
```

### Environment File Example

Create a `.env.example` file for development setup:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database (when implemented)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=nestjs_user
DB_PASSWORD=nestjs_password
DB_NAME=nestjs_zero

# JWT (when implemented)
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# Redis (when implemented)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Testing Standards

### Unit Testing

```typescript
// Current project example - testing UserService
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should create a user successfully', () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' };

      const result = service.create(createUserDto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createUserDto.name);
      expect(result.email).toBe(createUserDto.email);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', () => {
      const createUserDto = { name: 'John Doe', email: 'john@example.com' };
      const createdUser = service.create(createUserDto);

      const result = service.findOne(createdUser.id);

      expect(result).toEqual(createdUser);
    });

    it('should throw NotFoundException when user not found', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const user1 = service.create({ name: 'John', email: 'john@example.com' });
      const user2 = service.create({ name: 'Jane', email: 'jane@example.com' });

      const result = service.findAll();

      expect(result).toHaveLength(2);
      expect(result).toContain(user1);
      expect(result).toContain(user2);
    });
  });
});

// Example with database repository mocking
describe('UserService with Repository', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should find user by id', async () => {
    const user = { id: 1, name: 'John', email: 'john@example.com' };
    jest.spyOn(repository, 'findOne').mockResolvedValue(user as User);

    const result = await service.findOne(1);

    expect(result).toEqual(user);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
```

### Integration Testing

```typescript
describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('John Doe');
        expect(res.body.email).toBe('john@example.com');
      });
  });
});
```

## Current Project Implementation Status

### ✅ Implemented Features

- **Basic CRUD Operations**: User creation, retrieval, update, and deletion
- **Input Validation**: DTOs with class-validator decorators
- **Global Validation Pipe**: Configured in main.ts
- **Error Handling**: NotFoundException for missing users
- **Testing Setup**: Unit tests for controllers and services
- **Code Quality**: ESLint and Prettier configuration
- **TypeScript**: Strict type checking enabled

### 🚧 Partially Implemented

- **Logging**: Basic console logging (no structured logging yet)
- **Testing**: Basic test structure (needs more comprehensive tests)
- **Documentation**: JSDoc comments in some files

### 📋 Future Enhancements

- **Database Integration**: Currently uses in-memory storage
- **Authentication & Authorization**: JWT guards and role-based access
- **Caching**: Redis integration for performance
- **API Documentation**: OpenAPI/Swagger integration
- **Environment Configuration**: Enhanced config management
- **Monitoring**: Health checks and metrics
- **Security Headers**: Helmet and CORS configuration
- **Rate Limiting**: Request throttling
- **Containerization**: Docker setup

### Current Architecture Overview

```
NestJS Zero (Current State)
├── In-Memory Data Storage
├── Basic CRUD Operations
├── DTO Validation
├── Exception Handling
├── Unit Testing Setup
└── Code Quality Tools

Future Enhancements
├── Database Layer (TypeORM/Prisma)
├── Authentication System
├── Caching Layer
├── API Documentation
├── Monitoring & Logging
└── Production Deployment
```

## Related Documentation

- **[Architecture Guidelines](ARCHITECTURE.md)** - Project structure and design patterns
- **[Coding Standards](CODING_STANDARDS.md)** - Code style and formatting rules
- **[Contributing Guidelines](CONTRIBUTING.md)** - Development workflow and processes

---

These technical standards ensure consistency, security, and maintainability across the NestJS Zero project. Follow these guidelines to build robust and scalable applications.
