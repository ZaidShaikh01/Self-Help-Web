import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Habit } from '../models/habit.model.js';
import { Resource } from '../models/resource.model.js';
import { Journal } from '../models/journal.model.js';
import { Note } from '../models/note.model.js';
import { escapeRegExp } from '../utils/escapeRegExp.js';

const RESULT_LIMIT = 8;

export const globalSearch = asyncHandler(async (req, res) => {
  const expression = new RegExp(escapeRegExp(req.validQuery.q), 'i');
  const owned = { user: req.user._id };

  const [habits, resources, journals, notes] = await Promise.all([
    Habit.find({
      ...owned,
      isArchived: false,
      $or: [
        { title: expression },
        { description: expression },
        { tags: expression },
      ],
    })
      .select('title description updatedAt')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Resource.find({
      ...owned,
      $or: [
        { title: expression },
        { author: expression },
        { summary: expression },
      ],
    })
      .select('title type author updatedAt')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Journal.find({
      ...owned,
      $or: [
        { title: expression },
        { content: expression },
        { tags: expression },
      ],
    })
      .select('title kind date updatedAt')
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
    Note.find({
      ...owned,
      $or: [
        { title: expression },
        { content: expression },
        { quote: expression },
        { tags: expression },
      ],
    })
      .select('title content quote updatedAt resource')
      .populate({ path: 'resource', select: 'title' })
      .sort({ updatedAt: -1 })
      .limit(RESULT_LIMIT)
      .lean(),
  ]);

  const results = [
    ...habits.map((item) => ({
      id: item._id,
      kind: 'habit',
      title: item.title,
      subtitle: item.description || 'Habit',
    })),
    ...resources.map((item) => ({
      id: item._id,
      kind: 'resource',
      title: item.title,
      subtitle: [item.type, item.author].filter(Boolean).join(' · '),
    })),
    ...journals.map((item) => ({
      id: item._id,
      kind: 'journal',
      title: item.title || 'Untitled reflection',
      subtitle: item.kind || 'Journal entry',
    })),
    ...notes.map((item) => ({
      id: item._id,
      kind: 'note',
      title:
        item.title ||
        item.resource?.title ||
        item.quote?.slice(0, 80) ||
        'Personal note',
      subtitle:
        item.resource?.title ||
        item.content?.slice(0, 100) ||
        'Library note',
    })),
  ].sort((left, right) => left.title.localeCompare(right.title));

  return res
    .status(200)
    .json(new ApiResponse(200, results, 'Search results fetched successfully'));
});
