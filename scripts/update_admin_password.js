import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhhbyfocitafbfsegg.supabase.co';
const supabaseKey = 'sb_publishable_1cB9ghWoQGiL4cwPNRN7IQ_U_pEkr3K';

const supabase = createClient(supabaseUrl, supabaseKey);

const updateAdminPassword = async () => {
    const email = 'admin@saticim.com';
    const oldPassword = 'adminPassword123!';
    const newPassword = 'admin'; // User requested this specifically

    console.log(`Attempting to login as ${email}...`);

    try {
        // 1. Try to login with the *previous* password we set
        let { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: oldPassword
        });

        // If failed, maybe the user already set it to 'admin' or something else? 
        // Let's try logging in with 'admin' just in case.
        if (error) {
            console.log('Login with old password failed. Trying with "admin"...');
            const retry = await supabase.auth.signInWithPassword({
                email,
                password: newPassword
            });

            if (retry.error) {
                console.error('Could not log in to update password. You may need to reset it manually via Supabase Dashboard if you forgot it.');
                console.error('Error:', retry.error.message);
                return;
            }
            data = retry.data;
            console.log('Already logged in with "admin". No update needed.');
            return;
        }

        console.log('Login successful. Updating password to "admin"...');

        // 2. Update the password
        // Note: Supabase automatically handles the secure Hashing (bcrypt/argon2) of this password.
        const update = await supabase.auth.updateUser({
            password: newPassword
        });

        if (update.error) {
            console.error('Failed to update password:', update.error.message);
            if (update.error.message.includes('Password should be')) {
                console.log('TIP: Supabase requires passwords to be at least 6 characters by default.');
            }
        } else {
            console.log('-------------------------------------------');
            console.log('SUCCESS: Admin password updated!');
            console.log('Email: ', email);
            console.log('New Password: ', newPassword);
            console.log('Hashing: Handled automatically by Supabase Auth (Secure)');
            console.log('-------------------------------------------');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
};

updateAdminPassword();
