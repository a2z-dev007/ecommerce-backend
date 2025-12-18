import { Settings, ISettings } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS } from '../../common/constants';

export class SettingsService {
  public static async getSettings(): Promise<any> {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await this.createDefaultSettings();
    }

    return settings;
  }

  public static async updateSettings(data: Partial<ISettings>): Promise<ISettings> {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create new settings if none exist
      settings = new Settings(data);
    } else {
      // Update existing settings
      Object.assign(settings, data);
    }

    await settings.save();
    return settings;
  }

  public static async updateBusinessInfo(data: {
    businessName?: string;
    businessDescription?: string;
    logo?: string;
    favicon?: string;
    contactInfo?: any;
    socialMedia?: any;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    if (data.businessName) settings.businessName = data.businessName;
    if (data.businessDescription) settings.businessDescription = data.businessDescription;
    if (data.logo) settings.logo = data.logo;
    if (data.favicon) settings.favicon = data.favicon;
    if (data.contactInfo) Object.assign(settings.contactInfo, data.contactInfo);
    if (data.socialMedia) Object.assign(settings.socialMedia, data.socialMedia);

    await settings.save();
    return settings;
  }

  public static async updateCurrency(data: {
    currency?: string;
    currencySymbol?: string;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    if (data.currency) settings.currency = data.currency;
    if (data.currencySymbol) settings.currencySymbol = data.currencySymbol;

    await settings.save();
    return settings;
  }

  public static async updateTheme(themeData: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    Object.assign(settings.theme, themeData);
    await settings.save();
    return settings;
  }

  public static async updateFeatures(featuresData: {
    enableReviews?: boolean;
    enableWishlist?: boolean;
    enableCompareProducts?: boolean;
    enableGuestCheckout?: boolean;
    enableCoupons?: boolean;
    enableInventoryTracking?: boolean;
    enableMultipleAddresses?: boolean;
    enableNewsletterSignup?: boolean;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    Object.assign(settings.features, featuresData);
    await settings.save();
    return settings;
  }

  public static async updateTaxSettings(taxData: {
    enabled?: boolean;
    rate?: number;
    inclusive?: boolean;
    displayPricesWithTax?: boolean;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    Object.assign(settings.tax, taxData);
    await settings.save();
    return settings;
  }

  public static async updateShippingSettings(shippingData: {
    enabled?: boolean;
    freeShippingThreshold?: number;
    defaultRate?: number;
    zones?: any[];
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    Object.assign(settings.shipping, shippingData);
    await settings.save();
    return settings;
  }

  public static async updatePaymentSettings(paymentData: {
    stripe?: any;
    paypal?: any;
    cashOnDelivery?: any;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    if (paymentData.stripe) Object.assign(settings.payments.stripe, paymentData.stripe);
    if (paymentData.paypal) Object.assign(settings.payments.paypal, paymentData.paypal);
    if (paymentData.cashOnDelivery) Object.assign(settings.payments.cashOnDelivery, paymentData.cashOnDelivery);

    await settings.save();
    return settings;
  }

  public static async updateEmailSettings(emailData: {
    smtp?: any;
    fromEmail?: string;
    fromName?: string;
    templates?: any;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    if (emailData.smtp) Object.assign(settings.email.smtp, emailData.smtp);
    if (emailData.fromEmail) settings.email.fromEmail = emailData.fromEmail;
    if (emailData.fromName) settings.email.fromName = emailData.fromName;
    if (emailData.templates) Object.assign(settings.email.templates, emailData.templates);

    await settings.save();
    return settings;
  }

  public static async updateSeoSettings(seoData: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    Object.assign(settings.seo, seoData);
    await settings.save();
    return settings;
  }

  public static async updateLegalSettings(legalData: {
    termsOfService?: string;
    privacyPolicy?: string;
    returnPolicy?: string;
    shippingPolicy?: string;
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    Object.assign(settings.legal, legalData);
    await settings.save();
    return settings;
  }

  public static async updateMaintenanceMode(maintenanceData: {
    enabled?: boolean;
    message?: string;
    allowedIPs?: string[];
  }): Promise<ISettings> {
    const settings = await this.getSettings();
    
    Object.assign(settings.maintenance, maintenanceData);
    await settings.save();
    return settings;
  }

  private static async createDefaultSettings(): Promise<any> {
    const defaultSettings = new Settings({
      businessName: 'My Ecommerce Store',
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'UTC',
      language: 'en',
      contactInfo: {
        email: 'contact@example.com',
      },
      email: {
        fromEmail: 'noreply@example.com',
        fromName: 'My Ecommerce Store',
      },
    });

    await defaultSettings.save();
    return defaultSettings;
  }
}