import { Category, ICategory } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { SlugUtils } from '../../common/utils';

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive?: boolean;
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
}

export class CategoriesService {
  public static async getCategories(includeInactive: boolean = false) {
    const query = includeInactive ? {} : { isActive: true };
    
    const categories = await Category.find(query)
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return categories;
  }

  public static async getCategoryTree() {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Build tree structure
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category._id.toString(), {
        ...category,
        children: [],
      });
    });

    // Second pass: build tree
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category._id.toString());
      
      if (category.parentCategory) {
        const parent = categoryMap.get(category.parentCategory.toString());
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  public static async getCategoryById(categoryId: string): Promise<ICategory> {
    const category = await Category.findById(categoryId)
      .populate('subcategories');
    
    if (!category) {
      throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  public static async getCategoryBySlug(slug: string): Promise<ICategory> {
    const category = await Category.findOne({ slug, isActive: true })
      .populate('subcategories');
    
    if (!category) {
      throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  public static async createCategory(data: CreateCategoryData): Promise<ICategory> {
    // Verify parent category exists if provided
    if (data.parentCategory) {
      const parentCategory = await Category.findById(data.parentCategory);
      if (!parentCategory) {
        throw new AppError('Parent category not found', HTTP_STATUS.NOT_FOUND);
      }
    }

    // Generate unique slug
    const existingSlugs = await Category.find({}, 'slug').lean();
    const slugs = existingSlugs.map(c => c.slug);
    const slug = SlugUtils.generateUnique(data.name, slugs);

    // Create category
    const category = new Category({
      ...data,
      slug,
    });

    await category.save();
    return category;
  }

  public static async updateCategory(categoryId: string, data: Partial<CreateCategoryData>): Promise<ICategory> {
    // If updating name, regenerate slug
    if (data.name) {
      const existingSlugs = await Category.find({ _id: { $ne: categoryId } }, 'slug').lean();
      const slugs = existingSlugs.map(c => c.slug);
      data.slug = SlugUtils.generateUnique(data.name, slugs);
    }

    // Verify parent category exists if provided
    if (data.parentCategory) {
      const parentCategory = await Category.findById(data.parentCategory);
      if (!parentCategory) {
        throw new AppError('Parent category not found', HTTP_STATUS.NOT_FOUND);
      }

      // Prevent circular reference
      if (data.parentCategory === categoryId) {
        throw new AppError('Category cannot be its own parent', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return category;
  }

  public static async deleteCategory(categoryId: string): Promise<void> {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: categoryId });
    if (subcategories.length > 0) {
      throw new AppError('Cannot delete category with subcategories', HTTP_STATUS.BAD_REQUEST);
    }

    // Soft delete by deactivating
    category.isActive = false;
    await category.save();
  }

  public static async reorderCategories(categoryOrders: { id: string; sortOrder: number }[]): Promise<void> {
    const bulkOps = categoryOrders.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { sortOrder },
      },
    }));

    await Category.bulkWrite(bulkOps as any);
  }

  public static async getCategoryStats() {
    const [totalCategories, activeCategories, rootCategories] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ parentCategory: null }),
    ]);

    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      rootCategories,
      subcategories: activeCategories - rootCategories,
    };
  }
}