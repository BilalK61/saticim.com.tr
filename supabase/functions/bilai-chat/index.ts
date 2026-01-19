import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    // 1. CORS Preflight (Tarayıcıdan gelen ön istek)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        if (!supabaseUrl || !supabaseAnonKey || !geminiApiKey) {
            throw new Error('Gerekli API anahtarları (ENV) eksik.');
        }

        const { message, history } = await req.json();

        // Supabase Client Oluşturma
        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // --- Helper: Gemini API Çağrısı (Fetch ile) ---
        async function callGemini(contents: any[], tools?: any[]) {
            // DÜZELTME 1: Model isminden emin olalım. 'gemini-1.5-flash' şu an en stabil olanı.
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

            const payload: any = {
                contents: contents,
                system_instruction: {
                    parts: [{ text: "Sen saticim.com.tr asistanısın. Kullanıcı ürün aradığında MUTLAKA 'urunleriGetir' fonksiyonunu kullan. Para birimi TL. İlanın başlığını, fiyatını ve şehrini söyle. Link verme." }]
                }
            };

            if (tools) {
                payload.tools = tools;
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.text();
                // 404 veya 500 hatalarını burada yakalayıp detaylı gösteriyoruz
                throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
            }

            return await response.json();
        }

        // --- Geçmişi Düzenle (Formatlama) ---
        let geminiHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: msg.parts || [{ text: msg.text }]
        }));

        geminiHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // --- Tool Tanımı ---
        const tools = [{
            function_declarations: [{
                name: "urunleriGetir",
                description: "İlan arama fonksiyonu.",
                parameters: {
                    type: "object",
                    properties: {
                        kategori: { type: "string" },
                        maxFiyat: { type: "number" },
                        minFiyat: { type: "number" },
                        sehir: { type: "string" }, // Şehir parametresi
                        kelime: { type: "string" }
                    },
                }
            }]
        }];

        // --- 1. İlk Çağrı (Niyet Analizi) ---
        let apiResponse = await callGemini(geminiHistory, tools);

        let finalResponseText = "Anlaşılamadı.";
        const candidate = apiResponse.candidates?.[0];
        const functionCall = candidate?.content?.parts?.[0]?.functionCall;

        // --- 2. Fonksiyon Çağrısı Yönetimi ---
        if (functionCall) {
            if (functionCall.name === "urunleriGetir") {
                const args = functionCall.args;
                console.log("Filtreler:", args);

                // DÜZELTME 2: Supabase İlişkisel Filtreleme (!inner)
                // Şehre göre filtrelemek için 'city:cities!inner(name)' kullanmalıyız.
                // Eğer '!inner' kullanmazsak sadece join yapar ama filtrelemez (Left Join gibi davranır).
                let query = supabaseClient
                    .from('listings')
                    .select('id, title, price, city:cities!inner(name), district:districts(name), category, images')
                    .eq('status', 'approved')
                    .limit(10);

                // Kategori Filtresi
                if (args.kategori) {
                    const catLower = args.kategori.toLowerCase();
                    if (catLower.includes('elektronik') || catLower.includes('telefon')) query = query.eq('category', 'elektronik');
                    else if (catLower.includes('vasıta') || catLower.includes('araba')) query = query.eq('category', 'vasita');
                    else if (catLower.includes('emlak')) query = query.eq('category', 'emlak');
                }

                if (args.maxFiyat) query = query.lte('price', args.maxFiyat);
                if (args.minFiyat) query = query.gte('price', args.minFiyat);
                if (args.kelime) query = query.ilike('title', `%${args.kelime}%`);

                // DÜZELTME 3: Eksik olan Şehir Filtresi Eklendi
                if (args.sehir) {
                    // İlişkili tablodaki (cities) name kolonuna göre arama
                    query = query.ilike('cities.name', `%${args.sehir}%`);
                }

                const { data: listings, error } = await query;

                let functionResponseContent: any;

                if (error) {
                    console.error("DB Hatası:", error);
                    functionResponseContent = { error: "Veritabanı hatası oluştu." };
                } else if (!listings || listings.length === 0) {
                    functionResponseContent = { message: "Kriterlere uygun ilan bulunamadı." };
                } else {
                    // Veriyi sadeleştir (Token tasarrufu için)
                    functionResponseContent = listings.map((l: any) => ({
                        baslik: l.title,
                        fiyat: l.price,
                        sehir: l.city?.name,
                        link: `/ilan/${l.id}`
                    }));
                }

                // --- 3. Gemini'a Sonucu Gönder ---

                // Fonksiyon çağrısını geçmişe ekle
                geminiHistory.push({
                    role: "model",
                    parts: [{ functionCall: functionCall }]
                });

                // Fonksiyon cevabını geçmişe ekle
                geminiHistory.push({
                    role: "function",
                    parts: [{
                        functionResponse: {
                            name: "urunleriGetir",
                            response: { name: "urunleriGetir", content: functionResponseContent }
                        }
                    }]
                });

                // Son metin cevabını al
                const secondResponse = await callGemini(geminiHistory);
                finalResponseText = secondResponse.candidates?.[0]?.content?.parts?.[0]?.text || "İlanları listeledim.";
            }
        } else {
            // Sadece sohbet
            finalResponseText = candidate?.content?.parts?.[0]?.text || "Merhaba, nasıl yardımcı olabilirim?";
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