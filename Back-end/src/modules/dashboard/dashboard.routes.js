const express = require('express');
const controller = require('./dashboard.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/summary', requirePermission('dashboard:view'), controller.getSummary);

module.exports = router;
