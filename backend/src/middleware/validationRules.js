const { body } = require('express-validator');

// Password regex: 8-16 chars, ≥1 uppercase, ≥1 special char
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format.')
    .normalizeEmail(),
  body('password')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must be 8-16 characters with at least 1 uppercase letter and 1 special character.'),
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Invalid email format.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

const passwordUpdateRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .matches(PASSWORD_REGEX)
    .withMessage('New password must be 8-16 characters with at least 1 uppercase letter and 1 special character.'),
];

const createUserRules = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format.')
    .normalizeEmail(),
  body('password')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must be 8-16 characters with at least 1 uppercase letter and 1 special character.'),
  body('address')
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('role')
    .isIn(['ADMIN', 'NORMAL_USER'])
    .withMessage('Role must be ADMIN or NORMAL_USER.'),
];

const createStoreRules = [
  body('name').trim().notEmpty().withMessage('Store name is required.'),
  body('email').trim().isEmail().withMessage('Invalid store email format.').normalizeEmail(),
  body('address').trim().isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.'),
  body('ownerName')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Owner name must be between 20 and 60 characters.'),
  body('ownerEmail').trim().isEmail().withMessage('Invalid owner email format.').normalizeEmail(),
  body('ownerPassword')
    .matches(PASSWORD_REGEX)
    .withMessage('Owner password must be 8-16 characters with at least 1 uppercase letter and 1 special character.'),
];

const ratingRules = [
  body('value')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

module.exports = {
  registerRules,
  loginRules,
  passwordUpdateRules,
  createUserRules,
  createStoreRules,
  ratingRules,
};
