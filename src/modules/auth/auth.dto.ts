import { LoginRequest, RegisterRequest } from '@/types';

export class AuthDto {
  static validateLogin(data: any): { isValid: boolean; errors: string[]; data?: LoginRequest } {
    const errors: string[] = [];

    if (!data.email) {
      errors.push('Email is required');
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      errors.push('Please enter a valid email');
    }

    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? { email: data.email, password: data.password } : undefined
    };
  }

  static validateRegister(data: any): { isValid: boolean; errors: string[]; data?: RegisterRequest } {
    const errors: string[] = [];

    if (!data.email) {
      errors.push('Email is required');
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) {
      errors.push('Please enter a valid email');
    }

    if (!data.name) {
      errors.push('Name is required');
    } else if (data.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (data.name.length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }

    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? { 
        email: data.email, 
        password: data.password, 
        name: data.name 
      } : undefined
    };
  }
}
