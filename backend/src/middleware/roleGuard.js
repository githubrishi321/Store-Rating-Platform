/**
 * Role guard factory — returns middleware that allows only specified roles.
 * @param {...string} roles - Allowed roles (e.g. 'ADMIN', 'NORMAL_USER').
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

module.exports = requireRole;
