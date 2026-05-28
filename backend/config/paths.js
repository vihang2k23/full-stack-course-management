// Absolute paths for uploaded files (anchored to backend/, not process.cwd()).
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BACKEND_ROOT = path.join(__dirname, '..');
export const UPLOADS_DIR = path.join(BACKEND_ROOT, 'uploads');
export const COURSE_UPLOADS_DIR = path.join(UPLOADS_DIR, 'courses');
export const USER_UPLOADS_DIR = path.join(UPLOADS_DIR, 'users');
