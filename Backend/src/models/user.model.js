import crypto from 'node:crypto';
import { env } from '../config/env.js';
import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

// A real bcrypt hash of a throwaway string, created once at startup
// to keep login timing similar when an email does not exist.
export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is needed'],
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
      },
      sidebarCollapsed: {
        type: Boolean,
        default: false,
      },
    },
    // refreshToken removed: refresh tokens will be managed by sessions.
  },
  {
    timestamps: true,
  },
);

// Hash the password before saving the user.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

// Check whether the provided password is correct.
userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate a short-lived access token.
userSchema.methods.generateAccessToken = function (sessionId) {
  return jwt.sign(
    {
      _id: this._id,
      sid: sessionId,
    },
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256',
    },
  );
};

// Generate a unique refresh token for a particular session.
userSchema.methods.generateRefreshToken = function (sessionId) {
  return jwt.sign(
    {
      _id: this._id,
      sid: sessionId,
      jti: crypto.randomUUID(),
    },
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
    },
  );
};

export const User = mongoose.model('User', userSchema);
