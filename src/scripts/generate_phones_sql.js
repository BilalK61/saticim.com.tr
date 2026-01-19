import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BRANDS_FILE = path.join(__dirname, '../../mobilephone-brands-and-models-master/brands.json');
const DEVICES_FILE = path.join(__dirname, '../../mobilephone-brands-and-models-master/devices.json');
const OUTPUT_FILE = path.join(__dirname, '../../import_phones.sql');

const escapeString = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
};

const main = () => {
    try {
        console.log('Reading brands file...');
        const brandsData = JSON.parse(fs.readFileSync(BRANDS_FILE, 'utf8'));

        console.log('Reading devices file...');
        // devices.json is large, ensuring we can parse it
        const devicesData = JSON.parse(fs.readFileSync(DEVICES_FILE, 'utf8'));

        let sqlContent = `-- SQL Import for Phone Brands and Models
-- Generated automatically

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.phone_brands (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.phone_models (
    id BIGINT PRIMARY KEY,
    brand_id BIGINT REFERENCES public.phone_brands(id),
    name TEXT NOT NULL,
    picture TEXT,
    released_at TEXT,
    body TEXT,
    os TEXT,
    storage TEXT,
    display_size TEXT,
    display_resolution TEXT,
    camera_pixels TEXT,
    video_pixels TEXT,
    ram TEXT,
    chipset TEXT,
    battery_size TEXT,
    battery_type TEXT,
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_phone_models_brand_id ON public.phone_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_phone_models_name ON public.phone_models(name);

-- Insert Brands
INSERT INTO public.phone_brands (id, name, logo, created_at) VALUES
`;

        console.log(`Processing ${brandsData.RECORDS.length} brands...`);
        brandsData.RECORDS.forEach((brand, index) => {
            const id = brand.id;
            const name = escapeString(brand.name);
            const logo = escapeString(brand.logo);
            const createdAt = brand.created_at ? `'${brand.created_at}'` : 'NOW()';

            sqlContent += `(${id}, ${name}, ${logo}, ${createdAt})`;
            if (index < brandsData.RECORDS.length - 1) {
                sqlContent += ',\n';
            } else {
                sqlContent += ';\n\n';
            }
        });

        sqlContent += `-- Insert Models
`;

        console.log(`Processing ${devicesData.RECORDS.length} devices...`);
        const chunkSize = 1000; // write in chunks to avoid massive strings if needed, but here we just append
        // Note: Postgres has limits on number of parameters but not necessarily on query length, but splitting inserts is safer for large datasets.
        // However, given the file writing approach, we will write one huge INSERT statement or split it.
        // Splitting into multiple INSERT statements of 1000 rows each is safer.

        // Reset SQL content for models to handle chunks loop
        // Write brands first to file to save memory
        // Start with part 1
        let partNum = 1;
        let currentOutFile = OUTPUT_FILE.replace('.sql', `_part_${partNum}.sql`);

        console.log(`Writing Part ${partNum} to ${currentOutFile}...`);
        fs.writeFileSync(currentOutFile, sqlContent);
        sqlContent = ''; // clear memory

        let currentChunk = [];
        const rowsPerInsert = 500; // Rows per single INSERT statement
        const rowsPerFile = 500; // Drastically reduce max rows per file for web editor limits
        let rowsInCurrentFile = 0;

        for (let i = 0; i < devicesData.RECORDS.length; i++) {
            const device = devicesData.RECORDS[i];

            // Parse specifications JSON string if it exists and is a string
            let specs = 'NULL';
            if (device.specifications) {
                try {
                    let parsedSpecs = device.specifications;
                    if (typeof parsedSpecs === 'string') {
                        specs = `'${parsedSpecs.replace(/'/g, "''")}'::jsonb`;
                    } else {
                        specs = `'${JSON.stringify(parsedSpecs).replace(/'/g, "''")}'::jsonb`;
                    }
                } catch (e) {
                    console.warn(`Failed to parse specs for device ${device.id}:`, e.message);
                    specs = 'NULL';
                }
            }

            const values = `(
            ${device.id},
            ${device.brand_id},
            ${escapeString(device.name)},
            ${escapeString(device.picture)},
            ${escapeString(device.released_at)},
            ${escapeString(device.body)},
            ${escapeString(device.os)},
            ${escapeString(device.storage)},
            ${escapeString(device.display_size)},
            ${escapeString(device.display_resolution)},
            ${escapeString(device.camera_pixels)},
            ${escapeString(device.video_pixels)},
            ${escapeString(device.ram)},
            ${escapeString(device.chipset)},
            ${escapeString(device.battery_size)},
            ${escapeString(device.battery_type)},
            ${specs},
            ${device.created_at ? `'${device.created_at}'` : 'NOW()'}
        )`;

            currentChunk.push(values);

            // Conditions to flush chunk to file
            if (currentChunk.length >= rowsPerInsert || i === devicesData.RECORDS.length - 1) {

                // If starting a new file (and it's not the very first write of part 1 which handled CREATE TABLE)
                if (rowsInCurrentFile >= rowsPerFile) {
                    partNum++;
                    currentOutFile = OUTPUT_FILE.replace('.sql', `_part_${partNum}.sql`);
                    rowsInCurrentFile = 0;
                    console.log(`Writing Part ${partNum} to ${currentOutFile}...`);
                    // Start new file header
                    fs.writeFileSync(currentOutFile, `-- Part ${partNum} of Phone Models Import\nINSERT INTO public.phone_models (id, brand_id, name, picture, released_at, body, os, storage, display_size, display_resolution, camera_pixels, video_pixels, ram, chipset, battery_size, battery_type, specifications, created_at) VALUES\n`);
                } else if (rowsInCurrentFile === 0 && partNum > 1) {
                    // Should have explicitly started above, but safeguard
                    fs.writeFileSync(currentOutFile, `-- Part ${partNum} of Phone Models Import\nINSERT INTO public.phone_models (id, brand_id, name, picture, released_at, body, os, storage, display_size, display_resolution, camera_pixels, video_pixels, ram, chipset, battery_size, battery_type, specifications, created_at) VALUES\n`);
                } else if (rowsInCurrentFile === 0 && partNum === 1) {
                    // Part 1 already has content, appending the first INSERT statement for models
                    fs.appendFileSync(currentOutFile, `INSERT INTO public.phone_models (id, brand_id, name, picture, released_at, body, os, storage, display_size, display_resolution, camera_pixels, video_pixels, ram, chipset, battery_size, battery_type, specifications, created_at) VALUES\n`);
                } else {
                    // Continuing an existing file, just need a comma and newline if we are appending to a previous INSERT... 
                    // Wait, splitting by INSERT statements is cleaner. 
                    // Let's force a new INSERT statement for every chunk.
                    fs.appendFileSync(currentOutFile, `INSERT INTO public.phone_models (id, brand_id, name, picture, released_at, body, os, storage, display_size, display_resolution, camera_pixels, video_pixels, ram, chipset, battery_size, battery_type, specifications, created_at) VALUES\n`);
                }

                const insertStatement = `${currentChunk.join(',\n')};\n\n`;
                fs.appendFileSync(currentOutFile, insertStatement);

                rowsInCurrentFile += currentChunk.length;
                currentChunk = [];

                if (i % 5000 === 0) console.log(`Processed ${i} / ${devicesData.RECORDS.length} devices...`);
            }
        }

        console.log(`Successfully generated split SQL files.`);

    } catch (error) {
        console.error('Error generating SQL:', error);
    }
};

main();
