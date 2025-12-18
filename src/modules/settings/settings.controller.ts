import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class SettingsController {
  public static getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.getSettings();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, settings)
    );
  });

  public static updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateSettings(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, settings)
    );
  });

  public static updateBusinessInfo = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateBusinessInfo(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Business information updated successfully', settings)
    );
  });

  public static updateCurrency = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateCurrency(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Currency settings updated successfully', settings)
    );
  });

  public static updateTheme = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateTheme(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Theme settings updated successfully', settings)
    );
  });

  public static updateFeatures = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateFeatures(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Feature settings updated successfully', settings)
    );
  });

  public static updateTaxSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateTaxSettings(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Tax settings updated successfully', settings)
    );
  });

  public static updateShippingSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateShippingSettings(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Shipping settings updated successfully', settings)
    );
  });

  public static updatePaymentSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updatePaymentSettings(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Payment settings updated successfully', settings)
    );
  });

  public static updateEmailSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateEmailSettings(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Email settings updated successfully', settings)
    );
  });

  public static updateSeoSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateSeoSettings(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('SEO settings updated successfully', settings)
    );
  });

  public static updateLegalSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateLegalSettings(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Legal settings updated successfully', settings)
    );
  });

  public static updateMaintenanceMode = asyncHandler(async (req: Request, res: Response) => {
    const settings = await SettingsService.updateMaintenanceMode(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Maintenance mode updated successfully', settings)
    );
  });
}