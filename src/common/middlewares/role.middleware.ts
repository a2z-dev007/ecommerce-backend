import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { AppError } from './error.middleware';
import { HTTP_STATUS, MESSAGES } from '../constants';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    const userRole = req.user.role as UserRole;
    
    if (!allowedRoles.includes(userRole)) {
      throw new AppError(MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }

    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);

export const requireAdminOrStaff = requireRole(UserRole.ADMIN, UserRole.STAFF);

export const requireUser = requireRole(UserRole.USER);

export const requireAnyRole = requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.USER);