import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = process.env.SUPABASE_URL!; // Replace with your Supabase URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Replace with your Supabase anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);

interface UserData {
    username: string;
    address: string;
    totalloads: number;
    following: boolean;
    image: string;
}

export async function addUser(userData: UserData) {
    console.time('Create User From Supabase');
    const { data, error } = await supabase
        .from('masks') // Replace with your actual table name
        .insert([{
            username: userData.username,
            address: userData.address,
            totalloads: userData.totalloads,
            following: userData.following,
            image: userData.image,
        }]);
    console.timeEnd('Create User From Supabase');
    return !error;
}

export async function incrementUserTotalLoads(username: string) {
    console.time('Fetch and Update User From Supabase');

    const { data, error } = await supabase
        .from('masks') // Replace with your actual table name
        .select('id, totalloads')
        .eq('username', username)
        .single();

    if (data) {
        const { error: updateError } = await supabase
            .from('masks') // Replace with your actual table name
            .update({
                totalloads: data.totalloads + 1,
                lastupdate: new Date(),
            })
            .match({ id: data.id });

        console.timeEnd('Fetch and Update User From Supabase');
        return !updateError;
    }

    console.timeEnd('Fetch and Update User From Supabase');
    return false; // Return false to indicate the user was not found
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