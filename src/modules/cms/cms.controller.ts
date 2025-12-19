import { Request, Response } from 'express';
import { CmsService } from './cms.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';
import { AuthenticatedRequest } from '../../common/types';

export class CmsController {
  public static getPages = asyncHandler(async (req: Request, res: Response) => {
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

    const result = await CmsService.getPages(pagination, filters);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.pages, result.pagination)
    );
  });

  public static getPageById = asyncHandler(async (req: Request, res: Response) => {
    const page = await CmsService.getPageById(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, page)
    );
  });

  public static getPageBySlug = asyncHandler(async (req: Request, res: Response) => {
    const page = await CmsService.getPageBySlug(req.params.slug);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, page)
    );
  });

  public static getPublishedPages = asyncHandler(async (req: Request, res: Response) => {
    const pages = await CmsService.getPublishedPages();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, pages)
    );
  });

  public static createPage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = await CmsService.createPage(req.body, req.user!.userId);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success(MESSAGES.CREATED_SUCCESS, page)
    );
  });

  public static updatePage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = await CmsService.updatePage(req.params.id, req.body, req.user!.userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, page)
    );
  });

  public static deletePage = asyncHandler(async (req: Request, res: Response) => {
    await CmsService.deletePage(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.DELETED_SUCCESS)
    );
  });

  public static publishPage = asyncHandler(async (req: Request, res: Response) => {
    const page = await CmsService.publishPage(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Page published successfully', page)
    );
  });

  public static unpublishPage = asyncHandler(async (req: Request, res: Response) => {
    const page = await CmsService.unpublishPage(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Page unpublished successfully', page)
    );
  });
}
