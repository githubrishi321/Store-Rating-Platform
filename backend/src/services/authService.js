const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

const prisma = new PrismaClient();

/**
 * Register a new Normal User.
 */
const register = async ({ name, email, password, address }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email is already registered.');
    err.status = 409;
    throw err;
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, address, role: 'NORMAL_USER' },
    select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
};

/**
 * Login — validate credentials, return JWT.
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token };
};

/**
 * Update password — verify current, hash new.
 */
const updatePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) {
    const err = new Error('Current password is incorrect.');
    err.status = 400;
    throw err;
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};

module.exports = { register, login, updatePassword };
