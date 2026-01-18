import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import Footer from '../components/Footer';
import { Search, Filter, Shirt, MapPin, ChevronDown, ChevronUp, SlidersHorizontal, ShoppingBag } from 'lucide-react';

const Giyim = () => {
    // Location States
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

    // Filter States
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [brand, setBrand] = useState('');
    const [condition, setCondition] = useState('');
    const [keyword, setKeyword] = useState('');

    // Applied Filters (Triggered by button)
    const [appliedFilters, setAppliedFilters] = useState({
        selectedCity: '',
        selectedDistrict: '',
        selectedNeighborhood: '',
        category: '',
        subCategory: '',
        size: '',
        color: '',
        priceRange: { min: '', max: '' },
        brand: '',
        condition: '',
        keyword: ''
    });

    const handleApplyFilters = () => {
        setAppliedFilters({
            selectedCity,
            selectedDistrict,
            selectedNeighborhood,
            category,
            subCategory,
            size,
            color,
            priceRange,
            brand,
            condition,
            keyword
        });
    };

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (selectedCity) {
            fetchDistricts(selectedCity);
        } else {
            setDistricts([]);
            setNeighborhoods([]);
        }
        setSelectedDistrict('');
        setSelectedNeighborhood('');
    }, [selectedCity]);

    useEffect(() => {
        if (selectedDistrict) {
            fetchNeighborhoods(selectedDistrict);
        } else {
            setNeighborhoods([]);
        }
        setSelectedNeighborhood('');
    }, [selectedDistrict]);

    const fetchCities = async () => {
        try {
            const { data, error } = await supabase.from('cities').select('*').order('name');
            if (error) throw error;
            setCities(data);
        } catch (error) {
            console.error('Şehirler çekilirken hata:', error.message);
        }
    };

    const fetchDistricts = async (cityId) => {
        try {
            const { data, error } = await supabase.from('districts').select('*').eq('city_id', cityId).order('name');
            if (error) throw error;
            setDistricts(data);
        } catch (error) {
            console.error('İlçeler çekilirken hata:', error.message);
        }
    };

    const fetchNeighborhoods = async (districtId) => {
        try {
            const { data, error } = await supabase.from('neighborhoods').select('*').eq('district_id', districtId).order('name');
            if (error) throw error;
            setNeighborhoods(data);
        } catch (error) {
            console.error('Mahalleler çekilirken hata:', error.message);
        }
    };

    const categories = [
        { id: 'kadin', name: 'Kadın' },
        { id: 'erkek', name: 'Erkek' },
        { id: 'cocuk', name: 'Çocuk' },
        { id: 'bebek', name: 'Bebek' }
    ];

    const subCategories = [
        'Elbise', 'Tişört', 'Gömlek', 'Pantolon', 'Jean', 'Etek', 'Ceket', 'Mont & Kaban', 'Ayakkabı', 'Çanta', 'Aksesuar', 'Spor Giyim', 'İç Giyim'
    ];

    const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Standart'];
    const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

    const colors = [
        { name: 'Siyah', code: '#000000' },
        { name: 'Beyaz', code: '#FFFFFF', border: true },
        { name: 'Kırmızı', code: '#EF4444' },
        { name: 'Mavi', code: '#3B82F6' },
        { name: 'Yeşil', code: '#10B981' },
        { name: 'Sarı', code: '#F59E0B' },
        { name: 'Lacivert', code: '#1E3A8A' },
        { name: 'Gri', code: '#6B7280' },
        { name: 'Bej', code: '#F5F5DC', border: true },
        { name: 'Kahverengi', code: '#78350F' },
        { name: 'Pembe', code: '#EC4899' },
        { name: 'Mor', code: '#8B5CF6' },
    ];

    // Data States
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(false);

    // Fetch listings when filters change
    useEffect(() => {
        fetchListings();
    }, [appliedFilters]);

    const fetchListings = async () => {
        setLoadingListings(true);
        try {
            // 1. Base Query
            let query = supabase
                .from('listings')
                .select('*')
                .eq('status', 'approved')
                .eq('category', 'giyim')
                .order('created_at', { ascending: false });

            // Apply Filters
            if (appliedFilters.selectedCity) query = query.eq('city_id', appliedFilters.selectedCity);
            if (appliedFilters.selectedDistrict) query = query.eq('district_id', appliedFilters.selectedDistrict);
            if (appliedFilters.priceRange.min) query = query.gte('price', appliedFilters.priceRange.min);
            if (appliedFilters.priceRange.max) query = query.lte('price', appliedFilters.priceRange.max);

            // Keyword Search
            if (appliedFilters.keyword) {
                query = query.ilike('title', `%${appliedFilters.keyword}%`);
            }

            // JSONB Filters
            if (appliedFilters.size) {
                query = query.contains('details', { size: appliedFilters.size });
            }
            if (appliedFilters.color) {
                query = query.contains('details', { color: appliedFilters.color });
            }
            if (appliedFilters.brand) {
                query = query.contains('details', { brand: appliedFilters.brand });
            }

            const { data: listingsData, error: listingsError } = await query;

            if (listingsError) throw listingsError;

            if (!listingsData || listingsData.length === 0) {
                setListings([]);
                return;
            }

            // 2. Fetch Location Details
            const cityIds = [...new Set(listingsData.map(l => l.city_id).filter(Boolean))];
            const districtIds = [...new Set(listingsData.map(l => l.district_id).filter(Boolean))];

            let citiesMap = {};
            let districtsMap = {};

            if (cityIds.length > 0) {
                const { data: citiesData } = await supabase
                    .from('cities')
                    .select('id, name')
                    .in('id', cityIds);
                (citiesData || []).forEach(c => citiesMap[c.id] = c.name);
            }

            if (districtIds.length > 0) {
                const { data: districtsData } = await supabase
                    .from('districts')
                    .select('id, name')
                    .in('id', districtIds);
                (districtsData || []).forEach(d => districtsMap[d.id] = d.name);
            }

            // 3. Merge Data
            const mergedListings = listingsData.map(listing => ({
                ...listing,
                cities: { name: citiesMap[listing.city_id] || '' },
                districts: { name: districtsMap[listing.district_id] || '' }
            }));

            setListings(mergedListings);

        } catch (error) {
            console.error('İlanlar çekilirken hata:', error);
        } finally {
            setLoadingListings(false);
        }
    };

    const FilterSection = ({ title, children, isOpen = true }) => {
        const [show, setShow] = useState(isOpen);
        return (
            <div className="border-b border-gray-100 py-4 last:border-0">
                <button
                    onClick={() => setShow(!show)}
                    className="flex items-center justify-between w-full mb-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                    {title}
                    {show ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {show && <div className="mt-2 space-y-2">{children}</div>}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

                {/* Sidebar Filters */}
                <aside className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                <SlidersHorizontal size={20} className="text-blue-600" />
                                <span>Detaylı Filtre</span>
                            </div>
                            <button
                                onClick={() => {
                                    setCategory('');
                                    setSubCategory('');
                                    setSize('');
                                    setPriceRange({ min: '', max: '' });
                                    setColor('');
                                    setBrand('');
                                    setCondition('');
                                    setKeyword('');
                                    setSelectedCity('');
                                    setSelectedDistrict('');
                                    setSelectedNeighborhood('');
                                    setAppliedFilters({
                                        selectedCity: '',
                                        selectedDistrict: '',
                                        selectedNeighborhood: '',
                                        category: '',
                                        subCategory: '',
                                        size: '',
                                        color: '',
                                        priceRange: { min: '', max: '' },
                                        brand: '',
                                        condition: '',
                                        keyword: ''
                                    });
                                }}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                Temizle
                            </button>
                        </div>

                        <div className="p-4">
                            {/* Keyword Search */}
                            <FilterSection title="Kelime ile Filtrele">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Aradığınız kelime..."
                                        className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-9"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                </div>
                            </FilterSection>

                            {/* Location */}
                            <FilterSection title="Adres">
                                <div className="space-y-2.5">
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => setSelectedCity(e.target.value)}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">İl Seçin</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>

                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => setSelectedDistrict(e.target.value)}
                                        disabled={!selectedCity}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">İlçe Seçin</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>

                                    <select
                                        value={selectedNeighborhood}
                                        onChange={(e) => setSelectedNeighborhood(e.target.value)}
                                        disabled={!selectedDistrict}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">Mahalle Seçin</option>
                                        {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                                    </select>
                                </div>
                            </FilterSection>

                            {/* Category Drilldown */}
                            <FilterSection title="Kategori">
                                <div className="space-y-2.5">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Cinsiyet Seçin</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>

                                    <select
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Ürün Tipi Seçin</option>
                                        {subCategories.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </FilterSection>

                            {/* Size */}
                            <FilterSection title="Beden">
                                <div className="flex flex-wrap gap-2">
                                    {(subCategory === 'Ayakkabı' ? shoeSizes : sizes).map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSize(s === size ? '' : s)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${size === s
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Price */}
                            <FilterSection title="Fiyat (TL)">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={priceRange.min}
                                        onChange={e => setPriceRange({ ...priceRange, min: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={priceRange.max}
                                        onChange={e => setPriceRange({ ...priceRange, max: e.target.value })}
                                    />
                                </div>
                            </FilterSection>

                            {/* Color */}
                            <FilterSection title="Renk">
                                <div className="flex flex-wrap gap-3">
                                    {colors.map(c => (
                                        <button
                                            key={c.name}
                                            onClick={() => setColor(c.name === color ? '' : c.name)}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center relative ${color === c.name ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                                                }`}
                                            title={c.name}
                                            style={{ backgroundColor: c.code, borderColor: c.border ? '#e5e7eb' : 'transparent' }}
                                        >
                                            {color === c.name && (
                                                <div className={`w-2 h-2 rounded-full ${c.name === 'Beyaz' || c.name === 'Bej' ? 'bg-black' : 'bg-white'}`} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Condition */}
                            <FilterSection title="Durum" isOpen={false}>
                                <div className="space-y-2">
                                    {['Yeni Etiketli', 'Yeni Gibi', 'Az Kullanılmış', 'Kullanılmış'].map(cond => (
                                        <label key={cond} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            {cond}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            <button
                                onClick={handleApplyFilters}
                                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                            >
                                <Search size={18} />
                                Sonuçları Göster
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {/* Top Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {appliedFilters.category ? categories.find(c => c.id === appliedFilters.category)?.name : 'Tüm Giyim İlanları'}
                                {subCategory && (
                                    <>
                                        <span className="text-gray-400">/</span>
                                        <span className="text-blue-600">{subCategory}</span>
                                    </>
                                )}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Arama kriterlerinize uygun ilanlar listeleniyor
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <select className="w-full sm:w-48 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option>Sıralama: Önerilen</option>
                                <option>Fiyat: Artan</option>
                                <option>Fiyat: Azalan</option>
                                <option>Tarih: En Yeni</option>
                                <option>Tarih: En Eski</option>
                            </select>
                        </div>
                    </div>

                    {/* Listings Grid */}
                    {loadingListings ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map(listing => (
                                <a key={listing.id} href={`/ilan-detay/${listing.id}`} className="block group">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                            <img
                                                src={listing.images && listing.images[0] ? listing.images[0] : 'https://placehold.co/400x300?text=Resim+Yok'}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <MapPin size={12} />
                                                {listing.cities?.name} / {listing.districts?.name}
                                            </div>
                                            {listing.details?.size && (
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    {listing.details.size}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                                                    {listing.title}
                                                </h3>
                                            </div>
                                            <div className="text-xl font-bold text-blue-600 mb-3">
                                                {new Intl.NumberFormat('tr-TR').format(listing.price)} {listing.currency}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                                <span>{listing.details?.type}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{listing.details?.color}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{listing.details?.brand}</span>
                                            </div>
                                            <div className="text-xs text-gray-400 text-right">
                                                {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-200 min-h-[400px] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <Shirt className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Seçtiğiniz kriterlere uygun ilan bulunamadı. Filtreleri değiştirerek tekrar deneyebilir veya yeni bir arama yapabilirsiniz.
                            </p>
                            <button
                                onClick={() => {
                                    setCategory('');
                                    setSubCategory('');
                                    setSize('');
                                    setPriceRange({ min: '', max: '' });
                                    setColor('');
                                    setBrand('');
                                    setCondition('');
                                    setKeyword('');
                                    setSelectedCity('');
                                    setSelectedDistrict('');
                                    setSelectedNeighborhood('');
                                    setAppliedFilters({
                                        selectedCity: '',
                                        selectedDistrict: '',
                                        selectedNeighborhood: '',
                                        category: '',
                                        subCategory: '',
                                        size: '',
                                        color: '',
                                        priceRange: { min: '', max: '' },
                                        brand: '',
                                        condition: '',
                                        keyword: ''
                                    });
                                }}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </div>

    );
};

export default Giyim;
