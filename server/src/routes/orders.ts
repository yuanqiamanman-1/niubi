import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '需要登录' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: '无效的令牌' });
    }
    req.user = user;
    next();
  });
};

// Get today's stats
router.get('/stats/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Get today stats error:', error);
    res.status(500).json({ message: '获取今日统计失败' });
  }
});

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: '获取订单失败' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { brand, model, tension, string_type, contact_name, contact_phone, amount } = req.body;

    if (!brand || !model || !tension || !string_type || !contact_name || !contact_phone || !amount) {
      return res.status(400).json({ message: '请填写所有必填字段' });
    }

    const order = await prisma.order.create({
      data: {
        brand,
        model,
        tension,
        stringType: string_type,
        contactName: contact_name,
        contactPhone: contact_phone,
        amount,
        status: 'pending'
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: '创建订单失败' });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: '无效的状态' });
    }

    const data: any = { status };
    if (status === 'completed') {
      data.completedAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: '更新订单状态失败' });
  }
});

export default router;