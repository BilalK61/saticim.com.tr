import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // 1. CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
            throw new Error('Gerekli environment variables eksik.');
        }

        const { message, history } = await req.json();

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // --- Helper: Gemini API Call ---
        async function callGemini(contents: any[], tools?: any[]) {
            // LİSTEDE GÖRDÜĞÜMÜZ VE ÇALIŞACAK OLAN MODEL:
            const modelName = 'gemini-2.0-flash-lite-preview-02-05';

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;

            const payload: any = {
                contents: contents,
                // Bu model için tools konfigürasyonu
                tools: tools && tools.length > 0 ? tools : undefined,
                generationConfig: {
                    temperature: 0.7
                }
            };

            // System instruction'ı 2.0 modelleri genellikle destekler ama
            // garanti olsun diye history içine gömmek daha güvenlidir.

            console.log("Calling Gemini API:", url);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("Gemini API Error Response:", errorBody);
                throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
            }

            return await response.json();
        }

        // --- History Format ---
        let geminiContents: any[] = [];

        // SİSTEM TALİMATI (Prompt Engineering)
        // Modeli ne yapması gerektiği konusunda eğitiyoruz.
        geminiContents.push({
            role: "user",
            parts: [{ text: "SİSTEM TALİMATI: Sen saticim.com.tr platformunun asistanısın. Görevin kullanıcının aradığı ilanları bulmak. Kullanıcı bir ürün aradığında (örneğin 'telefon', 'bmw', 'ev') MUTLAKA 'urunleriGetir' fonksiyonunu çağır. Sana gelen ilan verilerini kullanıcıya özetle. Para birimi TL. İlanın başlığını, fiyatını ve şehrini söyle. Link verme. Fonksiyon çağırmazsan veri göremezsin." }]
        });

        geminiContents.push({
            role: "model",
            parts: [{ text: "Anlaşıldı. saticim.com.tr asistanı olarak ilanları arayıp listeleyeceğim." }]
        });

        // Eski mesajları ekle
        if (history && Array.isArray(history)) {
            for (const msg of history) {
                const role = msg.role === 'model' ? 'model' : 'user';
                // Eski mesajlarda text var mı kontrol et
                const text = msg.parts?.[0]?.text || msg.content || "";
                if (text) {
                    geminiContents.push({ role, parts: [{ text }] });
                }
                // Eğer eski mesajda fonksiyon çağrısı varsa onu da eklemeliyiz (karmaşıklık olmasın diye şimdilik atlıyoruz, sadece metinleri alıyoruz)
            }
        }

        // Şu anki kullanıcı mesajı
        geminiContents.push({ role: 'user', parts: [{ text: message }] });

        // --- Tool Definitions ---
        const tools = [{
            functionDeclarations: [{
                name: "urunleriGetir",
                description: "Veritabanından ilan arayan fonksiyon. Kullanıcı ürün, kategori, fiyat veya şehir belirttiğinde bunu kullan.",
                parameters: {
                    type: "object",
                    properties: {
                        kategori: { type: "string", description: "elektronik, vasita, emlak, giyim" },
                        maxFiyat: { type: "number" },
                        minFiyat: { type: "number" },
                        sehir: { type: "string" },
                        kelime: { type: "string" }
                    },
                }
            }]
        }];

        // --- 1. İlk Çağrı (Gemini'a soruyoruz) ---
        let apiResponse = await callGemini(geminiContents, tools);

        let finalResponseText = "Anlaşılamadı.";
        const candidate = apiResponse.candidates?.[0];
        const content = candidate?.content;

        // Fonksiyon çağrısı var mı kontrol et
        // Gemini 2.0 yapısı bazen farklı olabilir, en garantili yolu arıyoruz:
        const functionCall = content?.parts?.find((p: any) => p.functionCall)?.functionCall;

        // --- 2. Fonksiyon Varsa Çalıştır ---
        if (functionCall) {
            if (functionCall.name === "urunleriGetir") {
                const args = functionCall.args;
                console.log("Filtreler Algılandı:", args);

                // Supabase Sorgusu
                let query = supabaseClient
                    .from('listings')
                    .select('id, title, price, city:cities!inner(name), district:districts(name), category, images')
                    .eq('status', 'approved')
                    .limit(5);

                // Filtreleri Uygula
                if (args.kategori) {
                    const cat = args.kategori.toLowerCase();
                    if (cat.includes('elektronik') || cat.includes('telefon')) query = query.eq('category', 'elektronik');
                    else if (cat.includes('vasıta') || cat.includes('araba')) query = query.eq('category', 'vasita');
                    else if (cat.includes('emlak')) query = query.eq('category', 'emlak');
                    else if (cat.includes('giyim')) query = query.eq('category', 'giyim');
                }
                if (args.maxFiyat) query = query.lte('price', args.maxFiyat);
                if (args.minFiyat) query = query.gte('price', args.minFiyat);
                if (args.kelime) query = query.ilike('title', `%${args.kelime}%`);
                if (args.sehir) query = query.ilike('cities.name', `%${args.sehir}%`);

                const { data: listings, error } = await query;

                let functionResult = {};
                if (error) {
                    console.error("DB Error:", error);
                    functionResult = { error: "Veritabanı hatası." };
                } else if (!listings || listings.length === 0) {
                    functionResult = { message: "Aradığınız kriterlere uygun ilan bulunamadı." };
                } else {
                    // Gemini'a göndermek için veriyi sadeleştir
                    functionResult = {
                        bulunan_ilanlar: listings.map((l: any) => ({
                            baslik: l.title,
                            fiyat: l.price,
                            sehir: l.city?.name,
                            kategori: l.category
                        }))
                    };
                }

                console.log("DB Sonuç:", functionResult);

                // Geçmişe fonksiyon çağrısını ekle (Gemini bekliyor)
                geminiContents.push({ role: "model", parts: [{ functionCall: functionCall }] });
                // Fonksiyon sonucunu ekle
                geminiContents.push({ role: "function", parts: [{ functionResponse: { name: "urunleriGetir", response: functionResult } }] });

                // Sonuçlarla birlikte tekrar Gemini'a sor
                const secondResponse = await callGemini(geminiContents);
                finalResponseText = secondResponse.candidates?.[0]?.content?.parts?.[0]?.text || "İlanları buldum ama yorumlayamadım.";
            }
        } else {
            // Fonksiyon çağrısı yoksa sadece sohbet cevabını al
            finalResponseText = content?.parts?.[0]?.text || "Cevap alınamadı.";
        }

        return new Response(JSON.stringify({ text: finalResponseText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Edge Function Error:", error);
        return new Response(JSON.stringify({
            error: error.message || "Unknown error",
            details: error.toString()
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});