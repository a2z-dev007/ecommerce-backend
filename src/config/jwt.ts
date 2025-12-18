import jwt from 'jsonwebtoken';
import { env } from './env';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tokenType: 'access' | 'refresh';
}

export class JWTService {
  public static generateAccessToken(payload: Omit<JWTPayload, 'tokenType'>): string {
    return jwt.sign(
      { ...payload, tokenType: 'access' },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
    );
  }

  public static generateRefreshToken(payload: Omit<JWTPayload, 'tokenType'>): string {
    return jwt.sign(
      { ...payload, tokenType: 'refresh' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
  }

  public static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JWTPayload;
      if (decoded.tokenType !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  public static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload;
      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  public static generateTokenPair(payload: Omit<JWTPayload, 'tokenType'>) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
}