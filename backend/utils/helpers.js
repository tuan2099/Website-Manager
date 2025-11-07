import crypto from 'crypto';

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashResetToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  const { Op } = require('sequelize');
  return {
    [Op.or]: fields.map(field => ({
      [field]: {
        [Op.iLike]: `%${searchTerm}%`
      }
    }))
  };
};
