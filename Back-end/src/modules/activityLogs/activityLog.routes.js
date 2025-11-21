const express = require('express');
const controller = require('./activityLog.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/', requirePermission('activityLog:list'), controller.listActivityLogs);

module.exports = router;
