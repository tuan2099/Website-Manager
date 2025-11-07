import { body, query, param } from 'express-validator';

export const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter and one number'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
];

export const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

export const createUserValidator = [
  ...registerValidator,
  body('roleIds')
    .optional()
    .isArray()
    .withMessage('Role IDs must be an array')
];

export const updateUserValidator = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }),
  body('email')
    .optional()
    .trim()
    .isEmail(),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
