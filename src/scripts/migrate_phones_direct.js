import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRANDS_FILE = path.join(__dirname, '../../mobilephone-brands-and-models-master/brands.json');
const DEVICES_FILE = path.join(__dirname, '../../mobilephone-brands-and-models-master/devices.json');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY; // Using anon key might be restricted by RLS, but let's try. Service role is better if available (SUPABASE_SERVICE_ROLE_KEY)
// For local script, we usually want service role to bypass RLS, but user might not have it in .env. 
// We will try with available key and hope user has insert policy or uses service key.

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const main = async () => {
    try {
        console.log('Starting migration...');

        // 1. Brands
        console.log('Reading brands...');
        const brandsData = JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf8'));
        const brands = brandsData.RECORDS.map(b => ({
            id: b.id,
            name: b.name,
            logo: b.logo,
            created_at: b.created_at || new Date().toISOString()
        }));

        console.log(`Inserting ${brands.length} brands...`);
        // Upsert to avoid duplicates if partial run happened
        const { error: brandError } = await supabase
            .from('phone_brands')
            .upsert(brands, { onConflict: 'id' });

        if (brandError) {
            console.error('Error inserting brands:', brandError);
            // Don't exit, might be RLS, let's try models
        } else {
            console.log('Brands inserted successfully.');
        }

        // 2. Models
        console.log('Reading devices...');
        const devicesData = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8'));
        const records = devicesData.RECORDS;

        console.log(`Processing ${records.length} devices...`);

        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize).map(d => {
                let specs = null;
                if (d.specifications) {
                    try {
                        specs = typeof d.specifications === 'string' ? JSON.parse(d.specifications) : d.specifications;
                    } catch (e) {
                        specs = null;
                    }
                }

                return {
                    id: d.id,
                    brand_id: d.brand_id,
                    name: d.name,
                    picture: d.picture,
                    released_at: d.released_at,
                    body: d.body,
                    os: d.os,
                    storage: d.storage,
                    display_size: d.display_size,
                    display_resolution: d.display_resolution,
                    camera_pixels: d.camera_pixels,
                    video_pixels: d.video_pixels,
                    ram: d.ram,
                    chipset: d.chipset,
                    battery_size: d.battery_size,
                    battery_type: d.battery_type,
                    specifications: specs,
                    created_at: d.created_at || new Date().toISOString()
                };
            });

            const { error: modelError } = await supabase
                .from('phone_models')
                .upsert(batch, { onConflict: 'id' });

            if (modelError) {
                console.error(`Error inserting batch ${i}:`, modelError.message);
            } else {
                if (i % 1000 === 0) console.log(`Inserted ${i} / ${records.length} models...`);
            }
        }

        console.log('Migration completed.');

    } catch (err) {
        console.error('Migration failed:', err);
    }
};

main();
