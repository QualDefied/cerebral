import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Create default user if it doesn't exist
    await createDefaultUser();
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const createDefaultUser = async () => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: 'demo-user' }
    });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: 'demo-user',
          email: 'demo@teamshell.com',
          password: 'demo123', // Simple password for demo
          firstName: 'Demo',
          lastName: 'User'
        }
      });
      console.log('Default demo user created');
    }
  } catch (error) {
    console.log('Default user creation skipped:', error.message);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};