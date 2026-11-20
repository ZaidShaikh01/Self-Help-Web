import bcrypt from 'bcrypt';
import { Session } from '../models/session.model.js';
import { createSession, rotateSession } from '../services/session.service.js';
import { accessCookieOptions, refreshCookieOptions } from '../utils/cookies.js';
import { User, DUMMY_HASH } from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  registerSchema,
  loginSchema,
  updateFullNameSchema,
  updatePasswordSchema,
  updatePreferencesSchema,
} from '../validators/auth.validator.js';

const registerUser = asyncHandler(async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues[0].message || 'Invalid request data',
    );
  }

  // result.data is clean validated data
  const { fullname, email, username, password } = result.data;

  // The difference between findOne and findById is that findOne allows you to search for a document based on any field or combination of fields, while findById specifically searches for a document by its unique identifier (_id). In this case, we are using findOne to check if a user with the provided email already exists in the database.
  const existedUser = await User.findOne({
    $or: [{ email }, { username: username.toLowerCase() }],
  });

  if (existedUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  // Create the user in the database
  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
  });

  // Select the user without the password and refreshToken fields to return in the response
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken',
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering user');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User Registered successfully!'));
});

// login section

const loginUser = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues[0].message || 'Invalid request data',
    );
  }

  // Destructure email and password from the request body
  const { email, password } = result.data;

  // Find the user using email field
  const user = await User.findOne({ email });

  // Always run one bcrypt comparison, even if the user doesn't exist,
  // so response time doesn't reveal whether the email is registered.
  const hashToCheck = user ? user.password : DUMMY_HASH;
  const passwordMatches = await bcrypt.compare(password, hashToCheck);

  // One message and one status for both failure cases
  if (!user || !passwordMatches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { accessToken, refreshToken } = await createSession(user, req);

  const loggedInUser = await User.findById(user._id).select('-password');

  // Tokens travel only in httpOnly cookies, never in the JSON body
  return res
    .status(200)
    .cookie('accessToken', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser },
        'User logged in successfully',
      ),
    );
});

// logout section

const logoutUser = asyncHandler(async (req, res) => {
  await Session.deleteOne({ _id: req.sessionId, user: req.user._id });

  return res
    .status(200)
    .clearCookie('accessToken', accessCookieOptions)
    .clearCookie('refreshToken', refreshCookieOptions)
    .json(new ApiResponse(200, {}, 'Logout successful'));
});

const logoutAll = asyncHandler(async (req, res) => {
  await Session.deleteMany({ user: req.user._id });

  return res
    .status(200)
    .clearCookie('accessToken', accessCookieOptions)
    .clearCookie('refreshToken', refreshCookieOptions)
    .json(new ApiResponse(200, {}, 'Logged out from all devices'));
});

// Cookie only: accepting it from the body would expose it to page JavaScript
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken;
  if (!incoming) throw new ApiError(401, 'Unauthorized request');

  const { accessToken, refreshToken } = await rotateSession(incoming);

  return res
    .status(200)
    .cookie('accessToken', accessToken, accessCookieOptions)
    .cookie('refreshToken', refreshToken, refreshCookieOptions)
    .json(new ApiResponse(200, {}, 'Access token refreshed'));
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ user: req.user._id })
    .sort({ lastUsedAt: -1 })
    .select('userAgent ip createdAt lastUsedAt');

  const data = sessions.map((s) => ({
    ...s.toObject(),
    current: s._id.toString() === req.sessionId,
  }));

  return res.status(200).json(new ApiResponse(200, data, 'Sessions fetched'));
});

const revokeSession = asyncHandler(async (req, res) => {
  // the :id format is already checked by router.param in user.routes.js
  const result = await Session.deleteOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!result.deletedCount) throw new ApiError(404, 'Session not found');

  return res.status(200).json(new ApiResponse(200, {}, 'Session revoked'));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const result = updatePasswordSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues[0].message || 'Invalid request data',
    );
  }

  const { oldPassword, newPassword } = result.data;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old password and new password are required');
  }

  // If old password and new password are same then we throw an error
  if (oldPassword === newPassword) {
    throw new ApiError(400, 'New password cannot be same as old password');
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'Incorrect old password');
  }

  // validateBeforeSave is set to false because we don't want to run the validation again, as we are only updating the password field. This is important because if we had other required fields in the user schema that are not being updated, the validation would fail and throw an error. By setting validateBeforeSave to false, we bypass the validation for those fields and only update the password.
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  await Session.deleteMany({ user: user._id, _id: { $ne: req.sessionId } });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password changed successfully'));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'Current user fetched successfully'));
});

const getPreferences = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      req.user.preferences || { sidebarCollapsed: false },
      'Preferences fetched successfully',
    ),
  );
});

const updatePreferences = asyncHandler(async (req, res) => {
  const result = updatePreferencesSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues[0].message || 'Invalid preference data',
    );
  }

  const updates = Object.fromEntries(
    Object.entries(result.data).map(([key, value]) => [
      `preferences.${key}`,
      value,
    ]),
  );
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true },
  ).select('-password');

  if (!user) throw new ApiError(404, 'User not found');
  return res
    .status(200)
    .json(new ApiResponse(200, user.preferences, 'Preferences updated'));
});

const changeCurrentName = asyncHandler(async (req, res) => {
  const result = updateFullNameSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(
      400,
      result.error.issues[0].message || 'Invalid request data',
    );
  }

  const { fullname } = result.data;

  if (!fullname) {
    throw new ApiError(400, 'Full name is required');
  }

  if (fullname === req.user?.fullname) {
    throw new ApiError(400, 'New full name cannot be same as old full name');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
      },
    },
    { new: true },
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account details updated successfully'));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  logoutAll,
  refreshAccessToken,
  getSessions,
  revokeSession,
  changeCurrentPassword,
  getCurrentUser,
  getPreferences,
  updatePreferences,
  changeCurrentName,
};
