import { PrismaClient } from '@prisma/client';
//const prisma = new PrismaClient();
import prisma from '../lib/prisma';

export async function addUser(userData: {

    username: string;
    address: string;
    totalloads: number;
    following: boolean;
    image: string;
}) {
    console.time('Create User From Postgres');
    const newUser = await prisma.masks.create({
        data: {
            username: userData.username,
            address: userData.address,
            totalloads: userData.totalloads,
            following: userData.following,
            image: userData.image,
        },
    });
    await prisma.$disconnect();
    console.timeEnd('Create User From Postgres');
    return true;
}
export async function incrementUserTotalLoads(username: string): Promise<boolean> {
    console.time('Fetch User From Postgres');
    const user = await prisma.masks.findFirst({
        where: {
            username: username,
        }
    });
    await prisma.$disconnect();
    console.timeEnd('Fetch User From Postgres');


    if (user) {
        // User found, increment totalloads
        console.time('Update User From Postgres');
        await prisma.masks.update({
            where: {
                id: user.id,
            },
            data: {
                totalloads: {
                    increment: 1, // This uses Prisma's increment feature
                },
                lastupdate: new Date(),
            },
        });
        await prisma.$disconnect();
        console.timeEnd('Update User From Postgres');
        return true; // Return true to indicate success
    }


    return false; // Return false to indicate the user was not found
}