import mongoose, { Schema } from 'mongoose';

const journalSchema = new Schema(
  {
    // Links journal entry to the authenticated user
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Journal title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    mood: {
      type: String,
      enum: ['Productive', 'Calm', 'Stressed', 'Motivated', 'Reflective'],
      default: 'Productive',
    },
    date: { type: String },
    time: { type: String },
    kind: {
      type: String,
      enum: [
        'Reflection',
        'Daily reflection',
        'Reading / practice',
        'Learning / study',
        'Weekly reflection',
      ],
      default: 'Daily reflection',
    },
    tags: { type: [String], default: [] },
    related: {
      type: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          kind: { type: String, enum: ['habit', 'resource'], required: true },
        },
      ],
      default: [],
    },
    prompt: { type: String },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }, // Automatically manages createdAt and updatedAt
);

// Performance optimization: Index by user and creation date for fast chronological queries
journalSchema.index({ user: 1, createdAt: -1 });
journalSchema.index({ user: 1, isPinned: 1, updatedAt: -1 });

export const Journal = mongoose.model('Journal', journalSchema);
