import { createClient } from '@supabase/supabase-js';

// Hardcoded for utility script usage
const supabaseUrl = 'https://ecbhhbyfocitafbfsegg.supabase.co';
const supabaseKey = 'sb_publishable_1cB9ghWoQGiL4cwPNRN7IQ_U_pEkr3K';

const supabase = createClient(supabaseUrl, supabaseKey);

const createAdmin = async () => {
    const email = 'admin@saticim.com';
    const password = 'adminPassword123!'; // Strong password

    console.log(`Attempting to create admin user: ${email}`);

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'System Admin'
                }
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                console.log('User already exists. You can log in with:');
            } else {
                console.error('Error creating user:', error.message);
                return;
            }
        } else {
            console.log('Admin user created successfully!');
            console.log('User ID:', data.user?.id);
        }

        console.log('-------------------------------------------');
        console.log('Email: ', email);
        console.log('Password: ', password);
        console.log('-------------------------------------------');
        console.log('IMPORTANT: Now go to Supabase SQL Editor and run the contents of scripts/setup_admin_db.sql to enable the Admin capabilities for this user.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
};

createAdmin();
