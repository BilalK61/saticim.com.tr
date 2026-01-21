import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { Send, User, MessageCircle, Clock, Check, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Mesajlar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [quotedListing, setQuotedListing] = useState(null); // { id, title, url }
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const listingMessageSet = useRef(false); // Track if we've already set the listing message

    // Initial load and Realtime subscription
    useEffect(() => {
        // Force scroll to top on mount
        window.scrollTo(0, 0);
        setTimeout(() => window.scrollTo(0, 0), 100);

        if (!user) {
            setLoading(false);
            return;
        }

        console.log("Mesajlar Page: Fetching conversations...");
        fetchConversations();

        // Subscribe to new messages
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMsg = payload.new;
                console.log("Realtime Message Received:", newMsg);
                if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
                    // Update conversations list and current chat
                    fetchConversations();

                    if (selectedConversation) {
                        const isRelevant =
                            (newMsg.sender_id === selectedConversation.user.id && newMsg.receiver_id === user.id) ||
                            (newMsg.sender_id === user.id && newMsg.receiver_id === selectedConversation.user.id);

                        if (isRelevant) {
                            setMessages(prev => {
                                if (prev.some(m => m.id === newMsg.id)) return prev;
                                return [...prev, newMsg];
                            });
                        }
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, selectedConversation]);

    // Track URL params separately
    const [urlParams, setUrlParams] = useState({ recipientId: null, listingId: null, listingTitle: null });

    // Stage 1: Extract URL params on mount
    useEffect(() => {
        console.log("=== STAGE 1: Extract URL params ===");
        console.log("location.search:", location.search);
        const params = new URLSearchParams(location.search);
        const recipientId = params.get('recipientId');
        const listingId = params.get('listingId');
        const listingTitle = params.get('listingTitle');

        console.log("Extracted params:", { recipientId, listingId, listingTitle });

        if (recipientId) {
            console.log("Setting urlParams state...");
            setUrlParams({ recipientId, listingId, listingTitle });
        } else {
            console.log("No recipientId found, not setting urlParams");
        }
    }, [location.search]);

    // Stage 2: Handle conversation selection once conversations are loaded
    useEffect(() => {
        const initChat = async () => {
            console.log("=== Stage 2 initChat START ===");
            console.log("user:", !!user, "loading:", loading, "urlParams.recipientId:", urlParams.recipientId);
            console.log("conversations.length:", conversations.length);
            console.log("selectedConversation:", selectedConversation?.user?.id);

            if (!user || loading || !urlParams.recipientId) {
                console.log("=== Skipping: missing requirements ===");
                return;
            }

            const recipientId = urlParams.recipientId;

            console.log("=== recipientId:", recipientId);
            console.log("=== user.id:", user.id);
            console.log("=== recipientId !== user.id:", recipientId !== user.id);

            // Skip if already selected
            if (selectedConversation?.user?.id === recipientId) {
                console.log("=== Conversation already selected, just setting message ===");
                // Just set the quoted listing if needed
                if (urlParams.listingId && urlParams.listingTitle && !listingMessageSet.current) {
                    listingMessageSet.current = true;
                    const listingUrl = `${window.location.origin}/ilan/${urlParams.listingId}`;
                    console.log("=== [Path 1] Listing URL:", listingUrl, "===");
                    console.log("=== [Path 1] Listing ID:", urlParams.listingId, "===");
                    console.log("=== [Path 1] Listing Title:", urlParams.listingTitle, "===");
                    setQuotedListing({
                        id: urlParams.listingId,
                        title: decodeURIComponent(urlParams.listingTitle),
                        url: listingUrl
                    });
                    console.log("=== Quoted listing set ===");
                }
                return;
            }

            if (recipientId !== user.id) {
                console.log("=== Initializing chat with recipient:", recipientId, "===");

                // Check if we already have this conversation
                const existing = conversations.find(c => c.user.id === recipientId);
                console.log("existing conversation found:", !!existing);

                if (existing) {
                    console.log("=== Found existing conversation, selecting... ===");
                    await handleSelectConversation(existing, false);
                    console.log("=== Conversation selected ===");
                } else if (conversations.length > 0) {
                    // Conversations loaded but recipient not found - create new one
                    console.log("=== Creating new conversation for recipient:", recipientId, "===");
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', recipientId)
                        .single();

                    console.log("Profile fetched:", !!profile);
                    if (profile) {
                        const tempConv = {
                            id: profile.id,
                            user: {
                                id: profile.id,
                                name: profile.full_name || profile.username || 'Kullanıcı',
                                avatar: profile.avatar_url
                            },
                            lastMessage: '',
                            time: '',
                            unread: 0
                        };
                        setConversations(prev => [tempConv, ...prev]);
                        console.log("=== New conversation added, selecting... ===");
                        await handleSelectConversation(tempConv, false);
                        console.log("=== Conversation selected ===");
                    }
                } else {
                    console.log("=== No conversations loaded yet, waiting... ===");
                }

                // Pre-populate message with listing reference if available
                if (urlParams.listingId && urlParams.listingTitle && !listingMessageSet.current) {
                    listingMessageSet.current = true;
                    console.log("=== Setting quoted listing ===");
                    setTimeout(() => {
                        const listingUrl = `${window.location.origin}/ilan/${urlParams.listingId}`;
                        console.log("=== Listing URL:", listingUrl, "===");
                        setQuotedListing({
                            id: urlParams.listingId,
                            title: decodeURIComponent(urlParams.listingTitle),
                            url: listingUrl
                        });
                        console.log("=== Quoted listing set:", urlParams.listingTitle, "===");
                    }, 500);
                }
            }
            console.log("=== Stage 2 initChat END ===");
        };

        initChat();
    }, [user, loading, conversations, urlParams, selectedConversation]); // Now includes conversations!


    const fetchConversations = async () => {
        try {
            // 1. Fetch all messages involving the user
            const { data: msgs, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 2. Group by other user ID
            const conversationMap = new Map();
            const userIdsToFetch = new Set();

            msgs.forEach(msg => {
                const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

                if (!conversationMap.has(otherUserId)) {
                    conversationMap.set(otherUserId, {
                        lastMsg: msg,
                        unreadCount: (msg.receiver_id === user.id && !msg.is_read) ? 1 : 0
                    });
                    userIdsToFetch.add(otherUserId);
                } else {
                    const existing = conversationMap.get(otherUserId);
                    if (msg.receiver_id === user.id && !msg.is_read) {
                        existing.unreadCount += 1;
                    }
                }
            });

            // 3. Fetch user profiles
            let profilesMap = {};
            if (userIdsToFetch.size > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .in('id', Array.from(userIdsToFetch));

                if (!profilesError && profiles) {
                    profiles.forEach(p => profilesMap[p.id] = p);
                }
            }

            // 4. Format for UI
            const formattedConversations = Array.from(conversationMap.entries()).map(([otherId, data]) => {
                const profile = profilesMap[otherId] || { id: otherId, full_name: 'Bilinmeyen Kullanıcı', username: 'bilinmeyen' };
                return {
                    id: otherId,
                    user: {
                        id: otherId,
                        name: profile.full_name || profile.username || 'Kullanıcı',
                        avatar: profile.avatar_url
                    },
                    lastMessage: data.lastMsg.content,
                    time: new Date(data.lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fullDate: data.lastMsg.created_at,
                    unread: data.unreadCount
                };
            });

            setConversations(formattedConversations);
        } catch (err) {
            console.error("Error fetching conversations:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (conv, updateUrl = true) => {
        console.log("Selecting conversation:", conv.user.name);
        setSelectedConversation(conv);
        if (updateUrl) {
            // Preserve listing parameters if they exist
            const params = new URLSearchParams(location.search);
            const newParams = new URLSearchParams({ recipientId: conv.user.id });

            // Keep listing parameters if present
            if (params.get('listingId')) newParams.set('listingId', params.get('listingId'));
            if (params.get('listingTitle')) newParams.set('listingTitle', params.get('listingTitle'));

            navigate(`/mesajlar?${newParams.toString()}`, { replace: true });
        }

        // Fetch full message history between these two users
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${conv.user.id}),and(sender_id.eq.${conv.user.id},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            console.log("Messages fetched:", data.length);
            setMessages(data || []);

            // Mark unread messages as read
            const unreadIds = data
                .filter(m => m.receiver_id === user.id && !m.is_read)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .in('id', unreadIds);

                // Update local list unread count
                // fetchConversations(); // Optional, realtime will fix it or we can optimize
                setConversations(prev => prev.map(c =>
                    c.id === conv.id ? { ...c, unread: 0 } : c
                ));
            }

        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        let content = newMessage.trim();

        // If there's a quoted listing, prepend it to the message
        if (quotedListing) {
            const quotedText = `LISTING_REF:${quotedListing.id}|||${quotedListing.title}|||${quotedListing.url}|||`;
            content = quotedText + content;
        }

        try {
            const payload = {
                sender_id: user.id,
                receiver_id: selectedConversation.user.id,
                content: content
            };

            const { data, error } = await supabase
                .from('messages')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            // Manual state update ensures message appears even if Realtime is off/failed
            if (data) {
                setMessages(prev => {
                    // Check duplicate here as well just in case
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
                setNewMessage('');
                setQuotedListing(null); // Clear quoted listing after sending
                // Also update the conversation list last message preview
                setConversations(prev => prev.map(c =>
                    c.id === selectedConversation.id
                        ? { ...c, lastMessage: newMessage.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                        : c
                ));
            }

        } catch (err) {
            console.error("Error sending message:", err);
            alert(`Mesaj gönderilemedi: ${err.message}`);
        }
    };

    useEffect(() => {
        // Only scroll the inner container, not the window
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <MessageCircle size={64} className="text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800">Mesajlarınızı görmek için giriş yapmalısınız.</h2>
                    <a href="/login" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Giriş Yap</a>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-4">
            <div className="flex-1 container mx-auto p-4 md:py-8">
                {/* Changed min-h to fixed height on desktop to enable inner scroll */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-220px)] min-h-[500px] flex flex-col md:flex-row">

                    {/* Left Sidebar: Conversations List */}
                    <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-lg text-gray-800">Mesajlar</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-400">
                                    <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>Henüz mesajınız yok.</p>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <button
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50
                                            ${selectedConversation?.id === conv.id ? 'bg-blue-50 hover:bg-blue-50' : ''}
                                        `}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500 overflow-hidden">
                                            {conv.user.avatar ?
                                                <img src={conv.user.avatar} alt={conv.user.name} className="w-full h-full object-cover" /> :
                                                <User size={24} />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate">{conv.user.name}</h3>
                                                <span className="text-xs text-gray-400 flex-shrink-0">{conv.time}</span>
                                            </div>
                                            <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                                                {conv.lastMessage || 'Yeni Konuşma'}
                                            </p>
                                        </div>
                                        {conv.unread > 0 && (
                                            <div className="flex flex-col items-end justify-center h-full">
                                                <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                                    {conv.unread}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side: Chat Window */}
                    <div className={`flex-1 flex flex-col h-full overflow-hidden ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white z-10">
                                    <button onClick={() => setSelectedConversation(null)} className="md:hidden text-gray-500">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                        {selectedConversation.user.avatar ?
                                            <img src={selectedConversation.user.avatar} alt="Avatar" className="w-full h-full object-cover" /> :
                                            selectedConversation.user.name.charAt(0)
                                        }
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedConversation.user.name}</h3>
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                        </span>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {messages.map((msg) => {
                                        const isMyMessage = msg.sender_id === user?.id;

                                        // Parse listing reference if exists
                                        let listingRef = null;
                                        let messageText = msg.content;

                                        if (msg.content.startsWith('LISTING_REF:')) {
                                            const parts = msg.content.split('|||');
                                            if (parts.length >= 4) {
                                                const listingId = parts[0].replace('LISTING_REF:', '');
                                                const listingTitle = parts[1];
                                                const listingUrl = parts[2];
                                                messageText = parts[3];
                                                listingRef = { id: listingId, title: listingTitle, url: listingUrl };
                                            }
                                        }

                                        return (
                                            <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isMyMessage
                                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                    }`}>
                                                    {listingRef && (
                                                        <div className={`mb-3 p-3 rounded-xl relative overflow-hidden ${isMyMessage ? 'bg-blue-500/30 border border-blue-400/30' : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'}`}>
                                                            {/* Decorative accent */}
                                                            <div className={`absolute top-0 left-0 w-1 h-full ${isMyMessage ? 'bg-blue-300' : 'bg-gradient-to-b from-blue-500 to-indigo-500'}`}></div>

                                                            <div className="flex items-start gap-2.5 pl-2">
                                                                {/* Icon */}
                                                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isMyMessage ? 'bg-blue-400' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                                        <polyline points="21 15 16 10 5 21" />
                                                                    </svg>
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={`text-[10px] font-medium mb-1 flex items-center gap-1 ${isMyMessage ? 'text-blue-100' : 'text-blue-600'}`}>
                                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                                                                        </svg>
                                                                        İlan Referansı
                                                                    </div>
                                                                    <div className={`text-xs font-semibold mb-1.5 line-clamp-2 ${isMyMessage ? 'text-white' : 'text-gray-900'}`}>{listingRef.title}</div>
                                                                    <a
                                                                        href={listingRef.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md transition-all ${isMyMessage ? 'bg-blue-400 text-white hover:bg-blue-300' : 'bg-white text-blue-600 hover:text-blue-700 shadow-sm hover:shadow'}`}
                                                                    >
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                                            <polyline points="15 3 21 3 21 9" />
                                                                            <line x1="10" y1="14" x2="21" y2="3" />
                                                                        </svg>
                                                                        İlana Git
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {messageText && (
                                                        <p className="text-sm break-words whitespace-pre-wrap">{messageText}</p>
                                                    )}
                                                    <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMyMessage ? 'text-blue-200' : 'text-gray-400'}`}>
                                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {isMyMessage && (
                                                            <span>
                                                                {msg.is_read ? <CheckCheck size={12} className="text-blue-200" /> : <Check size={12} />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-white border-t border-gray-200 z-10">
                                    {/* Quoted Listing Preview - Modern Design */}
                                    {quotedListing && (
                                        <div className="mb-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm relative overflow-hidden">
                                            {/* Decorative accent */}
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500"></div>

                                            <button
                                                onClick={() => setQuotedListing(null)}
                                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-1 transition"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </button>

                                            <div className="flex items-start gap-3 pl-3">
                                                {/* Icon */}
                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <polyline points="21 15 16 10 5 21" />
                                                    </svg>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <div className="text-xs font-medium text-blue-600 mb-1 flex items-center gap-1">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                                                        </svg>
                                                        İlan Referansı
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">{quotedListing.title}</div>
                                                    <a
                                                        href={quotedListing.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                            <polyline points="15 3 21 3 21 9" />
                                                            <line x1="10" y1="14" x2="21" y2="3" />
                                                        </svg>
                                                        İlana Git
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Bir mesaj yazın..."
                                            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle size={48} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-600">Mesajlaşmaya Başlayın</h3>
                                <p className="text-center max-w-xs mt-2">Soldaki menüden bir sohbet seçin veya yeni bir ilan üzerinden mesaj gönderin.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Mesajlar;
