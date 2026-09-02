const storeService = require('../services/storeService');

const listStores = async (req, res, next) => {
  try {
    const { search, sortBy, order } = req.query;
    const stores = await storeService.listStores({
      search,
      sortBy,
      order,
      userId: req.user.id,
    });
    return res.status(200).json({ stores });
  } catch (err) {
    next(err);
  }
};

const submitRating = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { value } = req.body;
    const rating = await storeService.upsertRating({
      userId: req.user.id,
      storeId,
      value: parseInt(value, 10),
    });
    return res.status(200).json({ rating });
  } catch (err) {
    next(err);
  }
};

module.exports = { listStores, submitRating };
