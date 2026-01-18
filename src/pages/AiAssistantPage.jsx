import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Loader2, Bot, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import bilaiLogo from '../assets/logokucuk.png';

// --- MOCK VERİTABANI VE FONKSİYONLAR ---
const MOCK_ILANLAR = [
    { id: 1, baslik: "iPhone 13 128GB Temiz", fiyat: 25000, kategori: "Elektronik", sehir: "İstanbul" },
    { id: 2, baslik: "Samsung S23 Ultra", fiyat: 45000, kategori: "Elektronik", sehir: "Ankara" },
    { id: 3, baslik: "Satılık 2020 Fiat Egea", fiyat: 600000, kategori: "Vasıta", sehir: "Bursa" },
    { id: 4, baslik: "Honda Civic 2022 Hatasız", fiyat: 1100000, kategori: "Vasıta", sehir: "İstanbul" },
    { id: 5, baslik: "Kadıköy'de 2+1 Kiralık Daire", fiyat: 25000, kategori: "Emlak", sehir: "İstanbul" },
    { id: 6, baslik: "PlayStation 5 Çift Kol", fiyat: 18000, kategori: "Elektronik", sehir: "İzmir" },
];

const urunleriGetir = ({ kategori, maxFiyat, sehir, kelime }) => {
    let sonuclar = MOCK_ILANLAR;
    if (kategori) sonuclar = sonuclar.filter(u => u.kategori.toLowerCase().includes(kategori.toLowerCase()));
    if (sehir) sonuclar = sonuclar.filter(u => u.sehir.toLowerCase().includes(sehir.toLowerCase()));
    if (maxFiyat) sonuclar = sonuclar.filter(u => u.fiyat <= maxFiyat);
    if (kelime) sonuclar = sonuclar.filter(u => u.baslik.toLowerCase().includes(kelime.toLowerCase()));
    return sonuclar;
};

const toolsConfig = [
    {
        functionDeclarations: [
            {
                name: "urunleriGetir",
                description: "Kullanıcının kriterlerine göre veritabanındaki ilanları arar ve listeler.",
                parameters: {
                    type: "object",
                    properties: {
                        kategori: { type: "string", description: "Aranan ürün kategorisi (örn: Elektronik, Vasıta, Emlak)" },
                        maxFiyat: { type: "number", description: "Maksimum fiyat limiti" },
                        sehir: { type: "string", description: "İlanın bulunduğu şehir" },
                        kelime: { type: "string", description: "Ürün adı veya markası (örn: iPhone, BMW)" }
                    },
                },
            },
        ],
    },
];

const AiAssistantPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Merhaba! Ben bilAI. Size en uygun ilanları bulabilirim. Ne arıyorsunuz?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Sayfa yüklendiğinde sohbetleri çek
    useEffect(() => {
        const fetchConversations = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('bilai_conversations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });

                if (!error && data) {
                    setConversations(data.map(conv => ({
                        id: conv.id,
                        title: conv.title,
                        messages: conv.messages,
                        date: new Date(conv.created_at).toLocaleDateString('tr-TR')
                    })));
                }
            }
        };
        fetchConversations();
    }, [user]);

    // Sohbet kaydetme fonksiyonu
    const saveConversation = async (title, msgs) => {
        if (!user) return null;

        const { data, error } = await supabase
            .from('bilai_conversations')
            .insert({
                user_id: user.id,
                title: title,
                messages: msgs
            })
            .select()
            .single();

        if (!error && data) {
            return {
                id: data.id,
                title: data.title,
                messages: data.messages,
                date: new Date(data.created_at).toLocaleDateString('tr-TR')
            };
        }
        return null;
    };

    // Sohbet güncelleme fonksiyonu
    const updateConversation = async (convId, msgs) => {
        if (!user) return;

        await supabase
            .from('bilai_conversations')
            .update({ messages: msgs, updated_at: new Date().toISOString() })
            .eq('id', convId);
    };

    const startNewConversation = async () => {
        if (messages.length > 1 && user) {
            const title = messages[1]?.text.slice(0, 25) + '...' || 'Yeni Sohbet';

            if (activeConversationId) {
                // Mevcut sohbeti güncelle
                await updateConversation(activeConversationId, messages);
            } else {
                // Yeni sohbet kaydet
                const saved = await saveConversation(title, messages);
                if (saved) {
                    setConversations(prev => [saved, ...prev]);
                }
            }
        }
        setActiveConversationId(null);
        setMessages([{ role: 'model', text: 'Merhaba! Ben bilAI. Size en uygun ilanları bulabilirim. Ne arıyorsunuz?' }]);
        setChatHistory([]);
    };

    const loadConversation = async (conv) => {
        if (messages.length > 1 && activeConversationId !== conv.id && user) {
            const title = messages[1]?.text.slice(0, 25) + '...' || 'Yeni Sohbet';
            if (activeConversationId) {
                await updateConversation(activeConversationId, messages);
            } else {
                const saved = await saveConversation(title, messages);
                if (saved) {
                    setConversations(prev => [saved, ...prev]);
                }
            }
        }
        setActiveConversationId(conv.id);
        setMessages(conv.messages);
        setChatHistory([]);
    };

    const deleteConversation = async (id, e) => {
        e.stopPropagation();

        if (user) {
            await supabase
                .from('bilai_conversations')
                .delete()
                .eq('id', id);
        }

        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConversationId === id) {
            setActiveConversationId(null);
            setMessages([{ role: 'model', text: 'Merhaba! Ben bilAI. Size nasıl yardımcı olabilirim?' }]);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const userMessage = input.trim();
        setInput('');
        const newMessages = [...messages, { role: 'user', text: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                tools: toolsConfig,
                systemInstruction: "Sen bilAI asistanısın. Kullanıcı bir ürün aradığında MUTLAKA 'urunleriGetir' fonksiyonunu kullan. Türkçe konuş."
            });

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: "Sen bilAI asistanısın. Kullanıcı ürün aradığında 'urunleriGetir' fonksiyonunu kullan." }] },
                    { role: "model", parts: [{ text: "Anlaşıldı." }] },
                    ...chatHistory
                ],
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const functionCalls = response.functionCalls();

            let finalMessages;
            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                if (call.name === "urunleriGetir") {
                    const apiResponse = urunleriGetir(call.args);
                    const result2 = await chat.sendMessage([{
                        functionResponse: { name: "urunleriGetir", response: { name: "urunleriGetir", content: apiResponse } }
                    }]);
                    const text2 = result2.response.text();
                    finalMessages = [...newMessages, { role: 'model', text: text2 }];
                    setMessages(finalMessages);
                    setChatHistory(prev => [...prev, { role: "user", parts: [{ text: userMessage }] }, { role: "model", parts: [{ text: text2 }] }]);
                }
            } else {
                const text = response.text();
                finalMessages = [...newMessages, { role: 'model', text: text }];
                setMessages(finalMessages);
                setChatHistory(prev => [...prev, { role: "user", parts: [{ text: userMessage }] }, { role: "model", parts: [{ text: text }] }]);
            }

            // Mevcut sohbeti otomatik güncelle
            if (user && activeConversationId && finalMessages) {
                await updateConversation(activeConversationId, finalMessages);
                // Local state'i de güncelle
                setConversations(prev => prev.map(c =>
                    c.id === activeConversationId ? { ...c, messages: finalMessages } : c
                ));
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)' }} className="bg-white flex overflow-hidden">
            {/* Sol Panel - Bilgi (Sabit, scroll yok) */}
            <div className="hidden lg:flex lg:w-1/5 flex-col p-5 bg-gray-50 border-r border-gray-200" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="flex items-center gap-3 mb-4">
                    <img src={bilaiLogo} alt="bilAI" className="h-12" />
                    <p className="text-gray-600 text-sm">Yapay Zeka Asistanı</p>
                </div>
                <p className="text-gray-700 text-sm mb-6">Aradığınız ilanı saniyeler içinde bulun.</p>

                <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 text-sm">
                        <span className="text-lg">⚡</span><span className="text-gray-700">Hızlı Arama</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 text-sm">
                        <span className="text-lg">🎯</span><span className="text-gray-700">Akıllı Filtreleme</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 text-sm">
                        <span className="text-lg">💬</span><span className="text-gray-700">Kolay Kullanım</span>
                    </div>
                </div>

                <div className="mt-auto">
                    <p className="text-sm text-gray-500 mb-2">Örnek Sorular:</p>
                    {["Araba ara", "Telefon bul", "Emlak ilan"].map((text, idx) => (
                        <button key={idx} onClick={() => setInput(text)} className="w-full text-left px-3 py-2 mb-2 bg-white hover:bg-gray-100 rounded-lg text-gray-700 text-sm border border-gray-200">
                            {text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orta Panel - Chat */}
            <div className="flex-1 flex flex-col" style={{ height: '100%', minHeight: 0 }}>
                {/* Header */}
                <div className="px-5 py-3 bg-[#0015cf] flex items-center justify-between" style={{ flexShrink: 0 }}>
                    <div className="flex items-center gap-3">
                        <Bot size={24} className="text-white" />
                        <h2 className="font-semibold text-white text-lg">bilAI</h2>
                    </div>
                    <button onClick={startNewConversation} className="lg:hidden p-2 bg-white/20 rounded-lg text-white">
                        <Plus size={20} />
                    </button>
                </div>

                {/* Mesajlar - SADECE BURASI SCROLL */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-[#0015cf] text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                                {msg.text.split('\n').map((line, i) => (<p key={i} className="text-sm leading-relaxed">{line || '\u00A0'}</p>))}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                                <Loader2 size={18} className="animate-spin text-[#0015cf]" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-5 py-3 bg-white border-t border-gray-200" style={{ flexShrink: 0 }}>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Mesaj yazın..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#0015cf] text-base"
                        />
                        <button onClick={handleSend} disabled={!input.trim() || isLoading} className="px-5 py-3 bg-[#0015cf] text-white rounded-xl hover:bg-[#0010a0] disabled:opacity-50">
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sağ Panel - Geçmiş (Sabit, scroll yok) */}
            <div className="hidden lg:flex lg:w-1/5 flex-col bg-gray-100 border-l border-gray-200" style={{ height: '100%', overflow: 'hidden' }}>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {!user ? (
                        <p className="text-gray-400 text-sm text-center py-6">Sohbet geçmişi için giriş yapın</p>
                    ) : conversations.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-6">Henüz sohbet yok</p>
                    ) : (
                        conversations.map(conv => (
                            <div key={conv.id} onClick={() => loadConversation(conv)} className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer text-sm ${activeConversationId === conv.id ? 'bg-[#0015cf] text-white' : 'hover:bg-gray-200 text-gray-700'}`}>
                                <MessageSquare size={16} className="shrink-0" />
                                <p className="flex-1 truncate">{conv.title}</p>
                                <button onClick={(e) => deleteConversation(conv.id, e)} className="opacity-0 group-hover:opacity-100 p-1">
                                    <Trash2 size={14} className={activeConversationId === conv.id ? 'text-white' : 'text-red-400'} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="px-3 py-5" style={{ flexShrink: 0 }}>
                    <button onClick={startNewConversation} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0015cf] text-white rounded-lg text-sm font-medium hover:bg-[#0010a0]">
                        <Plus size={18} />
                        <span>Yeni Sohbet</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiAssistantPage;
