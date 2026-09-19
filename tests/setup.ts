import 'dotenv/config';
import { beforeEach, afterAll } from 'vitest';
import prisma from '../src/config/db';

beforeEach(async () => {
  await prisma.product.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
