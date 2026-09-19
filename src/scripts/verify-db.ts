import 'dotenv/config';
import prisma from '../config/db';

async function verifyDatabaseConnection() {
  try {
    console.log('Connecting to SQLite database via Prisma...');
    await prisma.$connect();
    console.log('Database connected successfully.');

    const productCount = await prisma.product.count();
    console.log(`Connection verified. Total products in database: ${productCount}`);
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseConnection();
