import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Footer from '../../components/Footer';
import { Search, Filter, Smartphone, Monitor, Laptop, Tv, MapPin, ChevronDown, ChevronUp, SlidersHorizontal, Battery, Wifi } from 'lucide-react';

const Elektronik = () => {
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
    const [brand, setBrand] = useState(''); // Brand ID
    const [model, setModel] = useState(''); // Model ID
    const [storage, setStorage] = useState('');
    const [ram, setRam] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [condition, setCondition] = useState(''); // Using 'status' in DB details, but let's keep 'condition' var name or unify
    const [warranty, setWarranty] = useState('');
    const [keyword, setKeyword] = useState('');

    // Dynamic Data States
    const [phoneBrands, setPhoneBrands] = useState([]);
    const [phoneModels, setPhoneModels] = useState([]);

    // Filter Visibility State
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Applied Filters (Triggered by button)
    const [appliedFilters, setAppliedFilters] = useState({
        selectedCity: '',
        selectedDistrict: '',
        selectedNeighborhood: '',
        category: '',
        subCategory: '',
        brand: '',
        model: '',
        storage: '',
        ram: '',
        priceRange: { min: '', max: '' },
        condition: '', // This maps to 'status' in details
        warranty: '',
        keyword: ''
    });

    const handleApplyFilters = () => {
        setAppliedFilters({
            selectedCity,
            selectedDistrict,
            selectedNeighborhood,
            category,
            subCategory,
            brand,
            model,
            storage,
            ram,
            priceRange,
            condition,
            warranty,
            keyword
        });
        setShowMobileFilters(false);
    };

    // Data States
    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(false);

    useEffect(() => {
        fetchCities();
        fetchPhoneBrands();
    }, []);

    useEffect(() => {
        if (brand) {
            fetchPhoneModels(brand);
        } else {
            setPhoneModels([]);
        }
        // Reset model if brand changes
        // But here 'brand' state changes immediately on UI, appliedFilters.brand changes on button click.
        // We should fetch models based on UI selection 'brand'.
        if (brand && model) {
            // Optional: check if model belongs to brand or reset.
            // For simplicity, we might let user clear it or clear it automatically if we want strict dependency.
            // setModel(''); // Uncommenting this would clear model every time brand is re-clicked/set.
            // Better to clear model only if brand changes to something else.
        }
    }, [brand]);

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

    // Fetch listings when filters change
    useEffect(() => {
        fetchListings();
    }, [appliedFilters]);

    const fetchPhoneBrands = async () => {
        try {
            const { data, error } = await supabase.from('phone_brands').select('*').order('name');
            if (error) throw error;
            setPhoneBrands(data || []);
        } catch (error) {
            console.error('Telefon markaları çekilirken hata:', error.message);
        }
    };

    const fetchPhoneModels = async (brandId) => {
        try {
            const { data, error } = await supabase.from('phone_models').select('*').eq('brand_id', brandId).order('name');
            if (error) throw error;

            // Filter models based on subCategory if selected
            let filteredData = data || [];
            if (appliedFilters.subCategory === 'Cep Telefonu') {
                filteredData = filteredData.filter(m => !m.name.match(/iPad|Tab|Pad|Watch/i));
            } else if (appliedFilters.subCategory === 'Tablet') {
                filteredData = filteredData.filter(m => m.name.match(/iPad|Tab|Pad/i));
            }
            // For 'Telefon' category general selection, we might still show everything or try to filter? 
            // The user complaint was "Category Telefon selected -> Tablet models appear". 
            // If appliedFilters.category === 'telefon' and subCategory is empty, 
            // maybe we should separate them? But usually 'Phone' category implies phones. 
            // Let's at least fix the subCategory case which is the most explicit.

            setPhoneModels(filteredData);
        } catch (error) {
            console.error('Telefon modelleri çekilirken hata:', error.message);
        }
    };

    const fetchCities = async () => {
        try {
            const { data, error } = await supabase
                .from('cities')
                .select('*')
                .order('name');

            if (error) throw error;
            setCities(data);
        } catch (error) {
            console.error('Şehirler çekilirken hata:', error.message);
        }
    };

    const fetchDistricts = async (cityId) => {
        try {
            const { data, error } = await supabase
                .from('districts')
                .select('*')
                .eq('city_id', cityId)
                .order('name');

            if (error) throw error;
            setDistricts(data);
        } catch (error) {
            console.error('İlçeler çekilirken hata:', error.message);
        }
    };

    const fetchNeighborhoods = async (districtId) => {
        try {
            const { data, error } = await supabase
                .from('neighborhoods')
                .select('*')
                .eq('district_id', districtId)
                .order('name');

            if (error) throw error;
            setNeighborhoods(data);
        } catch (error) {
            console.error('Mahalleler çekilirken hata:', error.message);
        }
    };

    const fetchListings = async () => {
        setLoadingListings(true);
        try {
            // 1. Base Query (sadece onaylı ilanlar)
            let query = supabase
                .from('listings')
                .select('*')
                .eq('status', 'approved')
                .eq('category', 'elektronik')
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
            if (appliedFilters.brand) {
                // brand is stored as ID in details->brand
                query = query.contains('details', { brand: appliedFilters.brand });
            }
            if (appliedFilters.model) {
                query = query.contains('details', { model: appliedFilters.model });
            }
            if (appliedFilters.storage) {
                query = query.contains('details', { storage: appliedFilters.storage });
            }
            if (appliedFilters.ram) {
                query = query.contains('details', { ram: appliedFilters.ram });
            }
            if (appliedFilters.subCategory) {
                query = query.contains('details', { subCategory: appliedFilters.subCategory });
            }
            if (appliedFilters.condition) {
                // In ilanEkle we save as 'status', here state is 'condition'. 
                // Let's match db field which is 'status'.
                query = query.contains('details', { status: appliedFilters.condition });
            }
            if (appliedFilters.warranty) {
                query = query.contains('details', { warranty: appliedFilters.warranty });
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

    const categories = [
        { id: 'telefon', name: 'Telefon', icon: Smartphone },
        { id: 'bilgisayar', name: 'Bilgisayar', icon: Laptop },
        { id: 'tv', name: 'TV & Ses Sistemleri', icon: Tv },
        { id: 'beyaz-esya', name: 'Beyaz Eşya', icon: Monitor }, // Placeholder icon
        { id: 'foto-kamera', name: 'Fotoğraf & Kamera', icon: Wifi }, // Placeholder
        { id: 'oyun', name: 'Oyun & Konsol', icon: Battery }, // Placeholder
    ];

    const subCategories = {
        'telefon': ['Cep Telefonu', 'Tablet', 'Aksesuar', 'Giyilebilir Teknoloji', 'Telsiz', 'Numara', 'Masaüstü Telefon'],
        'bilgisayar': ['Dizüstü', 'Masaüstü', 'Tablet', 'Sunucu', 'Çevre Birimleri', 'Bileşenler'],
        'tv': ['Televizyon', 'Uydu Sistemleri', 'Ev Sinema Sistemleri', 'Projeksiyon', 'Medya Oynatıcı'],
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
                        <div
                            className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer lg:cursor-default"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                        >
                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                <SlidersHorizontal size={20} className="text-blue-600" />
                                <span>Detaylı Filtre</span>
                            </div>
                            <div className="lg:hidden text-gray-500">
                                {showMobileFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCategory('');
                                    setSubCategory('');
                                    setBrand('');
                                    setModel('');
                                    setStorage('');
                                    setRam('');
                                    setPriceRange({ min: '', max: '' });
                                    setCondition('');
                                    setWarranty('');
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
                                        brand: '',
                                        model: '',
                                        storage: '',
                                        ram: '',
                                        priceRange: { min: '', max: '' },
                                        condition: '',
                                        warranty: '',
                                        keyword: ''
                                    });
                                }}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                Temizle
                            </button>
                        </div>

                        <div className={`p-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                            {/* Kelime ile Filtrele */}
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
                                        onChange={(e) => {
                                            setCategory(e.target.value);
                                            setSubCategory('');
                                        }}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Kategori Seçin</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>

                                    <select
                                        value={subCategory}
                                        onChange={(e) => setSubCategory(e.target.value)}
                                        disabled={!category || !subCategories[category]}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">Alt Kategori Seçin</option>
                                        {category && subCategories[category] && subCategories[category].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </FilterSection>

                            {/* Brand */}
                            <FilterSection title="Marka" isOpen={true}>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                    {phoneBrands.map(b => (
                                        <label key={b.id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={brand == b.id} // use loose equality for string/number match or use stored type
                                                onChange={() => {
                                                    const newVal = brand == b.id ? '' : b.id;
                                                    setBrand(newVal);
                                                    setModel(''); // Reset model when brand changes
                                                }}
                                            />
                                            {b.name}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Model */}
                            {brand && phoneModels.length > 0 && (
                                <FilterSection title="Model" isOpen={true}>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {phoneModels.map(m => (
                                            <label key={m.id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={model == m.id}
                                                    onChange={() => setModel(model == m.id ? '' : m.id)}
                                                />
                                                {m.name}
                                            </label>
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* Storage */}
                            <FilterSection title="Dahili Hafıza" isOpen={false}>
                                <div className="space-y-2">
                                    {['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'].map(s => (
                                        <label key={s} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={storage === s}
                                                onChange={() => setStorage(storage === s ? '' : s)}
                                            />
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* RAM */}
                            <FilterSection title="RAM" isOpen={false}>
                                <div className="space-y-2">
                                    {['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB'].map(r => (
                                        <label key={r} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={ram === r}
                                                onChange={() => setRam(ram === r ? '' : r)}
                                            />
                                            {r}
                                        </label>
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

                            {/* Condition */}
                            <FilterSection title="Durum" isOpen={false}>
                                <div className="space-y-2">
                                    {['Sıfır', 'İkinci El', 'Yenilenmiş'].map(cond => (
                                        <label key={cond} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={condition === cond}
                                                onChange={() => setCondition(condition === cond ? '' : cond)}
                                            />
                                            {cond}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Warranty */}
                            <FilterSection title="Garanti Durumu" isOpen={false}>
                                <div className="space-y-2">
                                    {['Var', 'Yok'].map(w => (
                                        <label key={w} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={warranty === w}
                                                onChange={() => setWarranty(warranty === w ? '' : w)}
                                            />
                                            {w}
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
                                {appliedFilters.category ? categories.find(c => c.id === appliedFilters.category)?.name : 'Tüm Elektronik İlanları'}
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
                                            {listing.details?.condition && (
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    {listing.details.condition}
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
                                                {/* Using optional chaining for safety */}
                                                <span>{listing.details?.subCategory}</span>
                                                {listing.details?.brand && (
                                                    <>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span>{listing.details.brand}</span>
                                                    </>
                                                )}
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
                                <Smartphone className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Seçtiğiniz kriterlere uygun ilan bulunamadı. Filtreleri değiştirerek tekrar deneyebilir veya yeni bir arama yapabilirsiniz.
                            </p>
                            <button
                                onClick={() => {
                                    setCategory('');
                                    setSubCategory('');
                                    setBrand('');
                                    setModel('');
                                    setStorage('');
                                    setRam('');
                                    setPriceRange({ min: '', max: '' });
                                    setCondition('');
                                    setWarranty('');
                                    setSelectedCity('');
                                    setSelectedDistrict('');
                                    setSelectedNeighborhood('');
                                    setAppliedFilters({
                                        selectedCity: '',
                                        selectedDistrict: '',
                                        selectedNeighborhood: '',
                                        category: '',
                                        subCategory: '',
                                        brand: '',
                                        model: '',
                                        storage: '',
                                        ram: '',
                                        priceRange: { min: '', max: '' },
                                        condition: '',
                                        warranty: ''
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
}

export default Elektronik;
