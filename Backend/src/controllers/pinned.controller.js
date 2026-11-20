import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Habit } from '../models/habit.model.js';
import { Resource } from '../models/resource.model.js';
import { Journal } from '../models/journal.model.js';

export const getPinnedItems = asyncHandler(async (req, res) => {
  const [habits, books, journals] = await Promise.all([
    Habit.find({ user: req.user._id, isPinned: true })
      .select('title description isPinned isArchived updatedAt')
      .sort({ updatedAt: -1 }),
    Resource.find({
      user: req.user._id,
      type: 'Book',
      isPinned: true,
    })
      .select('title author category isPinned updatedAt')
      .sort({ updatedAt: -1 }),
    Journal.find({ user: req.user._id, isPinned: true }).sort({
      updatedAt: -1,
    }).select('title kind updatedAt'),
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { habits, books, journals },
        'Pinned items fetched successfully',
      ),
    );
});
