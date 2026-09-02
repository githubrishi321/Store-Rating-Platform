const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../utils/hash');

const prisma = new PrismaClient();

// ─── Dashboard ───────────────────────────────────────────────────────────────

const getDashboardStats = async () => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);
  return { totalUsers, totalStores, totalRatings };
};

// ─── Users ────────────────────────────────────────────────────────────────────

const buildUserWhere = ({ name, email, address, role }) => {
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  if (role) where.role = role;
  return where;
};

const listUsers = async ({ name, email, address, role, sortBy = 'name', order = 'asc' }) => {
  const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
  const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const dir = order === 'desc' ? 'desc' : 'asc';

  const users = await prisma.user.findMany({
    where: buildUserWhere({ name, email, address, role }),
    orderBy: { [field]: dir },
    select: {
      id: true, name: true, email: true, address: true, role: true, createdAt: true,
    },
  });
  return users;
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, address: true, role: true, createdAt: true,
      ownedStore: {
        select: {
          id: true, name: true, email: true, address: true,
          ratings: { select: { value: true } },
        },
      },
    },
  });
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  // Compute average rating if store owner
  if (user.ownedStore) {
    const ratings = user.ownedStore.ratings;
    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : null;
    user.ownedStore.averageRating = avg ? parseFloat(avg.toFixed(2)) : null;
    delete user.ownedStore.ratings;
  }

  return user;
};

const createUser = async ({ name, email, password, address, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email is already registered.');
    err.status = 409;
    throw err;
  }
  const hashed = await hashPassword(password);
  return prisma.user.create({
    data: { name, email, password: hashed, address, role },
    select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
  });
};

// ─── Stores ───────────────────────────────────────────────────────────────────

const buildStoreWhere = ({ name, email, address }) => {
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  return where;
};

const listStores = async ({ name, email, address, sortBy = 'name', order = 'asc' }) => {
  const allowedSortFields = ['name', 'email', 'address', 'createdAt'];
  const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const dir = order === 'desc' ? 'desc' : 'asc';

  const stores = await prisma.store.findMany({
    where: buildStoreWhere({ name, email, address }),
    orderBy: { [field]: dir },
    select: {
      id: true, name: true, email: true, address: true, createdAt: true,
      owner: { select: { id: true, name: true, email: true } },
      ratings: { select: { value: true } },
    },
  });

  // Attach computed average rating
  return stores.map((s) => {
    const ratings = s.ratings;
    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : null;
    return {
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      createdAt: s.createdAt,
      owner: s.owner,
      averageRating: avg ? parseFloat(avg.toFixed(2)) : null,
      totalRatings: ratings.length,
    };
  });
};

const createStore = async ({ name, email, address, ownerName, ownerEmail, ownerPassword, ownerAddress }) => {
  // Check store email
  const existingStore = await prisma.store.findUnique({ where: { email } });
  if (existingStore) {
    const err = new Error('A store with this email already exists.');
    err.status = 409;
    throw err;
  }

  // Check owner email
  const existingOwner = await prisma.user.findUnique({ where: { email: ownerEmail } });
  if (existingOwner) {
    const err = new Error('A user with the owner email already exists.');
    err.status = 409;
    throw err;
  }

  const hashed = await hashPassword(ownerPassword);

  // Create owner + store in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        name: ownerName,
        email: ownerEmail,
        password: hashed,
        address: ownerAddress || address,
        role: 'STORE_OWNER',
      },
    });

    const store = await tx.store.create({
      data: { name, email, address, ownerId: owner.id },
      select: {
        id: true, name: true, email: true, address: true, createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    return store;
  });

  return result;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const deleteUser = async (targetUserId, requestingAdminId) => {
  if (!targetUserId || !UUID_REGEX.test(targetUserId)) {
    const err = new Error('Invalid user ID format.');
    err.status = 400;
    throw err;
  }

  if (targetUserId === requestingAdminId) {
    const err = new Error('You cannot delete your own active admin account.');
    err.status = 400;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { ownedStore: true },
  });

  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  // Atomically delete dependent records and user
  await prisma.$transaction(async (tx) => {
    // 1. Delete all ratings submitted by this user
    await tx.rating.deleteMany({ where: { userId: targetUserId } });

    // 2. If user owns a store, delete all ratings for that store and then the store
    if (user.ownedStore) {
      await tx.rating.deleteMany({ where: { storeId: user.ownedStore.id } });
      await tx.store.delete({ where: { id: user.ownedStore.id } });
    }

    // 3. Delete the user
    await tx.user.delete({ where: { id: targetUserId } });
  });

  return { message: 'User deleted successfully.' };
};

const deleteStore = async (storeId) => {
  if (!storeId || !UUID_REGEX.test(storeId)) {
    const err = new Error('Invalid store ID format.');
    err.status = 400;
    throw err;
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    const err = new Error('Store not found.');
    err.status = 404;
    throw err;
  }

  // Atomically delete store ratings and store record
  await prisma.$transaction(async (tx) => {
    // 1. Delete all ratings for this store
    await tx.rating.deleteMany({ where: { storeId } });

    // 2. Delete the store
    await tx.store.delete({ where: { id: storeId } });
  });

  return { message: 'Store deleted successfully.' };
};

module.exports = {
  getDashboardStats,
  listUsers,
  getUserById,
  createUser,
  deleteUser,
  listStores,
  createStore,
  deleteStore,
};
