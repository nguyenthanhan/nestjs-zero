import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity'; // Import the User entity

@Injectable()
export class UserService {
  // In-memory storage for users
  private users: User[] = [];
  private currentId = 1; // Simple ID counter

  create(createUserDto: CreateUserDto): User {
    const newUser: User = {
      id: this.currentId++, // Assign and increment ID
      ...createUserDto, // Spread properties from DTO
    };
    this.users.push(newUser);
    return newUser; // Return the created user
  }

  findAll(): User[] {
    return this.users; // Return all users
  }

  findOne(id: number): User {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      // Throw an exception if user not found
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user; // Return the found user
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Merge existing user with updated data
    const updatedUser = { ...this.users[userIndex], ...updateUserDto };
    this.users[userIndex] = updatedUser;
    return updatedUser; // Return the updated user
  }

  remove(id: number): void {
    // Return void as we don't return the deleted user
    const userIndex = this.users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.users.splice(userIndex, 1); // Remove user from array
    // No return needed, typically returns 204 No Content status
  }
}
