
import { Request, Response } from 'express';
import { ContactService } from './contact.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class ContactController {
  public static submitContactForm = asyncHandler(async (req: Request, res: Response) => {
    await ContactService.submitContactForm(req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Message sent successfully')
    );
  });
}
