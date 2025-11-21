const express = require('express');
const controller = require('./auth.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/refresh', controller.refresh);
router.post('/change-password', authMiddleware, activityLogger, controller.changePassword);

module.exports = router;
