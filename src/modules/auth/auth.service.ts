import crypto from 'crypto';
import { User, IUser } from '../../database';
import { JWTService } from '../../config/jwt';
import { PasswordUtils } from '../../common/utils';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { UserRole } from '../../common/types';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  public static async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError(MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(data.password);

    // Create user
    const user = new User({
      ...data,
      password: hashedPassword,
      role: data.role || UserRole.USER,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token (hashed)
    const hashedRefreshToken = await PasswordUtils.hash(refreshToken);
    user.refreshTokens.push(hashedRefreshToken);
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  public static async login(data: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) {
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', HTTP_STATUS.FORBIDDEN);
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError(MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
    }

    // Generate tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token (hashed)
    const hashedRefreshToken = await PasswordUtils.hash(refreshToken);
    user.refreshTokens.push(hashedRefreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  public static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      // Check if refresh token exists in user's tokens
      const isValidRefreshToken = await Promise.all(
        user.refreshTokens.map(token => PasswordUtils.compare(refreshToken, token))
      );

      if (!isValidRefreshToken.some(Boolean)) {
        throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      // Generate new tokens
      const tokens = JWTService.generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role,
      });

      // Remove old refresh token and add new one
      const oldTokenIndex = await Promise.all(
        user.refreshTokens.map(token => PasswordUtils.compare(refreshToken, token))
      ).then(results => results.findIndex(Boolean));

      if (oldTokenIndex !== -1) {
        user.refreshTokens.splice(oldTokenIndex, 1);
      }

      const hashedNewRefreshToken = await PasswordUtils.hash(tokens.refreshToken);
      user.refreshTokens.push(hashedNewRefreshToken);
      await user.save();

      return tokens;
    } catch (error) {
      throw new AppError(MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }
  }

  public static async logout(userId: string, refreshToken: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Remove refresh token
    const tokenIndex = await Promise.all(
      user.refreshTokens.map(token => PasswordUtils.compare(refreshToken, token))
    ).then(results => results.findIndex(Boolean));

    if (tokenIndex !== -1) {
      user.refreshTokens.splice(tokenIndex, 1);
      await user.save();
    }
  }

  public static async logoutAll(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Remove all refresh tokens
    user.refreshTokens = [];
    await user.save();
  }

  public static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordUtils.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', HTTP_STATUS.BAD_REQUEST);
    }

    // Hash new password
    const hashedNewPassword = await PasswordUtils.hash(newPassword);
    user.password = hashedNewPassword;

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];
    await user.save();
  }

  public static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return 'If an account with that email exists, a password reset link has been sent.';
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // TODO: Send email with reset token
    // For now, return the token (in production, this should be sent via email)
    return resetToken;
  }

  public static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
    }

    // Hash new password
    const hashedNewPassword = await PasswordUtils.hash(newPassword);
    user.password = hashedNewPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];
    await user.save();
  }
}