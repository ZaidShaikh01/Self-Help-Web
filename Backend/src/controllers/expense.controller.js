import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Expense } from '../models/expense.model.js';

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({
    ...req.body,
    user: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, expense, 'Expense created successfully'));
});

export const createExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.insertMany(
    req.body.map((expense) => ({ ...expense, user: req.user._id })),
  );

  return res
    .status(201)
    .json(new ApiResponse(201, expenses, 'Expenses created successfully'));
});

export const getExpenses = asyncHandler(async (req, res) => {
  const { from, to, category, page, limit } = req.validQuery;
  const filter = { user: req.user._id };
  if (category) filter.category = category;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const [expenses, totalExpenses, aggregates, categoryTotals] =
    await Promise.all([
      Expense.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Expense.countDocuments(filter),
      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalCents: { $sum: '$amountCents' },
            transactionCount: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$category',
            totalCents: { $sum: '$amountCents' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalCents: -1 } },
      ]),
    ]);

  const summary = aggregates[0] ?? { totalCents: 0, transactionCount: 0 };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        expenses,
        totalPages: Math.ceil(totalExpenses / limit),
        currentPage: page,
        totalExpenses,
        summary: {
          ...summary,
          categoryTotals: categoryTotals.map((item) => ({
            category: item._id,
            totalCents: item.totalCents,
            count: item.count,
          })),
        },
      },
      'Expenses fetched successfully',
    ),
  );
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!expense) {
    throw new ApiError(404, 'Expense not found or unauthorized');
  }

  expense.set(req.body);
  await expense.save();

  return res
    .status(200)
    .json(new ApiResponse(200, expense, 'Expense updated successfully'));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!expense) {
    throw new ApiError(404, 'Expense not found or unauthorized');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Expense deleted successfully'));
});
