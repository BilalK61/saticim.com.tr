import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Trophy, TrendingUp, RefreshCw, DollarSign, MapPin, Home, ArrowRight, Play, Award, User, Lock, Grid, Car, Smartphone, Shirt, Armchair, Briefcase, Wrench, Baby, Gamepad2, Book, Sparkles, Dumbbell, ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Modal from '../components/Modal';

// Helper to format currency
const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
};

const PriceGuessGame = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false); // Changed to false initially as we wait for category
    const [guess, setGuess] = useState('');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameState, setGameState] = useState('intro'); // intro, category_select, playing, result, round_over, game_over
    const [selectedCategory, setSelectedCategory] = useState(null); // 'all', 'vasita', 'emlak' etc.
    const [roundResult, setRoundResult] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

    // UI States for IlanDetay style
    const [activeImage, setActiveImage] = useState(0);
    const [showPhone, setShowPhone] = useState(false);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null
    });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const categories = [
        { id: 'all', name: 'Tüm İlanlar', icon: Grid, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
        { id: 'vasita', name: 'Vasıta', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        { id: 'emlak', name: 'Emlak', icon: Home, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'elektronik', name: 'Elektronik', icon: Smartphone, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        { id: 'giyim', name: 'Giyim', icon: Shirt, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        { id: 'ev-esyalari', name: 'Ev Eşyaları', icon: Armchair, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        { id: 'spor', name: 'Spor', icon: Dumbbell, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        { id: 'hobi-oyun', name: 'Hobi & Oyun', icon: Gamepad2, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
    ];

    useEffect(() => {
        const storedHighScore = localStorage.getItem('priceGuessHighScore');
        if (storedHighScore) {
            setHighScore(parseInt(storedHighScore));
        }
        // Removed initial fetchListings() call
        fetchLeaderboard();
    }, []);

    const fetchListings = async (categoryId) => {
        console.log('Fetching listings for category:', categoryId);
        setLoading(true);
        try {
            let query = supabase
                .from('listings')
                .select('*, cities(name), districts(name)')
                .eq('status', 'approved');

            if (categoryId && categoryId !== 'all') {
                query = query.eq('category', categoryId);
            }

            // Fetch a random batch (limitation: getting latest/random 50)
            const { data, error } = await query.limit(50);

            if (error) throw error;

            if (data && data.length > 0) {
                // Shuffle array
                const shuffled = data.sort(() => 0.5 - Math.random());
                setListings(shuffled);
                setGameState('playing');
                setCurrentIndex(0);
                setScore(0);
                setGuess('');
            } else {
                setGameState('category_select');
                setModal({
                    isOpen: true,
                    title: 'İlan Bulunamadı',
                    message: `${categoryId === 'all' ? 'Henüz hiç ilan eklenmemiş.' : 'Bu kategoride henüz oynanabilir ilan yok.'}`,
                    type: 'warning',
                    onConfirm: () => setGameState('category_select')
                });
            }
        } catch (err) {
            console.error('Error fetching listings:', err);
            setGameState('category_select');
            setModal({
                isOpen: true,
                title: 'Hata',
                message: 'İlanlar yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
                type: 'error',
                onConfirm: () => setGameState('category_select')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        fetchListings(categoryId);
    };

    const fetchLeaderboard = async () => {
        console.log('Fetching leaderboard...');
        setLoadingLeaderboard(true);
        try {
            // Get start of current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            // 1. Get top scores for current month
            const { data: scores, error } = await supabase
                .from('game_scores')
                .select('*')
                .gte('created_at', startOfMonth)
                .order('score', { ascending: false })
                .limit(10);

            if (error) throw error;

            if (scores && scores.length > 0) {
                // 2. Get user profiles for these scores
                const userIds = [...new Set(scores.map(s => s.user_id))];
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, full_name, avatar_url')
                    .in('id', userIds);

                if (profilesError) throw profilesError;

                // 3. Merge data
                const profilesMap = {};
                profiles.forEach(p => profilesMap[p.id] = p);

                const mergedLeaderboard = scores.map(s => ({
                    ...s,
                    user: profilesMap[s.user_id] || { username: 'Bilinmeyen Kullanıcı' }
                }));

                setLeaderboard(mergedLeaderboard);
            }
        } catch (err) {
            console.error('Liderlik tablosu çekilemedi:', err);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const saveScore = async (finalScore) => {
        if (!user || finalScore === 0) return;

        try {
            const { error } = await supabase
                .from('game_scores')
                .insert([
                    { user_id: user.id, score: finalScore }
                ]);

            if (error) throw error;
            fetchLeaderboard(); // Refresh leaderboard
        } catch (err) {
            console.error('Skor kaydedilemedi:', err);
        }
    };

    const startGame = () => {
        setGameState('category_select');
        setError(null);
    };

    const restartGame = () => {
        if (selectedCategory) {
            fetchListings(selectedCategory);
        } else {
            setGameState('category_select');
        }
    };

    const handleGuess = (e) => {
        e.preventDefault();
        const numericGuess = parseInt(guess.replace(/\./g, '').replace(/,/g, ''));

        if (isNaN(numericGuess)) return;

        const actualPrice = listings[currentIndex].price;
        const difference = Math.abs(numericGuess - actualPrice);
        const percentageOff = (difference / actualPrice) * 100;

        let points = 0;
        let message = '';
        let type = 'neutral';

        if (percentageOff <= 5) {
            points = 1000;
            message = 'Mükemmel Tahmin! 🔥';
            type = 'success';
        } else if (percentageOff <= 10) {
            points = 500;
            message = 'Çok Yaklaştın! 👏';
            type = 'success';
        } else if (percentageOff <= 20) {
            points = 250;
            message = 'Güzel Tahmin 👍';
            type = 'warning';
        } else if (percentageOff <= 50) {
            points = 100;
            message = 'Biraz Uzaksın 🤔';
            type = 'warning';
        } else {
            points = 0;
            message = 'Maalesef Bilemedin 😢';
            type = 'error';
        }

        const newScore = score + points;
        setScore(newScore);

        if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('priceGuessHighScore', newScore.toString());
        }

        setRoundResult({
            guess: numericGuess,
            actual: actualPrice,
            difference,
            points,
            message,
            type,
            percentageOff: percentageOff.toFixed(1)
        });

        setGameState('result');
    };

    const nextRound = () => {
        if (currentIndex < listings.length - 1) {
            setProcessedListing(null); // Clear previous resolved details
            setCurrentIndex(prev => prev + 1);
            setGuess('');
            setActiveImage(0); // Reset image carousel
            setGameState('playing');
            setRoundResult(null);
        } else {
            // Game Over logic
            setGameState('game_over');
            saveScore(score);
        }
    };

    const [processedListing, setProcessedListing] = useState(null);

    // Resolve details (Brand, Model, etc.) when current listing changes
    useEffect(() => {
        const resolveDetails = async () => {
            if (!listings.length || !listings[currentIndex]) return;

            const rawListing = listings[currentIndex];
            let resolvedDetails = { ...rawListing.details };
            let resolvedBrand = '';
            let resolvedModel = '';
            let resolvedTitle = rawListing.title; // For game logic if needed

            // Logic for Vasita (Vehicles) - Resolve IDs to Names
            if (rawListing.category === 'vasita' && rawListing.details) {
                try {
                    if (rawListing.details.make_id) {
                        const { data } = await supabase.from('vehicle_makes').select('name').eq('id', rawListing.details.make_id).single();
                        if (data) {
                            resolvedDetails.brand = data.name;
                            resolvedBrand = data.name;
                            delete resolvedDetails.make_id; // Remove ID from display
                        }
                    }
                    if (rawListing.details.model_id) {
                        const { data } = await supabase.from('vehicle_models').select('name').eq('id', rawListing.details.model_id).single();
                        if (data) {
                            resolvedDetails.model = data.name;
                            resolvedModel = data.name;
                            delete resolvedDetails.model_id;
                        }
                    }
                    if (rawListing.details.package_id) {
                        const { data } = await supabase.from('vehicle_packages').select('name').eq('id', rawListing.details.package_id).single();
                        if (data) {
                            resolvedDetails.package = data.name;
                            delete resolvedDetails.package_id;
                        }
                    }
                } catch (err) {
                    console.error('Error resolving vehicle details:', err);
                }
            }

            // Create a structured listing object for display
            setProcessedListing({
                ...rawListing,
                details: resolvedDetails,
                brand: resolvedBrand,
                model: resolvedModel
            });
        };

        resolveDetails();
    }, [currentIndex, listings]);

    const currentListing = processedListing || listings[currentIndex];

    // Only block if explicitly loading api data
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
                confirmText="Tamam"
            />
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Main Game Area */}
                <div className="flex-1 max-w-4xl mx-auto w-full">
                    {/* Header / Scoreboard */}
                    <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Skor</span>
                                <span className="text-2xl font-bold text-blue-600">{score}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100">
                            <Trophy size={20} className="text-yellow-600" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-yellow-700 font-bold uppercase">Rekorun</span>
                                <span className="text-lg font-bold text-yellow-800">{highScore}</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {gameState === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 text-center border border-gray-100 overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>

                                <div className="mb-8 relative inline-block">
                                    <div className="absolute -inset-4 bg-blue-100 rounded-full blur-xl opacity-50"></div>
                                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg relative transform -rotate-3">
                                        <DollarSign size={48} />
                                    </div>
                                </div>

                                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                    Fiyatı Tahmin Et
                                </h1>
                                <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
                                    Emlak piyasasına ne kadar hakimsin? İlanları incele, özelliklerine bak ve fiyatı tahmin etmeye çalış. En yüksek puanı sen topla!
                                </p>

                                <button
                                    onClick={startGame}
                                    className="group relative inline-flex items-center justify-center bg-gray-900 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto"
                                >
                                    <Play className="mr-2 group-hover:fill-current" size={20} />
                                    Oyuna Başla
                                </button>
                            </motion.div>
                        )}

                        {gameState === 'category_select' && (
                            <motion.div
                                key="category_select"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Bir Kategori Seç</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {categories.map((cat, index) => (
                                        <motion.button
                                            key={cat.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group
                                                ${cat.bg} ${cat.border} hover:scale-105 hover:shadow-md`}
                                        >
                                            <div className={`p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform ${cat.color}`}>
                                                <cat.icon size={24} />
                                            </div>
                                            <span className={`font-bold ${cat.color}`}>{cat.name}</span>
                                        </motion.button>
                                    ))}
                                </div>
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => setGameState('intro')}
                                        className="text-gray-500 hover:text-gray-900 font-medium text-sm"
                                    >
                                        Giriş Ekranına Dön
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {(gameState === 'playing' || gameState === 'result') && currentListing && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                {/* Gallery */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="relative aspect-video bg-black group">
                                        <img
                                            src={currentListing.images && (Array.isArray(currentListing.images) ? currentListing.images[activeImage] : currentListing.images) ? (Array.isArray(currentListing.images) ? currentListing.images[activeImage] : currentListing.images) : 'https://placehold.co/800x600?text=Resim+Yok'}
                                            alt="İlan Resmi"
                                            className="w-full h-full object-contain"
                                        />
                                        {currentListing.images && Array.isArray(currentListing.images) && currentListing.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setActiveImage(prev => prev === 0 ? currentListing.images.length - 1 : prev - 1)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                                                >
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button
                                                    onClick={() => setActiveImage(prev => (prev + 1) % currentListing.images.length)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                                                >
                                                    <ChevronRight size={24} />
                                                </button>
                                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                                                    {activeImage + 1} / {currentListing.images.length}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    {currentListing.images && Array.isArray(currentListing.images) && currentListing.images.length > 1 && (
                                        <div className="p-4 flex gap-2 overflow-x-auto pb-6 custom-scrollbar">
                                            {currentListing.images.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveImage(idx)}
                                                    className={`relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${activeImage === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                >
                                                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">İlan Açıklaması</h2>
                                    <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
                                        {currentListing.description || 'Açıklama bulunmuyor.'}
                                    </div>
                                </div>

                                {/* Features List */}
                                {currentListing.details && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Detaylar</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                                            {Object.entries(currentListing.details).map(([key, value], idx) => {
                                                const labelMapping = {
                                                    room: 'Oda Sayısı',
                                                    size: 'Metrekare (m²)',
                                                    age: 'Bina Yaşı',
                                                    floor: 'Kat',
                                                    heating: 'Isıtma',
                                                    balcony: 'Balkon',
                                                    furnished: 'Eşyalı',
                                                    usingStatus: 'Kullanım Durumu',
                                                    dues: 'Aidat',
                                                    credit: 'Krediye Uygun',
                                                    year: 'Yıl',
                                                    fuel: 'Yakıt',
                                                    gear: 'Vites',
                                                    km: 'KM',
                                                    caseType: 'Kasa Tipi',
                                                    motorPower: 'Motor Gücü',
                                                    motorVolume: 'Motor Hacmi',
                                                    color: 'Renk',
                                                    warranty: 'Garanti',
                                                    fromWho: 'Kimden',
                                                    swap: 'Takas',
                                                    screenSize: 'Ekran Boyutu',
                                                    resolution: 'Çözünürlük',
                                                    processor: 'İşlemci',
                                                    ram: 'RAM',
                                                    storage: 'Depolama',
                                                    battery: 'Pil Sağlığı',
                                                    camera: 'Kamera',
                                                    os: 'İşletim Sistemi',
                                                    brand: 'Marka',
                                                    model: 'Model',
                                                    status: 'Durum'
                                                };

                                                // If value is null/undefined or empty string, skip
                                                if (!value) return null;

                                                return (
                                                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        <span className="text-gray-500 text-sm capitalize">{labelMapping[key] || key}:</span>
                                                        <span className="font-medium text-gray-900">{value}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {gameState === 'game_over' && (
                            <motion.div
                                key="gameover"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 max-w-lg mx-auto"
                            >
                                <h2 className="text-3xl font-black text-gray-900 mb-2">Oyun Bitti!</h2>
                                <p className="text-gray-500 mb-8">Bütün ilanları tamamladın.</p>

                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mb-8">
                                    <span className="block text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Toplam Skor</span>
                                    <span className="block text-5xl font-black text-gray-900">{score}</span>
                                    {!user && score > 0 && (
                                        <div className="mt-4 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg flex items-center justify-center gap-2">
                                            <Lock size={12} />
                                            Skorunu kaydetmek için giriş yapmalısın.
                                        </div>
                                    )}
                                    {user && <div className="mt-4 text-xs text-green-600 bg-green-50 p-2 rounded-lg">Skorun listeye eklendi!</div>}
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={restartGame}
                                        className="w-full bg-blue-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={20} />
                                        Tekrar Oyna
                                    </button>

                                    <button
                                        onClick={() => setGameState('category_select')}
                                        className="w-full bg-gray-100 text-gray-700 rounded-xl py-4 font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                    >
                                        <Grid size={20} />
                                        Kategori Değiştir
                                    </button>

                                    {!user && (
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="w-full bg-white text-blue-600 border-2 border-blue-600 rounded-xl py-3 font-bold hover:bg-blue-50 transition"
                                        >
                                            Giriş Yap
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar with Game Interface and Leaderboard */}
                <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                    {/* Game Interface Card */}
                    {(gameState === 'playing' || gameState === 'result') && currentListing && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4 z-10 transition-all">
                            <h1 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                                {gameState === 'result' ? currentListing.title : 'Gizli İlan'}
                            </h1>

                            {gameState === 'playing' ? (
                                <form onSubmit={handleGuess} className="flex flex-col gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400 font-semibold">₺</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            autoFocus
                                            value={guess}
                                            onChange={(e) => setGuess(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 text-gray-900 text-xl font-bold rounded-xl py-3 pl-8 pr-3 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-center outline-none"
                                            placeholder="Tahmin?"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold hover:bg-blue-700 transition shadow-md"
                                    >
                                        Tahmin Et
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <div className={`mx-auto rounded-full w-12 h-12 flex items-center justify-center mb-2 ${roundResult.type === 'success' ? 'bg-green-100 text-green-600' :
                                        roundResult.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {roundResult.type === 'success' ? <Award size={24} /> : <TrendingUp size={24} />}
                                    </div>

                                    <div className="text-2xl font-black text-blue-600 mb-1">{formatPrice(currentListing.price)}</div>
                                    <div className="text-sm font-bold text-gray-900 mb-4">{roundResult.message}</div>

                                    <div className="flex justify-between text-xs bg-gray-50 p-2 rounded-lg mb-4">
                                        <span className="text-gray-500">Tahmin: {formatPrice(roundResult.guess)}</span>
                                        <span className={`${roundResult.type === 'success' ? 'text-green-600' : 'text-red-500'} font-bold`}>
                                            %{roundResult.percentageOff}
                                        </span>
                                    </div>

                                    <button
                                        onClick={nextRound}
                                        className="w-full bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition shadow-md flex items-center justify-center gap-2"
                                    >
                                        Sıradaki İlan <ArrowRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                            <h3 className="font-bold flex items-center gap-2">
                                <Trophy size={20} />
                                Liderlik Tablosu
                            </h3>
                            <p className="text-xs text-yellow-100 mt-1">En yüksek puan yapanlar</p>
                        </div>

                        <div className="p-2">
                            {loadingLeaderboard ? (
                                <div className="p-4 text-center text-gray-500 text-sm">Yükleniyor...</div>
                            ) : leaderboard.length > 0 ? (
                                <div className="space-y-1">
                                    {leaderboard.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl ${user && item.user_id === user.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-white text-gray-500 border border-gray-100'
                                                }`}>
                                                {index + 1}
                                            </div>

                                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                {item.user?.avatar_url ? (
                                                    <img src={item.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-full h-full p-1.5 text-gray-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-gray-900 truncate">
                                                    {item.user?.full_name || item.user?.username || 'Kullanıcı'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>

                                            <div className="font-bold text-blue-600 text-sm bg-blue-50 px-2 py-1 rounded-md">
                                                {item.score}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    Henüz skor yok.
                                    <br />
                                    İlk sen ol!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceGuessGame;
