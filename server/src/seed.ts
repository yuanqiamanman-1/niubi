import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultMerchant() {
  try {
    const existingMerchant = await prisma.merchant.findFirst();
    if (existingMerchant) {
      console.log('默认商家账户已存在');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const merchant = await prisma.merchant.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    });

    console.log('默认商家账户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
  } catch (error) {
    console.error('创建默认商家账户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultMerchant();