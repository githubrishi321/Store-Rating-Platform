/**
 * Global error-handling middleware.
 * Always returns a consistent JSON error shape.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return res.status(409).json({ error: `A record with this ${field} already exists.` });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  return res.status(status).json({ error: message });
};

module.exports = errorHandler;
