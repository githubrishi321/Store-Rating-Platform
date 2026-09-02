const adminService = require('../services/adminService');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;
    const users = await adminService.listUsers({ name, email, address, role, sortBy, order });
    return res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const user = await adminService.createUser({ name, email, password, address, role });
    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

const listStores = async (req, res, next) => {
  try {
    const { name, email, address, sortBy, order } = req.query;
    const stores = await adminService.listStores({ name, email, address, sortBy, order });
    return res.status(200).json({ stores });
  } catch (err) {
    next(err);
  }
};

const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerName, ownerEmail, ownerPassword, ownerAddress } = req.body;
    const store = await adminService.createStore({
      name, email, address, ownerName, ownerEmail, ownerPassword, ownerAddress,
    });
    return res.status(201).json({ store });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id, req.user.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    const result = await adminService.deleteStore(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  listUsers,
  getUserById,
  createUser,
  deleteUser,
  listStores,
  createStore,
  deleteStore,
};
