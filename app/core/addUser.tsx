import { supabase } from '../lib/supabase';

interface UserData {
    username: string;
    address: string;
    totalloads: number;
    following: boolean;
    image: string;
}

export async function addUser(userData: UserData) {
    console.time('Create User From Supabase');
    console.log(userData);

    const { data, error } = await supabase
        .from('masks') // Replace with your actual table name
        .insert([{
            username: userData.username,
            address: userData.address,
            loads: userData.totalloads,
            following: userData.following,
            image: userData.image,
        }]);

    console.timeEnd('Create User From Supabase');

    if (error) {
        console.error("Supabase insertion error:", error);
        return false; // Return false to indicate the operation failed
    }

    return true; // Return true to indicate the operation was successful
}

export async function incrementUserTotalLoads(username: string) {
    console.time('Fetch and Update User From Supabase');
    console.log(username);

    const { data, error } = await supabase
        .from('masks') // Replace with your actual table name
        .select('id, totalloads')
        .eq('username', username)
        .single();

    if (error) {
        console.error("Supabase select error:", error);
        console.timeEnd('Fetch and Update User From Supabase');
        return false; // Return false to indicate the operation failed
    }

    if (data) {
        const { error: updateError } = await supabase
            .from('masks') // Again, replace with your actual table name
            .update({
                loads: data.totalloads + 1,
                lastupdate: new Date(),
            })
            .match({ id: data.id });

        console.timeEnd('Fetch and Update User From Supabase');

        if (updateError) {
            console.error("Supabase update error:", updateError);
            return false; // Return false to indicate the operation failed
        }

        return true; // Return true to indicate the operation was successful
    } else {
        console.error("User not found for updating total loads");
        console.timeEnd('Fetch and Update User From Supabase');
        return false; // Return false to indicate the user was not found
    }
}


/*import { PrismaClient } from '@prisma/client';
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
    const user = await prisma.masks.findUnique({
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
}*/