import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICmsPage extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  isPublished: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cmsPageSchema = new Schema<ICmsPage>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Please enter a valid slug'],
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    metaKeywords: {
      type: String,
      trim: true,
      maxlength: 255,
    },
  },
  createdBy: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
// cmsPageSchema.index({ slug: 1 }); // Redundant due to unique: true on slug field
cmsPageSchema.index({ isPublished: 1 });
cmsPageSchema.index({ createdAt: -1 });

export const CmsPage = mongoose.model<ICmsPage>('CmsPage', cmsPageSchema);