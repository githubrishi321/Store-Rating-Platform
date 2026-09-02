const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * List all stores with optional search (name or address) and sort.
 * Each store includes its average rating and the requesting user's own rating.
 */
const listStores = async ({ search, sortBy = 'name', order = 'asc', userId }) => {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const stores = await prisma.store.findMany({
    where,
    select: {
      id: true,
      name: true,
      address: true,
      email: true,
      ratings: { select: { value: true, userId: true } },
    },
  });

  // Compute averages and user's own rating
  let result = stores.map((s) => {
    const ratings = s.ratings;
    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
      : null;
    const userRating = ratings.find((r) => r.userId === userId);
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      email: s.email,
      averageRating: avg ? parseFloat(avg.toFixed(2)) : null,
      userRating: userRating ? userRating.value : null,
    };
  });

  // Sort
  const allowedSortFields = ['name', 'address', 'averageRating'];
  const field = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const dir = order === 'desc' ? -1 : 1;

  result.sort((a, b) => {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  return result;
};

/**
 * Upsert a rating (1-5) for a given store by the current user.
 */
const upsertRating = async ({ userId, storeId, value }) => {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) {
    const err = new Error('Store not found.');
    err.status = 404;
    throw err;
  }

  const rating = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    update: { value },
    create: { userId, storeId, value },
    select: { id: true, value: true, userId: true, storeId: true, updatedAt: true },
  });

  return rating;
};

module.exports = { listStores, upsertRating };
