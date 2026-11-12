// Vercel Serverless entry: wraps the Express API in server/ (CommonJS)
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const app = require('../server/index.js');

export default app;
