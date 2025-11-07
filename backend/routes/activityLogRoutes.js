import express from 'express';
import * as activityLogController from '../controllers/activityLogController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', checkPermission('logs', 'read'), activityLogController.getLogs);
router.get('/user/:userId', activityLogController.getUserLogs);

export default router;
