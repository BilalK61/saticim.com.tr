import fs from 'fs';
import path from 'path';

// Use process.cwd() which is the root of the workspace
const sehirBilgileriDir = path.join(process.cwd(), 'sehirBilgileri');
const outputPath = path.join(process.cwd(), 'supabase_location.sql');

console.log('Reading from directory:', sehirBilgileriDir);

try {
    if (!fs.existsSync(sehirBilgileriDir)) {
        throw new Error(`Directory not found: ${sehirBilgileriDir}`);
    }

    const sehirlerPath = path.join(sehirBilgileriDir, 'sehirler.json');
    const ilcelerPath = path.join(sehirBilgileriDir, 'ilceler.json');

    // Find all mahalle files
    const allFiles = fs.readdirSync(sehirBilgileriDir);
    const mahalleFiles = allFiles.filter(f => f.startsWith('mahalleler-') && f.endsWith('.json'));

    const sehirler = JSON.parse(fs.readFileSync(sehirlerPath, 'utf8'));
    const ilceler = JSON.parse(fs.readFileSync(ilcelerPath, 'utf8'));

    let allMahalleler = [];
    for (const file of mahalleFiles) {
        console.log(`Reading ${file}...`);
        const data = JSON.parse(fs.readFileSync(path.join(sehirBilgileriDir, file), 'utf8'));
        allMahalleler = allMahalleler.concat(data);
    }

    console.log(`Total cities: ${sehirler.length}`);
    console.log(`Total districts: ${ilceler.length}`);
    console.log(`Total neighborhoods: ${allMahalleler.length}`);

    let sql = `
-- ==========================================
-- LOCATION DATA (Cities, Districts, Neighborhoods)
-- ==========================================

-- Drop tables in reverse order of dependency
drop table if exists public.neighborhoods;
drop table if exists public.districts;
drop table if exists public.cities;

-- Create Cities Table
create table public.cities (
  id bigint primary key,
  name text not null
);

-- Create Districts Table
create table public.districts (
  id bigint primary key,
  city_id bigint references public.cities (id) not null,
  name text not null
);

-- Create Neighborhoods Table
create table public.neighborhoods (
  id bigint primary key,
  district_id bigint references public.districts (id) not null,
  name text not null
);

-- Enable RLS
alter table public.cities enable row level security;
create policy "Cities are public" on public.cities for select using (true);

alter table public.districts enable row level security;
create policy "Districts are public" on public.districts for select using (true);

alter table public.neighborhoods enable row level security;
create policy "Neighborhoods are public" on public.neighborhoods for select using (true);

-- Insert Cities
insert into public.cities (id, name) values
`;

    // Add Cities
    const cityValues = sehirler.map(city => `  (${city.sehir_id}, '${city.sehir_adi.replace(/'/g, "''")}')`).join(',\n');
    sql += cityValues + ';\n\n';

    // Add Districts
    const districtChunkSize = 500;
    for (let i = 0; i < ilceler.length; i += districtChunkSize) {
        const chunk = ilceler.slice(i, i + districtChunkSize);
        if (i === 0) {
            sql += 'insert into public.districts (id, city_id, name) values\n';
        } else {
            sql += 'insert into public.districts (id, city_id, name) values\n';
        }

        const chunkValues = chunk.map(dist => `  (${dist.ilce_id}, ${dist.sehir_id}, '${dist.ilce_adi.replace(/'/g, "''")}')`).join(',\n');
        sql += chunkValues + ';\n';
    }

    // Add Neighborhoods
    const neighborhoodChunkSize = 1000; // Increased chunk size for efficiency but still safe
    for (let i = 0; i < allMahalleler.length; i += neighborhoodChunkSize) {
        const chunk = allMahalleler.slice(i, i + neighborhoodChunkSize);
        if (i === 0) {
            sql += '\n-- Insert Neighborhoods\ninsert into public.neighborhoods (id, district_id, name) values\n';
        } else {
            sql += 'insert into public.neighborhoods (id, district_id, name) values\n';
        }

        const chunkValues = chunk.map(nh => `  (${nh.mahalle_id}, ${nh.ilce_id}, '${nh.mahalle_adi.replace(/'/g, "''")}')`).join(',\n');
        sql += chunkValues + ';\n';
    }

    // Write to a separate file
    fs.writeFileSync(outputPath, sql);
    console.log(`Successfully generated SQL file at: ${outputPath}`);

} catch (err) {
    console.error('Error generating SQL:', err);
    process.exit(1);
}
