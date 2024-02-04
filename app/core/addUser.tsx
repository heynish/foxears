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

    if (error) {
        console.error("Supabase insertion error:", error);
        return false; // Return false to indicate the operation failed
    }

    return true; // Return true to indicate the operation was successful
}

export async function incrementUserTotalLoads(username: string) {

    const { data, error } = await supabase
        .from('masks') // Replace with your actual table name
        .select('id, loads')
        .eq('username', username)
        .single();

    if (error) {
        console.log("Supabase select error:", error);
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

        if (updateError) {
            console.log("Supabase update error:", updateError);
            return false; // Return false to indicate the operation failed
        }

        return true; // Return true to indicate the operation was successful
    } else {
        console.log("User not found for updating total loads");
        return false; // Return false to indicate the user was not found
    }
}
