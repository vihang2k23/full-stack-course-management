import express from 'express';
import authRoutes from './authRoutes.js';
import courseRoutes from './courseRoutes.js';

const router = express.Router();

// Main API Router.
// Acts as the central hub for all feature-specific route modules.
// Prefixing routes here keeps the application highly organized.
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);

export default router;
