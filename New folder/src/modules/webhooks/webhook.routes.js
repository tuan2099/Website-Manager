const express = require('express');
const controller = require('./webhook.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.get('/', requirePermission('webhook:manage'), controller.listWebhooks);
router.post('/', requirePermission('webhook:manage'), controller.createWebhook);
router.put('/:id', requirePermission('webhook:manage'), controller.updateWebhook);
router.delete('/:id', requirePermission('webhook:manage'), controller.deleteWebhook);

module.exports = router;
