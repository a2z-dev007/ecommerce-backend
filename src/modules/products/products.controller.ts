import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class ProductsController {
  public static getProducts = asyncHandler(async (req: Request, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt',
      order: req.query.order as 'asc' | 'desc' || 'desc',
    };

    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    };

    const result = await ProductsService.getProducts(pagination, filters);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.products, result.pagination)
    );
  });

  public static getProductById = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductsService.getProductById(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, product)
    );
  });

  public static getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductsService.getProductBySlug(req.params.slug);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, product)
    );
  });

  public static createProduct = asyncHandler(async (req: Request, res: Response) => {
    console.log('--- Create Product Request ---');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Files:', req.files ? (Array.isArray(req.files) ? `Array[${req.files.length}]` : 'Not an array') : 'Undefined');
    if (Array.isArray(req.files)) {
      req.files.forEach((f: any, i) => console.log(` File ${i}:`, f.originalname, f.path));
    }

    const product = await ProductsService.createProduct(req.body, req.files);

    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success(MESSAGES.CREATED_SUCCESS, product)
    );
  });

  public static updateProduct = asyncHandler(async (req: Request, res: Response) => {
    console.log('--- Update Product Request ---');
    console.log('ID:', req.params.id);
    console.log('Files:', req.files ? (Array.isArray(req.files) ? `Array[${req.files.length}]` : 'Not an array') : 'Undefined');
    const product = await ProductsService.updateProduct(req.params.id, req.body, req.files);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, product)
    );
  });

  public static deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    await ProductsService.deleteProduct(req.params.id);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.DELETED_SUCCESS)
    );
  });

  public static getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const products = await ProductsService.getFeaturedProducts(limit);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Featured products fetched successfully', products)
    );
  });

  public static getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 6;
    const products = await ProductsService.getRelatedProducts(req.params.id, limit);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Related products fetched successfully', products)
    );
  });

  public static getProductStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ProductsService.getProductStats();

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Product statistics fetched successfully', stats)
    );
  });

  public static bulkUpdateProducts = asyncHandler(async (req: Request, res: Response) => {
    const { productIds, updateData } = req.body;
    const count = await ProductsService.bulkUpdateProducts(productIds, updateData);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(`${count} products updated successfully`, { count })
    );
  });

  public static bulkDeleteProducts = asyncHandler(async (req: Request, res: Response) => {
    const { productIds } = req.body;
    const count = await ProductsService.bulkDeleteProducts(productIds);

    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(`${count} products deleted successfully`, { count })
    );
  });
}