const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get the store owned by the given userId,
 * compute average rating, and list users who rated it.
 */
const getOwnerDashboard = async (ownerId) => {
  const store = await prisma.store.findUnique({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      ratings: {
        select: {
          value: true,
          createdAt: true,
          updatedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!store) {
    const err = new Error('No store found for this owner.');
    err.status = 404;
    throw err;
  }

  const ratings = store.ratings;
  const avg = ratings.length
    ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
    : null;

  return {
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
    },
    averageRating: avg ? parseFloat(avg.toFixed(2)) : null,
    totalRatings: ratings.length,
    raters: ratings.map((r) => ({
      userId: r.user.id,
      name: r.user.name,
      email: r.user.email,
      rating: r.value,
      submittedAt: r.updatedAt,
    })),
  };
};

module.exports = { getOwnerDashboard };
