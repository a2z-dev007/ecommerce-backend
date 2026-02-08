import crypto from 'crypto';
import { MailService } from '../../common/services/mail.service';
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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    
    user.emailVerificationToken = hashedVerificationToken;
    user.isEmailVerified = false;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    await MailService.sendVerificationEmail(user.email, verificationUrl);

    // Generate tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Store refresh token (hashed)
    const hashedRefreshToken = await PasswordUtils.hash(refreshToken);
    user.refreshTokens.push(hashedRefreshToken);
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
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

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new AppError(MESSAGES.EMAIL_NOT_VERIFIED, HTTP_STATUS.FORBIDDEN);
    }

    // Generate tokens
    const { accessToken, refreshToken } = JWTService.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Store refresh token (hashed)
    const hashedRefreshToken = await PasswordUtils.hash(refreshToken);
    user.refreshTokens.push(hashedRefreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
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
        userId: user._id.toString(),
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
    
    // Always return the same message to prevent email enumeration
    const message = 'If an account with that email exists, a password reset link has been sent.';

    if (!user) {
      return message;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.save();

    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
    
    // Send reset email
    // The sendResetPasswordEmail method handles errors internally (logging them) so we don't crash here.
    await MailService.sendResetPasswordEmail(email, resetUrl);

    return message;
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

  public static async verifyEmail(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    if (!user) {
      throw new AppError('Invalid or unavailable verification token', HTTP_STATUS.BAD_REQUEST);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
  }

  public static async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ email });
    
    // Silence error if user doesn't exist or is already verified for security
    if (!user || user.isEmailVerified) {
      return;
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    
    user.emailVerificationToken = hashedVerificationToken;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    await MailService.sendVerificationEmail(user.email, verificationUrl);
  }
}