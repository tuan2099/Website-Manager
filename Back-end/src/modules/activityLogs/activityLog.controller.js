const db = require('../../database/models');

async function listActivityLogs(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = (page - 1) * limit;

  const { rows, count } = await db.ActivityLog.findAndCountAll({
    include: [
      {
        model: db.User,
        as: 'user',
        attributes: ['id', 'email', 'name'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  res.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

module.exports = {
  listActivityLogs,
};
