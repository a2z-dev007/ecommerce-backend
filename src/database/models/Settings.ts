import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISettings extends Document {
  _id: Types.ObjectId;
  businessName: string;
  businessDescription?: string;
  logo?: string;
  favicon?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
  contactInfo: {
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  features: {
    enableReviews: boolean;
    enableWishlist: boolean;
    enableCompareProducts: boolean;
    enableGuestCheckout: boolean;
    enableCoupons: boolean;
    enableInventoryTracking: boolean;
    enableMultipleAddresses: boolean;
    enableNewsletterSignup: boolean;
  };
  tax: {
    enabled: boolean;
    rate: number;
    inclusive: boolean;
    displayPricesWithTax: boolean;
  };
  shipping: {
    enabled: boolean;
    freeShippingThreshold?: number;
    defaultRate: number;
    zones: {
      name: string;
      countries: string[];
      rate: number;
    }[];
  };
  payments: {
    stripe: {
      enabled: boolean;
      publicKey?: string;
      secretKey?: string;
    };
    paypal: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
      sandbox: boolean;
    };
    cashOnDelivery: {
      enabled: boolean;
    };
  };
  email: {
    smtp: {
      host?: string;
      port?: number;
      secure: boolean;
      username?: string;
      password?: string;
    };
    fromEmail: string;
    fromName: string;
    templates: {
      orderConfirmation: boolean;
      orderShipped: boolean;
      orderDelivered: boolean;
      passwordReset: boolean;
      welcomeEmail: boolean;
    };
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
  legal: {
    termsOfService?: string;
    privacyPolicy?: string;
    returnPolicy?: string;
    shippingPolicy?: string;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
    allowedIPs: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  businessName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  businessDescription: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  logo: String,
  favicon: String,
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  currencySymbol: {
    type: String,
    default: '$',
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  language: {
    type: String,
    default: 'en',
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String,
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#007bff',
    },
    secondaryColor: {
      type: String,
      default: '#6c757d',
    },
    accentColor: {
      type: String,
      default: '#28a745',
    },
    fontFamily: {
      type: String,
      default: 'Inter, sans-serif',
    },
  },
  features: {
    enableReviews: { type: Boolean, default: true },
    enableWishlist: { type: Boolean, default: true },
    enableCompareProducts: { type: Boolean, default: true },
    enableGuestCheckout: { type: Boolean, default: true },
    enableCoupons: { type: Boolean, default: true },
    enableInventoryTracking: { type: Boolean, default: true },
    enableMultipleAddresses: { type: Boolean, default: true },
    enableNewsletterSignup: { type: Boolean, default: true },
  },
  tax: {
    enabled: { type: Boolean, default: false },
    rate: { type: Number, default: 0, min: 0, max: 100 },
    inclusive: { type: Boolean, default: false },
    displayPricesWithTax: { type: Boolean, default: false },
  },
  shipping: {
    enabled: { type: Boolean, default: true },
    freeShippingThreshold: { type: Number, min: 0 },
    defaultRate: { type: Number, default: 0, min: 0 },
    zones: [{
      name: { type: String, required: true },
      countries: [String],
      rate: { type: Number, required: true, min: 0 },
    }],
  },
  payments: {
    stripe: {
      enabled: { type: Boolean, default: false },
      publicKey: String,
      secretKey: String,
    },
    paypal: {
      enabled: { type: Boolean, default: false },
      clientId: String,
      clientSecret: String,
      sandbox: { type: Boolean, default: true },
    },
    cashOnDelivery: {
      enabled: { type: Boolean, default: true },
    },
  },
  email: {
    smtp: {
      host: String,
      port: Number,
      secure: { type: Boolean, default: true },
      username: String,
      password: String,
    },
    fromEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    fromName: {
      type: String,
      required: true,
    },
    templates: {
      orderConfirmation: { type: Boolean, default: true },
      orderShipped: { type: Boolean, default: true },
      orderDelivered: { type: Boolean, default: true },
      passwordReset: { type: Boolean, default: true },
      welcomeEmail: { type: Boolean, default: true },
    },
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    googleAnalyticsId: String,
    facebookPixelId: String,
  },
  legal: {
    termsOfService: String,
    privacyPolicy: String,
    returnPolicy: String,
    shippingPolicy: String,
  },
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: String,
    allowedIPs: [String],
  },
}, {
  timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);