import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find merchant
    const merchant = await prisma.merchant.findUnique({
      where: { username }
    });

    if (!merchant) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, merchant.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // Generate token
    const token = jwt.sign(
      { merchantId: merchant.id, username: merchant.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, merchant: { id: merchant.id, username: merchant.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败' });
  }
});

export default router;