import mongoose, { Document, Schema, Types } from 'mongoose';
import { InventoryAction } from '../../common/types';

export interface IInventoryTransaction extends Document {
  _id: Types.ObjectId;
  product: string;
  variant?: string;
  action: InventoryAction;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reference?: string;
  performedBy?: string;
  notes?: string;
  createdAt: Date;
}

const inventoryTransactionSchema = new Schema<IInventoryTransaction>({
  product: {
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: String,
  },
  action: {
    type: String,
    enum: Object.values(InventoryAction),
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
    min: 0,
  },
  newStock: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: {
    type: String,
    trim: true,
  },
  reference: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Indexes
inventoryTransactionSchema.index({ product: 1 });
inventoryTransactionSchema.index({ action: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });
inventoryTransactionSchema.index({ performedBy: 1 });

export const InventoryTransaction = mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);