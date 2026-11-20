import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Journal } from '../models/journal.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.create({
    ...req.body,
    user: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, journal, 'Journal entry created successfully'));
});

const getJournals = asyncHandler(async (req, res) => {
  const { page, limit } = req.validQuery;
  const filter = { user: req.user._id };

  const [journals, totalJournals] = await Promise.all([
    Journal.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Journal.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        journals,
        totalPages: Math.ceil(totalJournals / limit),
        currentPage: page,
        totalJournals,
      },
      'Journal entries fetched successfully',
    ),
  );
});

const updateJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true },
  );

  if (!journal) {
    throw new ApiError(404, 'Journal entry not found or unauthorized');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, journal, 'Journal entry updated successfully'));
});

const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!journal) {
    throw new ApiError(404, 'Journal entry not found or unauthorized');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Journal entry deleted successfully'));
});

export { createJournal, getJournals, updateJournal, deleteJournal };
