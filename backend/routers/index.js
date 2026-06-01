import express from 'express';
import AuthRouter from './AuthRouter.js';
import CourseRouter from './CourseRouter.js';

const Router = express.Router();

// Main API router — mounts feature routers (express reference: api/routers/index.js)
Router.use('/auth', AuthRouter);
Router.use('/courses', CourseRouter);

export default Router;
