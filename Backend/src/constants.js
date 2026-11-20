// Stores constants used across the project, like the database name.
export const DB_NAME = 'self-help-app';

// Pdf related constants
export const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5 MB
export const PDF_FOLDER = 'pdfs';
export const DOWNLOAD_LINK_EXPIRY = 300; // 5 minutes in seconds

// Single source of truth: the validator AND the model import these
export const RESOURCE_TYPES = ['Book', 'Article', 'YouTube', 'Documentary'];
export const RESOURCE_STATUSES = ['Plan to Do', 'In Progress', 'Completed'];
export const RESOURCE_CATEGORIES = [
  'Productivity',
  'Focus',
  'Finance',
  'Philosophy',
];

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Home',
  'Health',
  'Learning',
  'Leisure',
  'Bills',
  'Other',
];
