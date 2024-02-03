import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function addUser(userData: {
  username: string;
  address: string;
  totalloads: number;
  lastimage: string;
}) {
  const newUser = await prisma.masks.create({
    data: {
        username: userData.username,
        address: userData.address,
        totalloads: userData.totalloads,
        lastimage: userData.lastimage,
    },
  });
  return newUser;
}

export async function incrementUserTotalLoads(username: string): Promise<boolean> {
    const user = await prisma.masks.findFirst({
      where: {
        username: username,
      }
    });
  
    if (user) {
      // User found, increment totalloads
      await prisma.masks.update({
        where: {
          id: user.id,
        },
        data: {
          totalloads: {
            increment: 1 // This uses Prisma's increment feature
          },
        },
      });
      return true; // Return true to indicate success
    }
    
    return false; // Return false to indicate the user was not found
  }