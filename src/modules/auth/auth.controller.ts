import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { AuthenticatedRequest } from '../../common/types';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class AuthController {
  public static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success(MESSAGES.REGISTER_SUCCESS, result)
    );
  });

  public static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.LOGIN_SUCCESS, result)
    );
  });

  public static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.TOKEN_REFRESHED, tokens)
    );
  });

  public static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { refreshToken } = req.body;
    await AuthService.logout(req.user!.userId, refreshToken);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.LOGOUT_SUCCESS)
    );
  });

  public static logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.logoutAll(req.user!.userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Logged out from all devices successfully')
    );
  });

  public static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.PASSWORD_CHANGED)
    );
  });

  public static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        console.log(`[AuthController] Forgot password request for: ${email}`);
        const message = await AuthService.forgotPassword(email);
        
        res.status(HTTP_STATUS.OK).json(
        ResponseUtils.success(message)
        );
    } catch (error) {
        console.error('[AuthController] Error in forgotPassword:', error);
        throw error; // Re-throw to be handled by global error handler
    }
  });

  public static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.PASSWORD_RESET_SUCCESS)
    );
  });

  public static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Profile fetched successfully', req.user)
    );
  });

  public static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    await AuthService.verifyEmail(token);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Email verified successfully')
    );
  });

  public static resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.resendVerificationEmail(email);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Verification email sent if account exists and is not already verified')
    );
  });
}