import mongoose, { Schema } from 'mongoose';
import { HabitLog } from './habitLog.model.js';
import {
  TIME_RE,
  dateValidator,
  dayNumber,
  fromDayNumber,
  isValidTimezone,
  todayInTimezone,
  weekdayOf,
} from '../utils/HabitDate.js';

/* --------------------------------- Schema ---------------------------------- */

const habitSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [80, 'Title can be at most 80 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description can be at most 300 characters'],
      default: '',
    },
    tags: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 20 }],
      // normalise and de-duplicate: ["Health", "health "] -> ["health"]
      set: (value) =>
        Array.isArray(value)
          ? [
              ...new Set(
                value
                  .map((t) => String(t).trim().toLowerCase())
                  .filter(Boolean),
              ),
            ]
          : value,
      validate: [(v) => v.length <= 10, 'A habit can have at most 10 tags'],
    },

    schedule: {
      type: {
        type: String,
        enum: ['daily', 'weekdays', 'custom'],
        default: 'daily',
      },
      // 0 = Sunday ... 6 = Saturday. Only used when type is 'custom'
      daysOfWeek: {
        type: [{ type: Number, min: 0, max: 6 }],
        default: [],
        set: (value) =>
          Array.isArray(value) ? [...new Set(value)].sort() : value,
      },
    },

    target: {
      count: {
        type: Number,
        min: [1, 'Target must be at least 1'],
        default: 1,
      }, // e.g. 8
      unit: { type: String, trim: true, maxlength: 20, default: 'times' }, // e.g. "glasses"
    },

    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      validate: { validator: isValidTimezone, message: 'Invalid timezone' },
    },

    startDate: {
      type: String,
      validate: dateValidator,
      // by default a habit starts "today" in its own timezone
      default: function () {
        return todayInTimezone(this.timezone);
      },
    },

    endDate: { type: String, validate: dateValidator }, // optional

    reminder: {
      enabled: { type: Boolean, default: false },
      time: { type: String, match: [TIME_RE, 'Reminder time must be HH:mm'] }, // "07:30"
    },

    color: {
      type: String,
      match: [/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #4f46e5'],
      default: '#4f46e5',
    },

    isArchived: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },

    // Cached values, recomputed by recalculateStreaks() whenever a log changes
    currentStreak: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

/* --------------------------------- Indexes --------------------------------- */

// A user cannot have two habits with the same title (case-insensitive).
// The controller should catch error.code === 11000 and return 409.
habitSchema.index(
  { user: 1, title: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);
habitSchema.index({ user: 1, tags: 1 });
habitSchema.index({ user: 1, isArchived: 1 });
habitSchema.index({ user: 1, isPinned: 1 });

/* ---------------------------- Cross-field rules ---------------------------- */

habitSchema.pre('validate', async function () {
  if (
    this.schedule.type === 'custom' &&
    this.schedule.daysOfWeek.length === 0
  ) {
    this.invalidate(
      'schedule.daysOfWeek',
      'Pick at least one day for a custom schedule',
    );
  }
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date cannot be before the start date');
  }
  if (this.reminder.enabled && !this.reminder.time) {
    this.invalidate(
      'reminder.time',
      'Reminder time is required when reminders are enabled',
    );
  }
});

/* ---------------------------- Instance methods ----------------------------- */

// Is this date a scheduled day, and inside startDate..endDate?
habitSchema.methods.isScheduledOn = function (date) {
  if (date < this.startDate) return false;
  if (this.endDate && date > this.endDate) return false;

  const weekday = weekdayOf(date);
  switch (this.schedule.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return weekday >= 1 && weekday <= 5;
    default:
      return this.schedule.daysOfWeek.includes(weekday);
  }
};

// Does this progress value meet the daily target?
habitSchema.methods.isComplete = function (value) {
  return value >= this.target.count;
};

// "Today" in this habit's own timezone
habitSchema.methods.today = function () {
  return todayInTimezone(this.timezone);
};

// Walks every scheduled day from startDate to today.
// - completed scheduled day: streak grows
// - missed scheduled day:    streak resets
// - unscheduled day:         ignored (rest days never break a streak)
// - today, not done yet:     ignored (the day isn't over)
habitSchema.methods.recalculateStreaks = async function () {
  const today = this.today();

  const logs = await HabitLog.find({
    habit: this._id,
    value: { $gte: this.target.count },
  })
    .select('date')
    .lean();
  const completed = new Set(logs.map((l) => l.date));

  const todayNumber = dayNumber(today);
  const lastNumber = this.endDate
    ? Math.min(todayNumber, dayNumber(this.endDate))
    : todayNumber;

  let run = 0;
  let longest = 0;

  for (let n = dayNumber(this.startDate); n <= lastNumber; n++) {
    const date = fromDayNumber(n);
    if (!this.isScheduledOn(date)) continue;

    if (completed.has(date)) {
      run += 1;
      if (run > longest) longest = run;
    } else if (n !== todayNumber) {
      run = 0;
    }
  }

  this.currentStreak = run;
  this.longestStreak = longest;

  // Targeted update: no full-document save, no validation re-run
  await this.constructor.updateOne(
    { _id: this._id },
    { $set: { currentStreak: run, longestStreak: longest } },
  );

  return this;
};

habitSchema.methods.archive = async function () {
  this.isArchived = true;
  return this.save();
};

habitSchema.methods.unarchive = async function () {
  this.isArchived = false;
  return this.save();
};

export const Habit = mongoose.model('Habit', habitSchema);
