const ownerService = require('../services/ownerService');

const getDashboard = async (req, res, next) => {
  try {
    const data = await ownerService.getOwnerDashboard(req.user.id);
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
