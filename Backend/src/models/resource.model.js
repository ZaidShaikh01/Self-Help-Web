import mongoose, { Schema } from 'mongoose';
import {
  RESOURCE_TYPES,
  RESOURCE_STATUSES,
  RESOURCE_CATEGORIES,
} from '../constants.js';

const resourceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: RESOURCE_TYPES,
      required: [true, 'Resource type is required'],
    },
    link: { type: String, trim: true },
    author: { type: String, trim: true },
    status: {
      type: String,
      enum: RESOURCE_STATUSES,
      default: RESOURCE_STATUSES[0],
    },
    rating: { type: Number, min: 1, max: 5 },
    category: { type: String, enum: RESOURCE_CATEGORIES },
    pages: { type: Number, min: 1 },
    currentPage: { type: Number, min: 0, default: 0 },
    summary: { type: String, trim: true, maxlength: 1000 },
    attachment: {
      key: { type: String, trim: true },
      fileName: { type: String, trim: true },
      mimeType: { type: String, trim: true },
      size: { type: Number, min: 0 },
      uploadedAt: { type: Date },
      epubProgress: {
        cfi: { type: String, trim: true, maxlength: 500 },
        percentage: { type: Number, min: 0, max: 100 },
        updatedAt: { type: Date },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true, // puts "progress" into API responses
      transform: (_doc, ret) => {
        if (ret.attachment) {
          delete ret.attachment.key;
          // If attachment has no fileName, omit attachment object entirely
          if (!ret.attachment.fileName) {
            delete ret.attachment;
          }
        }
        return ret;
      },
    },
    id: false, // we already send _id; skip the duplicate "id"
  },
);

// 0-100, computed from the pages instead of stored, so it can never go stale
resourceSchema.virtual('progress').get(function () {
  if (this.status === 'Completed') return 100;
  if (!this.pages) return 0;
  return Math.min(100, Math.round((this.currentPage / this.pages) * 100));
});

resourceSchema.pre('validate', async function () {
  if (this.pages && this.currentPage > this.pages) {
    this.invalidate(
      'currentPage',
      'Current page cannot be greater than total pages',
    );
  }
});

// Bug Fix: Prevent duplicate resource titles per user
resourceSchema.index({ user: 1, title: 1 }, { unique: true });
resourceSchema.index({ user: 1, createdAt: -1 });

export const Resource = mongoose.model('Resource', resourceSchema);
