import { User, IUser } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils, PasswordUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery, UserRole } from '../../common/types';

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  role?: UserRole;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  preferences?: {
    newsletter?: boolean;
    smsNotifications?: boolean;
    emailNotifications?: boolean;
  };
}

export class UsersService {
  public static async getUsers(
    pagination: PaginationQuery,
    filters: FilterQuery
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { search, status } = filters;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status !== undefined) {
      query.isActive = status === 'active';
    }

    // Execute query with pagination
    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return {
      users,
      pagination: paginationInfo,
    };
  }

  public static async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }

  public static async createUser(data: CreateUserData, file: Express.Multer.File): Promise<IUser> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw new AppError(MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hash(data.password);

      // Create user
      const user = new User({
        ...data,
        password: hashedPassword,
      });

      if (file) {
        user.avatar = `/uploads/${file.filename}`;
      }

      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  public static async updateUser(userId: string, data: UpdateUserData, file: Express.Multer.File): Promise<IUser> {
    const updateData: any = { ...data };

    if (file) {
      updateData.avatar = `/uploads/${file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }

  public static async deleteUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Soft delete by deactivating the user
    user.isActive = false;
    await user.save();
  }

  public static async updateProfile(userId: string, data: UpdateProfileData): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return user;
  }

  public static async addAddress(userId: string, address: any): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // If this is the first address or marked as default, make it default
    if (user.addresses.length === 0 || address.isDefault) {
      // Remove default from other addresses
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    user.addresses.push(address);
    await user.save();

    return user;
  }

  public static async updateAddress(
    userId: string,
    addressId: string,
    addressData: any
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const address = (user.addresses as any).id(addressId);
    if (!address) {
      throw new AppError('Address not found', HTTP_STATUS.NOT_FOUND);
    }

    // If setting as default, remove default from other addresses
    if (addressData.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id?.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    Object.assign(address, addressData);
    await user.save();

    return user;
  }

  public static async deleteAddress(userId: string, addressId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const address = (user.addresses as any).id(addressId);
    if (!address) {
      throw new AppError('Address not found', HTTP_STATUS.NOT_FOUND);
    }

    const wasDefault = address.isDefault;
    (user.addresses as any).pull(addressId);

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user;
  }

  public static async addToWishlist(userId: string, productId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if product already in wishlist
    if (!(user as any).wishlist) {
      (user as any).wishlist = [];
    }

    const wishlist = (user as any).wishlist as string[];
    if (!wishlist.includes(productId)) {
      wishlist.push(productId);
      await user.save();
    }

    return user;
  }

  public static async removeFromWishlist(userId: string, productId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if ((user as any).wishlist) {
      (user as any).wishlist = (user as any).wishlist.filter(
        (id: string) => id.toString() !== productId
      );
      await user.save();
    }

    return user;
  }

  public static async getWishlist(userId: string) {
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name slug price images rating reviewCount stock isActive',
    });

    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return (user as any).wishlist || [];
  }

  public static async clearWishlist(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    (user as any).wishlist = [];
    await user.save();

    return user;
  }

  public static async getUserStats() {
    const [totalUsers, activeUsers, adminUsers, staffUsers, regularUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: UserRole.ADMIN }),
      User.countDocuments({ role: UserRole.STAFF }),
      User.countDocuments({ role: UserRole.USER }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      adminUsers,
      staffUsers,
      regularUsers,
    };
  }
}