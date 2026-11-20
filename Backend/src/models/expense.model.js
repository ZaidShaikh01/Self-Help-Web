import mongoose, { Schema } from 'mongoose';
import { EXPENSE_CATEGORIES } from '../constants.js';
import { dateValidator } from '../utils/HabitDate.js';

const expenseSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [120, 'Expense title can be at most 120 characters'],
    },
    amountCents: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: 'Amount must be in whole cents',
      },
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      required: true,
      default: 'Other',
    },
    date: {
      type: String,
      required: true,
      validate: dateValidator,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note can be at most 300 characters'],
      default: '',
    },
  },
  { timestamps: true },
);

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1, date: -1 });

export const Expense = mongoose.model('Expense', expenseSchema);
