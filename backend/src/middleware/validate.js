const { validationResult } = require('express-validator');

/**
 * Middleware: Run after express-validator chains.
 * If there are validation errors, return 400 with field-level error map.
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = {};
    result.array().forEach((err) => {
      if (!errors[err.path]) {
        errors[err.path] = err.msg;
      }
    });
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = validate;
