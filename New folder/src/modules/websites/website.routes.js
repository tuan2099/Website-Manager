const express = require('express');
const controller = require('./website.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const requirePermission = require('../../middlewares/permissionMiddleware');
const activityLogger = require('../../middlewares/activityLogger');

const requireWebsiteAccess = require('../../middlewares/websiteAccessMiddleware');

const router = express.Router();

router.use(authMiddleware, activityLogger);

router.post('/', requirePermission('website:create'), controller.createWebsite);
router.get('/', requirePermission('website:list'), controller.listWebsites);
router.get('/export', requirePermission('website:list'), controller.exportWebsites);
router.post('/import', requirePermission('website:create'), controller.importWebsites);
router.get('/:id', requirePermission('website:view'), requireWebsiteAccess('view'), controller.getWebsite);
router.put('/:id', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.updateWebsite);
router.delete('/:id', requirePermission('website:delete'), requireWebsiteAccess('edit'), controller.deleteWebsite);
router.post('/:id/check-now', requirePermission('website:checkNow'), requireWebsiteAccess('edit'), controller.checkNow);
router.get('/:id/checks', requirePermission('website:viewChecks'), requireWebsiteAccess('view'), controller.listChecks);
router.get('/:id/stats', requirePermission('website:viewChecks'), requireWebsiteAccess('view'), controller.getStats);
router.get('/:id/dns-records', requirePermission('website:view'), requireWebsiteAccess('view'), controller.listDnsRecords);
router.post('/:id/dns-records', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.createDnsRecord);
router.put('/:id/dns-records/:recordId', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.updateDnsRecord);
router.delete('/:id/dns-records/:recordId', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.deleteDnsRecord);
router.post('/:id/members', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.addWebsiteMember);
router.delete('/:id/members/:userId', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.removeWebsiteMember);
router.post('/:id/tags', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.addTag);
router.delete('/:id/tags/:tagId', requirePermission('website:update'), requireWebsiteAccess('edit'), controller.removeTag);

module.exports = router;
