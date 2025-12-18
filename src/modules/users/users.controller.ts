import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { AuthenticatedRequest } from '../../common/types';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class UsersController {
  public static getUsers = asyncHandler(async (req: Request, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt',
      order: req.query.order as 'asc' | 'desc' || 'desc',
    };

    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
    };

    const result = await UsersService.getUsers(pagination, filters);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.users, result.pagination)
    );
  });

  public static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.getUserById(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, user)
    );
  });

  public static createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.createUser(req.body);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success(MESSAGES.CREATED_SUCCESS, user)
    );
  });

  public static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await UsersService.updateUser(req.params.id, req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, user)
    );
  });

  public static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await UsersService.deleteUser(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.DELETED_SUCCESS)
    );
  });

  public static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await UsersService.updateProfile(req.user!.userId, req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, user)
    );
  });

  public static addAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await UsersService.addAddress(req.user!.userId, req.body);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success('Address added successfully', user)
    );
  });

  public static updateAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await UsersService.updateAddress(
      req.user!.userId,
      req.params.addressId,
      req.body
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Address updated successfully', user)
    );
  });

  public static deleteAddress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await UsersService.deleteAddress(req.user!.userId, req.params.addressId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Address deleted successfully', user)
    );
  });

  public static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await UsersService.getUserStats();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('User statistics fetched successfully', stats)
    );
  });
}