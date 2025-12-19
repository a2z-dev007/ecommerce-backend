import { CmsPage, ICmsPage } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils, SlugUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery } from '../../common/types';

export interface CreateCmsPageData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  isPublished?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
}

export class CmsService {
  public static async getPages(pagination: PaginationQuery, filters: FilterQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { search, status } = filters;

    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [pages, total] = await Promise.all([
      CmsPage.find(query)
        .populate('createdBy', 'firstName lastName')
        .populate('updatedBy', 'firstName lastName')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      CmsPage.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return { pages, pagination: paginationInfo };
  }

  public static async getPageById(pageId: string): Promise<ICmsPage> {
    const page = await CmsPage.findById(pageId)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');
    
    if (!page) {
      throw new AppError('Page not found', HTTP_STATUS.NOT_FOUND);
    }

    return page;
  }

  public static async getPageBySlug(slug: string, requirePublished = true): Promise<ICmsPage> {
    const query: any = { slug };
    if (requirePublished) {
      query.isPublished = true;
    }

    const page = await CmsPage.findOne(query);
    
    if (!page) {
      throw new AppError('Page not found', HTTP_STATUS.NOT_FOUND);
    }

    return page;
  }

  public static async createPage(data: CreateCmsPageData, createdBy: string): Promise<ICmsPage> {
    // Generate slug if not provided
    let slug = data.slug;
    if (!slug) {
      const existingSlugs = await CmsPage.find({}, 'slug').lean();
      const slugs = existingSlugs.map(p => p.slug);
      slug = SlugUtils.generateUnique(data.title, slugs);
    } else {
      // Check if slug already exists
      const existingPage = await CmsPage.findOne({ slug });
      if (existingPage) {
        throw new AppError('Page with this slug already exists', HTTP_STATUS.CONFLICT);
      }
    }

    const page = new CmsPage({
      ...data,
      slug,
      createdBy,
    });

    await page.save();
    return page;
  }

  public static async updatePage(
    pageId: string,
    data: Partial<CreateCmsPageData>,
    updatedBy: string
  ): Promise<ICmsPage> {
    // If updating title and no slug provided, regenerate slug
    if (data.title && !data.slug) {
      const existingSlugs = await CmsPage.find({ _id: { $ne: pageId } }, 'slug').lean();
      const slugs = existingSlugs.map(p => p.slug);
      data.slug = SlugUtils.generateUnique(data.title, slugs);
    } else if (data.slug) {
      // Check if slug already exists
      const existingPage = await CmsPage.findOne({
        slug: data.slug,
        _id: { $ne: pageId },
      });
      if (existingPage) {
        throw new AppError('Page with this slug already exists', HTTP_STATUS.CONFLICT);
      }
    }

    const page = await CmsPage.findByIdAndUpdate(
      pageId,
      { $set: { ...data, updatedBy } },
      { new: true, runValidators: true }
    );

    if (!page) {
      throw new AppError('Page not found', HTTP_STATUS.NOT_FOUND);
    }

    return page;
  }

  public static async deletePage(pageId: string): Promise<void> {
    const page = await CmsPage.findByIdAndDelete(pageId);
    if (!page) {
      throw new AppError('Page not found', HTTP_STATUS.NOT_FOUND);
    }
  }

  public static async publishPage(pageId: string): Promise<ICmsPage> {
    const page = await CmsPage.findByIdAndUpdate(
      pageId,
      { isPublished: true },
      { new: true }
    );

    if (!page) {
      throw new AppError('Page not found', HTTP_STATUS.NOT_FOUND);
    }

    return page;
  }

  public static async unpublishPage(pageId: string): Promise<ICmsPage> {
    const page = await CmsPage.findByIdAndUpdate(
      pageId,
      { isPublished: false },
      { new: true }
    );

    if (!page) {
      throw new AppError('Page not found', HTTP_STATUS.NOT_FOUND);
    }

    return page;
  }

  public static async getPublishedPages() {
    const pages = await CmsPage.find({ isPublished: true })
      .select('title slug excerpt')
      .sort({ title: 1 })
      .lean();

    return pages;
  }
}
