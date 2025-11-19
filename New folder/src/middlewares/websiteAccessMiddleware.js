const db = require('../database/models');

function requireWebsiteAccess(requiredPermission = 'view') {
  return async (req, res, next) => {
    try {
      const websiteId = req.params.id || req.params.websiteId;
      if (!websiteId) {
        return res.status(400).json({ message: 'Website id missing' });
      }

      const website = await db.Website.findByPk(websiteId);
      if (!website) {
        return res.status(404).json({ message: 'Website not found' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const requireEdit = requiredPermission === 'edit';

      if (website.owner_user_id === userId) {
        req.website = website;
        return next();
      }

      if (website.team_id) {
        const userTeam = await db.UserTeam.findOne({
          where: { team_id: website.team_id, user_id: userId },
        });
        if (userTeam) {
          req.website = website;
          return next();
        }
      }

      const member = await db.WebsiteMember.findOne({
        where: { website_id: websiteId, user_id: userId },
      });

      if (member) {
        if (!requireEdit || member.permission === 'edit') {
          req.website = website;
          return next();
        }
      }

      return res.status(403).json({ message: 'Forbidden: missing website access' });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

module.exports = requireWebsiteAccess;
