import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class CategoriesController {
  public static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await CategoriesService.getCategories(includeInactive);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, categories)
    );
  });

  public static getCategoryTree = asyncHandler(async (req: Request, res: Response) => {
    const categoryTree = await CategoriesService.getCategoryTree();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Category tree fetched successfully', categoryTree)
    );
  });

  public static getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoriesService.getCategoryById(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, category)
    );
  });

  public static getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoriesService.getCategoryBySlug(req.params.slug);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, category)
    );
  });

  public static createCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoriesService.createCategory(req.body);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success(MESSAGES.CREATED_SUCCESS, category)
    );
  });

  public static updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoriesService.updateCategory(req.params.id, req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, category)
    );
  });

  public static deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    await CategoriesService.deleteCategory(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.DELETED_SUCCESS)
    );
  });

  public static reorderCategories = asyncHandler(async (req: Request, res: Response) => {
    await CategoriesService.reorderCategories(req.body.categories);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Categories reordered successfully')
    );
  });

  public static getCategoryStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await CategoriesService.getCategoryStats();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Category statistics fetched successfully', stats)
    );
  });
}