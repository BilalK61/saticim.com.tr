import React, { useState, useRef, useEffect } from 'react';
// GoogleGenerativeAI import removed

import { Send, Loader2, Bot, Plus, MessageSquare, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
const bilaiLogo = "https://ecbhhbyfocitafbfsegg.supabase.co/storage/v1/object/public/logos/logokucuk.png";

// --- MOCK VERİTABANI VE FONKSİYONLAR KALDIRILDI (Backend'e taşındı) ---


const AiAssistantPage = () => {
    const { user } = useAuth();
    const [showIntro, setShowIntro] = useState(true);
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
        console.log("AiAssistantPage Component Mounted - Version: Edge Function Impl (v2)");
    }, []);

    // Intro animasyonunu 2.5 saniye sonra kapat
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowIntro(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

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
            console.log("Sending to Edge Function:", { message: userMessage, history: chatHistory });

            const { data, error } = await supabase.functions.invoke('bilai-chat', {
                body: {
                    message: userMessage,
                    history: chatHistory
                }
            });

            if (error) {
                console.error("Edge Function Error:", error);
                // Attempt to read the error body if available
                if (error.context && error.context.json) {
                    error.context.json().then(errBody => {
                        console.error("Edge Function Error Details:", errBody);
                    }).catch(e => console.error("Could not parse error body:", e));
                }
                throw error;
            }

            console.log("Edge Function Response:", data);

            const botResponseText = data.text || "Üzgünüm, şu an yanıt veremiyorum.";

            const finalMessages = [...newMessages, { role: 'model', text: botResponseText }];
            setMessages(finalMessages);

            // Update chat history for next turn
            setChatHistory(prev => [
                ...prev,
                { role: "user", parts: [{ text: userMessage }] },
                { role: "model", parts: [{ text: botResponseText }] }
            ]);

            // Mevcut sohbeti otomatik güncelle
            if (user && activeConversationId && finalMessages) {
                await updateConversation(activeConversationId, finalMessages);
                // Local state'i de güncelle
                setConversations(prev => prev.map(c =>
                    c.id === activeConversationId ? { ...c, messages: finalMessages } : c
                ));
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Intro Animasyonu */}
            <AnimatePresence>
                {showIntro && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[100] bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center"
                    >
                        <div className="text-center">
                            {/* Logo Animation */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    duration: 0.8
                                }}
                                className="relative mb-6"
                            >
                                {/* Glow Effect */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-0 bg-blue-400/30 rounded-full blur-3xl"
                                    style={{ width: '200px', height: '200px', margin: 'auto', left: 0, right: 0, top: 0, bottom: 0 }}
                                />
                                <img
                                    src={bilaiLogo}
                                    alt="bilAI"
                                    className="w-36 h-16 object-contain relative z-10 drop-shadow-xl mx-auto"
                                />
                            </motion.div>

                            {/* Text Animation */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                            >
                                <p className="text-gray-500 text-lg ">Yapay Zeka Asistanınız</p>
                            </motion.div>

                            {/* Sparkles */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex justify-center gap-2 mt-6"
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -10, 0],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1,
                                            delay: i * 0.2,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Sparkles className="w-5 h-5 text-blue-500" />
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div
                                className="h-1.5 bg-gray-200 rounded-full mt-8 mx-auto max-w-[200px] overflow-hidden"
                            >
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{
                                        duration: 2,
                                        ease: "easeInOut"
                                    }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                            <h2 className="font-semibold text-white text-lg">bilAI <span className="text-xs opacity-70">v2 (Edge)</span></h2>
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
        </>
    );
};

export default AiAssistantPage;
