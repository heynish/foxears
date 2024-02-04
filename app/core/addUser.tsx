import { supabase } from '../lib/supabase';

interface UserData {
    username: string;
    address: string;
    loads: number;
    following: boolean;
    recasted: boolean;
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
            loads: userData.loads,
            following: userData.following,
            recasted: userData.recasted,
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
        .select('id, loads')
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
                loads: data.loads + 1,
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
