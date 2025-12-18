import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { ApiResponse, PaginationInfo } from '../types';

export class PasswordUtils {
  public static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  }

  public static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export class ResponseUtils {
  public static success<T>(
    message: string,
    data?: T,
    pagination?: PaginationInfo
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  public static error(message: string, errors?: any): ApiResponse {
    return {
      success: false,
      message,
      errors,
    };
  }
}

export class PaginationUtils {
  public static calculatePagination(
    page: number,
    limit: number,
    total: number
  ): PaginationInfo {
    const pages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    };
  }

  public static getSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }
}

export class SlugUtils {
  public static generate(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  public static generateUnique(text: string, existingSlugs: string[]): string {
    let baseSlug = this.generate(text);
    let slug = baseSlug;
    let counter = 1;

    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

export class ValidationUtils {
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  public static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  public static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }
}

export class DateUtils {
  public static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  public static isExpired(date: Date): boolean {
    return new Date() > date;
  }

  public static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}

export class PriceUtils {
  public static formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  public static calculateDiscount(
    originalPrice: number,
    discountPercentage: number
  ): number {
    return originalPrice * (discountPercentage / 100);
  }

  public static calculateTax(amount: number, taxRate: number): number {
    return amount * (taxRate / 100);
  }
}

export class FileUtils {
  public static getFileExtension(filename: string): string {
    return filename.slice(filename.lastIndexOf('.'));
  }

  public static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = this.getFileExtension(originalName);
    return `${timestamp}-${random}${extension}`;
  }

  public static isValidImageType(mimetype: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    return allowedTypes.includes(mimetype);
  }
}