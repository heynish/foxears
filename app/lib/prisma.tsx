// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!global.prisma) {
    global.prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
}

prisma = global.prisma;

export default prisma;