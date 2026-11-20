import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { Resource } from '../models/resource.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { escapeRegExp } from '../utils/escapeRegExp.js';

const createResource = asyncHandler(async (req, res) => {
  // req.body was cleaned by zod (unknown keys removed); user is always the logged-in one
  const resource = await Resource.create({ ...req.body, user: req.user._id });

  return res
    .status(201)
    .json(new ApiResponse(201, resource, 'Resource added successfully'));
});

const getResources = asyncHandler(async (req, res) => {
  const { page, limit, type, status, category, q } = req.validQuery;
  const filter = { user: req.user._id };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (q) {
    const search = new RegExp(escapeRegExp(q), 'i');
    filter.$or = [{ title: search }, { author: search }];
  }

  const [resources, totalResources] = await Promise.all([
    Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Resource.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resources,
        totalPages: Math.ceil(totalResources / limit),
        currentPage: page,
        totalResources,
      },
      'Resources fetched successfully',
    ),
  );
});

const getResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found or unauthorized');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, resource, 'Resource fetched successfully'));
});

const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found or unauthorized');
  }

  resource.set(req.body);
  await resource.save(); // save() runs the cross-field rules (currentPage <= pages)

  return res
    .status(200)
    .json(new ApiResponse(200, resource, 'Resource updated successfully'));
});

const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!resource) {
    throw new ApiError(404, 'Resource not found or unauthorized');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Resource deleted successfully'));
});

export {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
};
