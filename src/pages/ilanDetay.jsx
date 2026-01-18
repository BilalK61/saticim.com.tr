import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    MapPin,
    Phone,
    MessageCircle,
    Share2,
    Heart,
    Flag,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    ShieldCheck,
    User
} from 'lucide-react';
import IlanSikayet from '../components/ilansikayet';
import ShareButton from '../components/ShareButton';
import { useAuth } from '../context/AuthContext';

const IlanDetay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI States
    const [activeImage, setActiveImage] = useState(0);
    const [showPhone, setShowPhone] = useState(false);
    const [showSikayet, setShowSikayet] = useState(false);

    // Mock Data for fallback (BMW Listing as default placeholder for legacy IDs)
    const mockListing = {
        id: "1",
        title: "Sahibinden Temiz 2023 Model BMW 320i M Sport - Hatasız Boyasız",
        price: 3250000,
        currency: "TL",
        date: "07 Aralık 2024",
        created_at: new Date().toISOString(),
        location: {
            city: "İstanbul",
            district: "Kadıköy",
            neighborhood: "Bağdat Caddesi"
        },
        category: "vasita",
        subCategory: "Otomobil",
        brand: "BMW",
        images: [
            "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=1000",
        ],
        description: "Bu ilana ait detaylı bilgi veritabanında bulunamadı veya bu bir örnek ilandır.\n\nAracım 2023 model olup M Sport pakettir. İlk sahibiyim ve özenle kullanılmıştır. Hata, boya, değişen, tramer kesinlikle yoktur.",
        details: [
            { label: "İlan No", value: "1029384756" },
            { label: "Marka", value: "BMW" },
            { label: "Seri", value: "3 Serisi" },
            { label: "Model", value: "320i M Sport" },
            { label: "Yıl", value: "2023" },
            { label: "Yakıt", value: "Benzin" },
            { label: "Vites", value: "Otomatik" },
            { label: "KM", value: "12.500" }
        ],
        seller: {
            name: "Emir B.",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
            joinDate: "Ekim 2020",
            phones: ["0532 123 45 67"],
            isVerified: true
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchListing = async () => {
            try {
                setLoading(true);

                console.log("IlanDetay Mounted. ID:", id);

                // CHECK: If id is missing, use Mock Data immediately.
                // We removed the strict UUID check to allow flexible ID types (e.g. if you migrated to integers).
                if (!id) {
                    console.warn("No ID provided, using mock listing fallback.");
                    setListing({
                        ...mockListing,
                        id: "1",
                        categoryDisplay: "Örnek İlan"
                    });
                    setLoading(false);
                    return;
                }

                //1. Fetch main listing data from Supabase (sadece onaylı ilanlar)
                console.log("Fetching listing from Supabase...");
                const { data: listingData, error: listingError } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', id)
                    .eq('status', 'approved')
                    .single();

                if (listingError) {
                    console.error("Supabase Error:", listingError);
                    throw listingError;
                }

                if (!listingData) {
                    console.error("No data returned for ID:", id);
                    throw new Error("İlan bulunamadı (Veritabanı boş döndü)");
                }

                console.log("Listing Data Fetched:", listingData);

                // 2. Fetch related data (Location)
                let location = { city: '', district: '', neighborhood: '' };
                const locationPromises = [];

                if (listingData.city_id) {
                    locationPromises.push(
                        supabase.from('cities').select('name').eq('id', listingData.city_id).single()
                            .then(({ data }) => { if (data) location.city = data.name; })
                    );
                }
                if (listingData.district_id) {
                    locationPromises.push(
                        supabase.from('districts').select('name').eq('id', listingData.district_id).single()
                            .then(({ data }) => { if (data) location.district = data.name; })
                    );
                }
                if (listingData.neighborhood_id) {
                    locationPromises.push(
                        supabase.from('neighborhoods').select('name').eq('id', listingData.neighborhood_id).single()
                            .then(({ data }) => { if (data) location.neighborhood = data.name; })
                    );
                }

                // 3. Fetch related data (Vehicle) if applicable
                let manufacturer = '', model = '', pkg = '';
                if (listingData.category === 'vasita' && listingData.details) {
                    if (listingData.details.make_id) {
                        try {
                            locationPromises.push(
                                supabase.from('vehicle_makes').select('name').eq('id', listingData.details.make_id).single()
                                    .then(({ data }) => { if (data) manufacturer = data.name; })
                                    .catch(err => console.warn('Make fetch failed', err))
                            );
                        } catch (e) { }
                    }
                    if (listingData.details.model_id) {
                        locationPromises.push(
                            supabase.from('vehicle_models').select('name').eq('id', listingData.details.model_id).single()
                                .then(({ data }) => { if (data) model = data.name; })
                                .catch(err => console.warn('Model fetch failed', err))
                        );
                    }
                    if (listingData.details.package_id) {
                        locationPromises.push(
                            supabase.from('vehicle_packages').select('name').eq('id', listingData.details.package_id).single()
                                .then(({ data }) => { if (data) pkg = data.name; })
                                .catch(err => console.warn('Package fetch failed', err))
                        );
                    }
                }

                await Promise.all(locationPromises);

                // 4. Fetch Seller Profile - Gerçek üyelik bilgileri
                let sellerInfo = {
                    name: "Kullanıcı",
                    username: null,
                    avatar: null,
                    joinDate: "Üye",
                    isVerified: false
                };

                if (listingData.user_id) {
                    try {
                        const { data: profileData, error: profileError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', listingData.user_id)
                            .single();

                        if (!profileError && profileData) {
                            sellerInfo.name = profileData.full_name || profileData.username || "Kullanıcı";
                            sellerInfo.username = profileData.username;
                            sellerInfo.avatar = profileData.avatar_url;
                            // Tarihi güvenli bir şekilde parse et - created_at veya updated_at kullan
                            const dateField = profileData.created_at || profileData.updated_at;
                            if (dateField) {
                                const date = new Date(dateField);
                                if (!isNaN(date.getTime())) {
                                    sellerInfo.joinDate = date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
                                }
                            }
                            sellerInfo.isVerified = profileData.email_verified || false;
                        }
                    } catch (err) {
                        console.warn('Profile fetch failed', err);
                    }
                }

                // 4. Construct Details List
                const detailsList = [
                    { label: "İlan No", value: listingData.id },
                    { label: "İlan Tarihi", value: new Date(listingData.created_at).toLocaleDateString('tr-TR') },
                ];

                if (listingData.category === 'vasita') {
                    if (manufacturer) detailsList.push({ label: "Marka", value: manufacturer });
                    if (model) detailsList.push({ label: "Model", value: model });
                    if (pkg) detailsList.push({ label: "Paket", value: pkg });

                    const d = listingData.details || {};
                    if (d.year) detailsList.push({ label: "Yıl", value: d.year });
                    if (d.fuel) detailsList.push({ label: "Yakıt", value: d.fuel });
                    if (d.gear) detailsList.push({ label: "Vites", value: d.gear });
                    if (d.km) detailsList.push({ label: "KM", value: new Intl.NumberFormat('tr-TR').format(d.km) });
                    if (d.caseType) detailsList.push({ label: "Kasa Tipi", value: d.caseType });
                    if (d.motorPower) detailsList.push({ label: "Motor Gücü", value: d.motorPower });
                    if (d.motorVolume) detailsList.push({ label: "Motor Hacmi", value: d.motorVolume });
                    if (d.color) detailsList.push({ label: "Renk", value: d.color });
                    if (d.warranty) detailsList.push({ label: "Garanti", value: d.warranty });
                    if (d.fromWho) detailsList.push({ label: "Kimden", value: d.fromWho });
                    if (d.swap) detailsList.push({ label: "Takas", value: d.swap });
                }

                // Category Display Name
                const categoryNames = {
                    'vasita': 'Vasıta',
                    'emlak': 'Emlak',
                    'giyim': 'Giyim',
                    'elektronik': 'Elektronik'
                };

                // Safely parse images
                let validImages = [];
                if (Array.isArray(listingData.images)) {
                    validImages = listingData.images;
                } else if (typeof listingData.images === 'string') {
                    try {
                        // Try parsing if it looks like JSON
                        if (listingData.images.trim().startsWith('[')) {
                            validImages = JSON.parse(listingData.images);
                        } else {
                            validImages = [listingData.images];
                        }
                    } catch (e) {
                        console.warn("Image parse failed:", e);
                        validImages = [listingData.images];
                    }
                }

                // Filter out empty or null values
                validImages = validImages.filter(img => img && typeof img === 'string');

                // Fallback placeholder
                if (validImages.length === 0) {
                    validImages = ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000'];
                }

                const processedListing = {
                    ...listingData,
                    categoryDisplay: categoryNames[listingData.category] || listingData.category,
                    subCategory: model || '',
                    brand: manufacturer || '',
                    location,
                    details: detailsList,
                    images: validImages,
                    seller: {
                        name: sellerInfo.name,
                        username: sellerInfo.username,
                        avatar: sellerInfo.avatar,
                        joinDate: sellerInfo.joinDate,
                        phones: [listingData.contact_phone || "No Phone"],
                        isVerified: sellerInfo.isVerified
                    }
                };

                setListing(processedListing);
            } catch (err) {
                console.error("Error fetching listing:", err);

                // Second Fallback: If DB query fails specifically on UUID syntax (should be caught above, but just in case)
                if (err.message && (err.message.includes("invalid input syntax") || err.message.includes("uuid"))) {
                    setListing({
                        ...mockListing,
                        id: id,
                        categoryDisplay: "Örnek İlan (Hata)"
                    });
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id]);

    const formatPrice = (price, currency) => {
        return new Intl.NumberFormat('tr-TR').format(price) + ' ' + (currency || 'TL');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="text-red-500 font-medium text-lg">Hata: {error || "İlan bulunamadı"}</div>
                <a href="/" className="text-blue-600 hover:underline">Anasayfaya Dön</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center text-sm text-gray-500 gap-2 overflow-x-auto whitespace-nowrap">
                        <a href="/" className="hover:text-blue-600">Anasayfa</a>
                        <ChevronRight size={14} />
                        <a href={`/${listing.category}`} className="hover:text-blue-600">{listing.categoryDisplay}</a>
                        {listing.brand && (
                            <>
                                <ChevronRight size={14} />
                                <a href="#" className="hover:text-blue-600">{listing.brand}</a>
                            </>
                        )}
                        {listing.subCategory && (
                            <>
                                <ChevronRight size={14} />
                                <a href="#" className="hover:text-blue-600">{listing.subCategory}</a>
                            </>
                        )}
                        <ChevronRight size={14} />
                        <span className="text-gray-900 font-medium truncate">{listing.title}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN - Main Content */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Title Section (Mobile only) */}
                        <div className="lg:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <h1 className="text-xl font-bold text-gray-900 leading-snug">{listing.title}</h1>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-2xl font-bold text-blue-600">{formatPrice(listing.price, listing.currency)}</span>
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                    <MapPin size={16} />
                                    <span>{listing.location.city} / {listing.location.district}</span>
                                </div>
                            </div>
                        </div>

                        {/* Gallery */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="relative aspect-video bg-black group">
                                <img
                                    src={listing.images[activeImage]}
                                    alt={listing.title}
                                    className="w-full h-full object-contain"
                                />
                                {listing.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setActiveImage(prev => prev === 0 ? listing.images.length - 1 : prev - 1)}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={() => setActiveImage(prev => (prev + 1) % listing.images.length)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                                    {activeImage + 1} / {listing.images.length}
                                </div>
                            </div>
                            {listing.images.length > 1 && (
                                <div className="p-4 flex gap-2 overflow-x-auto pb-6 custom-scrollbar">
                                    {listing.images.map((img, idx) => (
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
                                {listing.description}
                            </div>
                        </div>

                        {/* Features List (Tabs or Grid) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Detaylar</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                                {listing.details.map((detail, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-gray-500 text-sm">{detail.label}:</span>
                                        <span className="font-medium text-gray-900">{detail.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Location Map */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Konum</h2>
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                                <iframe
                                    title="Konum Haritası"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=26.0,36.0,45.0,42.0&layer=mapnik&marker=${encodeURIComponent(listing.location.district + ', ' + listing.location.city + ', Türkiye')}`}
                                    style={{ border: 0 }}
                                ></iframe>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin size={20} className="shrink-0" />
                                        <span className="font-medium">
                                            {listing.location.neighborhood && `${listing.location.neighborhood}, `}
                                            {listing.location.district}, {listing.location.city}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/${encodeURIComponent((listing.location.neighborhood || '') + ' ' + listing.location.district + ' ' + listing.location.city + ' Türkiye')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                <MapPin size={16} />
                                Google Maps'te Aç
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Sidebar */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Price & Title Card (Desktop) */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h1 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{listing.title}</h1>
                            <div className="text-3xl font-bold text-blue-600 mb-4">{formatPrice(listing.price, listing.currency)}</div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                                <MapPin size={16} />
                                <span>{listing.location.district} / {listing.location.city}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-gray-400">İlan No: {listing.id}</span>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <ShareButton
                                    url={window.location.href}
                                    title={listing.title}
                                    className="!py-2 !px-3 text-sm"
                                />
                                <button className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition">
                                    <Heart size={16} />
                                    Favorilere Ekle
                                </button>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                {listing.details.slice(0, 8).map((detail, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">{detail.label}</span>
                                        <span className={`font-medium ${detail.label === 'Fiyat' ? 'text-blue-600' : 'text-gray-900'}`}>{detail.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                {listing.seller.avatar ? (
                                    <img src={listing.seller.avatar} alt={listing.seller.name} className="w-16 h-16 rounded-full object-cover border border-gray-100" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border border-gray-100">
                                        <User size={32} className="text-gray-500" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1">
                                        {listing.seller.name}
                                        {listing.seller.isVerified && <CheckCircle2 size={16} fill="currentColor" className="text-white bg-blue-500 rounded-full p-0.5" />}
                                    </h3>
                                    {listing.seller.username && (
                                        <p className="text-sm text-gray-400">@{listing.seller.username}</p>
                                    )}
                                    <p className="text-sm text-gray-500">Üyelik Tarihi: {listing.seller.joinDate}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowPhone(!showPhone)}
                                    className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                >
                                    <Phone size={20} />
                                    {showPhone ? listing.seller.phones[0] : "Numarayı Göster"}
                                </button>
                                {user && user.id !== listing.user_id && (
                                    <button
                                        onClick={() => navigate(`/mesajlar?recipientId=${listing.user_id}&listingId=${listing.id}&listingTitle=${encodeURIComponent(listing.title)}`)}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border-2 border-gray-200 py-3 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transition">
                                        <MessageCircle size={20} />
                                        Mesaj Gönder
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Safety Warning */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="text-green-600 shrink-0" size={24} />
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">Güvenli Alışveriş İpuçları</h4>
                                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-3">
                                        <li>Kapora veya ön ödeme göndermeyin.</li>
                                        <li>Ürünü görmeden satın almayın.</li>
                                        <li>Para transferini güvenli yöntemlerle yapın.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowSikayet(true)}
                                className="text-gray-400 text-xs flex items-center gap-1 hover:text-red-500 transition"
                            >
                                <Flag size={12} />
                                İlanı Şikayet Et
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <IlanSikayet
                isOpen={showSikayet}
                onClose={() => setShowSikayet(false)}
                listingId={listing.id}
                listingTitle={listing.title}
            />
        </div>
    );
};

export default IlanDetay;
