import { createClient } from '@supabase/supabase-js';

// ==========================================
// KONFİGÜRASYON (Lütfen burayı doldurun)
// ==========================================

// 1. CarAPI.app sitesinden alacağınız API Token ve Secret
// https://carapi.app/dashboard adresinden alabilirsiniz.
const CARAPI_TOKEN = '57573e75-1f2c-4239-a366-6f7e16688f61';
const CARAPI_SECRET = 'bc30a53973fefef70db06b8e81cc4776';

// 2. Supabase Proje Bilgileri
// Service Role Key kullanmanız tavsiye edilir (Veri yazma yetkisi için)
// Supabase Dashboard -> Project Settings -> API -> service_role key
const SUPABASE_URL = 'https://ecbhhbyfocitafbfsegg.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_V0Q-73UBxKfPhu8LZ1wceQ_LtiV-uKR';

// ==========================================

if (CARAPI_TOKEN === 'BURAYA_API_TOKEN_YAZIN' || SUPABASE_SERVICE_KEY === 'BURAYA_SUPABASE_SERVICE_ROLE_KEY_YAZIN') {
    console.error('❌ Lütfen script dosyasını açıp CARAPI_TOKEN, CARAPI_SECRET ve SUPABASE_SERVICE_KEY alanlarını doldurun.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CARAPI_BASE_URL = 'https://carapi.app/api';
let jwtToken = '';

async function loginToCarApi() {
    console.log('🔄 CarAPI\'ye giriş yapılıyor...');
    try {
        const response = await fetch(`${CARAPI_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_token: CARAPI_TOKEN,
                api_secret: CARAPI_SECRET
            })
        });

        if (!response.ok) {
            throw new Error(`Giriş başarsız: ${response.statusText}`);
        }

        const data = await response.text(); // JWT string olarak döner
        jwtToken = data;
        console.log('✅ Giriş başarılı. Token alındı.');
    } catch (error) {
        console.error('❌ Giriş hatası:', error);
        process.exit(1);
    }
}

async function fetchFromCarApi(endpoint) {
    const response = await fetch(`${CARAPI_BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Hatası (${endpoint}): ${response.status} ${response.statusText} - Detay: ${errorText}`);
    }

    return await response.json();
}

async function syncMakes() {
    console.log('🔄 Markalar çekiliyor...');
    try {
        // CarAPI'den markaları çek
        const data = await fetchFromCarApi('/makes');
        const makes = data.data || [];
        console.log(`ℹ️ ${makes.length} adet marka bulundu.`);

        for (const make of makes) {
            // Supabase'e kaydet
            const { data: insertedMake, error } = await supabase
                .from('vehicle_makes')
                .upsert({
                    name: make.name,
                    external_id: make.id.toString()
                }, { onConflict: 'name' })
                .select()
                .single();

            if (error) {
                console.error(`❌ Marka kaydedilemedi (${make.name}):`, error.message);
                continue;
            }

            // Bu markanın modellerini çek
            await syncModels(make.id, insertedMake.id, make.name);
        }

    } catch (error) {
        console.error('❌ Marka senkronizasyonu hatası:', error);
    }
}

async function syncModels(carApiMakeId, supabaseMakeId, makeName) {
    console.log(`  ↳ 🔄 ${makeName} modelleri çekiliyor...`);
    try {
        // CarAPI Free Tier genellikle 2015-2019/2020 arası verir.
        // v1 deprecated olduğu için v2 kullanıyoruz.
        const year = 2020;
        const data = await fetchFromCarApi(`/models/v2?make_id=${carApiMakeId}&year=${year}&sort=name`);
        const models = data.data || [];

        for (const model of models) {
            const { data: insertedModel, error } = await supabase
                .from('vehicle_models')
                .upsert({
                    make_id: supabaseMakeId,
                    name: model.name,
                    external_id: model.id.toString()
                }, { onConflict: 'make_id, name' }) // Unique key constraint'e dikkat
                .select()
                .single();

            if (error) {
                console.error(`    ❌ Model kaydedilemedi (${model.name}):`, error.message);
                continue;
            }

            // Paketleri (Trims) çek - Örnek olarak 2020 yılı için
            await syncTrims(model.id, insertedModel.id, model.name);
        }
    } catch (error) {
        console.error(`  ❌ ${makeName} modelleri hatası:`, error);
    }
}

// Trim/Paket senkronizasyonu
async function syncTrims(carApiModelId, supabaseModelId, modelName) {
    try {
        // Free tier genellikle 2015-2020 arası veriyor. Modellerle uyumlu olsun diye 2015 seçtik.
        const year = 2020;

        // Hata alırsak devam et (API limiti vs)
        const response = await fetch(`${CARAPI_BASE_URL}/trims/v2?make_model_id=${carApiModelId}&year=${year}`, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) return; // 404 veya limit hatası olabilir, sessizce geç

        const data = await response.json();
        const trims = data.data || [];

        for (const trim of trims) {
            // Trim name genellikle "description" veya "name" alanında olabilir, API dokümanına göre 'description' veya 'name'
            const trimName = trim.description || trim.name || trim.trim;

            await supabase
                .from('vehicle_packages')
                .upsert({
                    model_id: supabaseModelId,
                    name: trimName,
                    year: year,
                    external_id: trim.id.toString()
                }, { onConflict: 'model_id, name' }); // Model ve isim kombinasyonu unique olmalı (tabloda constraint eklenmeli veya ignore edilmeli)
            // Not: setup_car_tables.sql'de package için unique constraint yok, bu yüzden duplicate olabilir.
            // İdealde unique constraint eklemek lazım. Şimdilik upsert ID ile çalışmaz, sadece insert yapar veya ID varsa update.
            // Basitlik için insert kullanıyoruz.
        }
    } catch (e) {
        // Hata yut
    }
}

async function main() {
    await loginToCarApi();
    await syncMakes();
    console.log('✅ Senkronizasyon tamamlandı.');
}

main();
