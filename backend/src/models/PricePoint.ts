import { Schema, model, Document } from 'mongoose';

export interface PricePointDocument extends Document {
  price: number;
  source?: string;
  market?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PricePointSchema = new Schema<PricePointDocument>(
  {
    price: {
      type: Number,
      required: true,
      min: 0
    },
    source: {
      type: String,
      trim: true
    },
    market: {
      type: String,
      trim: true
    },
    metadata: {
      type: Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

PricePointSchema.index({ timestamp: 1 });
PricePointSchema.index({ market: 1, timestamp: -1 });

export const PricePoint = model<PricePointDocument>('PricePoint', PricePointSchema);
