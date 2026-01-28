import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Footer from '../../components/Footer';
import { Search, Filter, Home, MapPin, ChevronDown, ChevronUp, SlidersHorizontal, Armchair, ArrowUpDown } from 'lucide-react';

const EvEsyalari = () => {
    // Location States
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

    // Filter States
    const [subCategory, setSubCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [condition, setCondition] = useState(''); // Sıfır, İkinci El
    const [keyword, setKeyword] = useState('');

    // Filter Visibility State
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Applied Filters
    // Table sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const [appliedFilters, setAppliedFilters] = useState({
        selectedCity: '',
        selectedDistrict: '',
        selectedNeighborhood: '',
        subCategory: '',
        priceRange: { min: '', max: '' },
        condition: '',
        keyword: ''
    });

    const handleApplyFilters = () => {
        setAppliedFilters({
            selectedCity,
            selectedDistrict,
            selectedNeighborhood,
            subCategory,
            priceRange,
            condition,
            keyword
        });
        setShowMobileFilters(false);
    };

    const [listings, setListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(false);

    const sortedListings = React.useMemo(() => {
        if (!sortConfig.key) return listings;
        return [...listings].sort((a, b) => {
            let aVal, bVal;
            switch (sortConfig.key) {
                case 'price':
                    aVal = a.price || 0;
                    bVal = b.price || 0;
                    break;
                case 'date':
                    aVal = new Date(a.created_at).getTime();
                    bVal = new Date(b.created_at).getTime();
                    break;
                default:
                    return 0;
            }
            if (sortConfig.direction === 'asc') {
                return aVal - bVal;
            }
            return bVal - aVal;
        });
    }, [listings, sortConfig]);

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (selectedCity) fetchDistricts(selectedCity);
        else { setDistricts([]); setNeighborhoods([]); }
        setSelectedDistrict(''); setSelectedNeighborhood('');
    }, [selectedCity]);

    useEffect(() => {
        if (selectedDistrict) fetchNeighborhoods(selectedDistrict);
        else setNeighborhoods([]);
        setSelectedNeighborhood('');
    }, [selectedDistrict]);

    useEffect(() => {
        fetchListings();
    }, [appliedFilters]);

    const fetchCities = async () => {
        const { data } = await supabase.from('cities').select('*').order('name');
        setCities(data || []);
    };

    const fetchDistricts = async (cityId) => {
        const { data } = await supabase.from('districts').select('*').eq('city_id', cityId).order('name');
        setDistricts(data || []);
    };

    const fetchNeighborhoods = async (districtId) => {
        const { data } = await supabase.from('neighborhoods').select('*').eq('district_id', districtId).order('name');
        setNeighborhoods(data || []);
    };

    const fetchListings = async () => {
        setLoadingListings(true);
        try {
            let query = supabase
                .from('listings')
                .select('*')
                .eq('status', 'approved')
                .eq('category', 'ev-esyalari')
                .order('created_at', { ascending: false });

            if (appliedFilters.selectedCity) query = query.eq('city_id', appliedFilters.selectedCity);
            if (appliedFilters.selectedDistrict) query = query.eq('district_id', appliedFilters.selectedDistrict);
            if (appliedFilters.priceRange.min) query = query.gte('price', appliedFilters.priceRange.min);
            if (appliedFilters.priceRange.max) query = query.lte('price', appliedFilters.priceRange.max);

            // Keyword Search
            if (appliedFilters.keyword) {
                query = query.ilike('title', `%${appliedFilters.keyword}%`);
            }

            // JSONB Filters
            if (appliedFilters.subCategory) query = query.contains('details', { subCategory: appliedFilters.subCategory });
            if (appliedFilters.condition) query = query.contains('details', { condition: appliedFilters.condition });

            const { data: listingsData, error } = await query;
            if (error) throw error;

            if (!listingsData?.length) {
                setListings([]);
                return;
            }

            // Fetch Locations
            const cityIds = [...new Set(listingsData.map(l => l.city_id).filter(Boolean))];
            const districtIds = [...new Set(listingsData.map(l => l.district_id).filter(Boolean))];

            let citiesMap = {}, districtsMap = {};

            if (cityIds.length) {
                const { data: cData } = await supabase.from('cities').select('id, name').in('id', cityIds);
                cData?.forEach(c => citiesMap[c.id] = c.name);
            }
            if (districtIds.length) {
                const { data: dData } = await supabase.from('districts').select('id, name').in('id', districtIds);
                dData?.forEach(d => districtsMap[d.id] = d.name);
            }

            setListings(listingsData.map(l => ({
                ...l,
                cities: { name: citiesMap[l.city_id] || '' },
                districts: { name: districtsMap[l.district_id] || '' }
            })));

        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoadingListings(false);
        }
    };

    const FilterSection = ({ title, children, isOpen = true }) => {
        const [show, setShow] = useState(isOpen);
        return (
            <div className="border-b border-gray-100 py-4 last:border-0">
                <button onClick={() => setShow(!show)} className="flex items-center justify-between w-full mb-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {title}
                    {show ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {show && <div className="mt-2 space-y-2">{children}</div>}
            </div>
        );
    };

    const subCategories = ['Mobilya', 'Beyaz Eşya', 'Elektrikli Ev Aletleri', 'Ev Tekstili', 'Dekorasyon', 'Aydınlatma', 'Mutfak Gereçleri', 'Diğer'];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

                {/* Sidebar */}
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
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setSubCategory('');
                                setPriceRange({ min: '', max: '' });
                                setCondition('');
                                setKeyword('');
                                setSelectedCity('');
                                setSelectedDistrict('');
                                setAppliedFilters({
                                    selectedCity: '',
                                    selectedDistrict: '',
                                    selectedNeighborhood: '',
                                    subCategory: '',
                                    priceRange: { min: '', max: '' },
                                    condition: '',
                                    keyword: ''
                                });
                            }} className="text-xs text-blue-600 hover:underline font-medium">Temizle</button>
                        </div>

                        <div className={`p-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                            {/* Keyword */}
                            <FilterSection title="Kelime ile Filtrele">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Aradığınız kelime..."
                                        className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-9"
                                        value={keyword}
                                        onChange={e => setKeyword(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                </div>
                            </FilterSection>

                            {/* Location */}
                            <FilterSection title="Adres">
                                <div className="space-y-2.5">
                                    <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none">
                                        <option value="">İl Seçin</option>
                                        {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} disabled={!selectedCity} className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none disabled:bg-gray-50">
                                        <option value="">İlçe Seçin</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </FilterSection>

                            {/* Categories */}
                            <FilterSection title="Kategori">
                                <div className="space-y-2">
                                    {subCategories.map(s => (
                                        <label key={s} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="radio"
                                                name="subCategory"
                                                checked={subCategory === s}
                                                onChange={() => setSubCategory(s)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                            />
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Price */}
                            <FilterSection title="Fiyat (TL)">
                                <div className="flex gap-2">
                                    <input type="number" placeholder="Min" value={priceRange.min} onChange={e => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none" />
                                    <input type="number" placeholder="Max" value={priceRange.max} onChange={e => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none" />
                                </div>
                            </FilterSection>

                            {/* Condition */}
                            <FilterSection title="Durum" isOpen={false}>
                                <div className="space-y-2">
                                    {['Sıfır', 'İkinci El'].map(s => (
                                        <label key={s} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input type="radio" name="condition" checked={condition === s} onChange={() => setCondition(s)} className="w-4 h-4 text-blue-600" />
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            <button onClick={handleApplyFilters} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                                <Search size={18} />
                                Sonuçları Göster
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Ev Eşyaları İlanları</h1>
                            <p className="text-sm text-gray-500 mt-1">Arama kriterlerinize uygun ilanlar listeleniyor</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto lg:hidden">
                            <select className="w-full sm:w-48 p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                <option>Sıralama: Önerilen</option>
                                <option>Fiyat: Artan</option>
                                <option>Fiyat: Azalan</option>
                                <option>Tarih: En Yeni</option>
                                <option>Tarih: En Eski</option>
                            </select>
                        </div>
                    </div>

                    {/* Listings Table */}
                    {loadingListings ? (
                        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                    ) : listings.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {/* Table Header - Desktop Only */}
                            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600">
                                <div className="col-span-1">Foto</div>
                                <div className="col-span-3 pl-4">İlan Başlığı</div>
                                <div className="col-span-2 text-center">Kategori</div>
                                <div className="col-span-2 text-center">Durum</div>
                                <div className="col-span-2 text-center cursor-pointer hover:text-blue-600 flex items-center justify-center gap-1" onClick={() => handleSort('price')}>
                                    Fiyat <ArrowUpDown size={14} className={sortConfig.key === 'price' ? 'text-blue-600' : ''} />
                                </div>
                                <div className="col-span-2 text-center cursor-pointer hover:text-blue-600 flex items-center justify-center gap-1" onClick={() => handleSort('date')}>
                                    Tarih <ArrowUpDown size={14} className={sortConfig.key === 'date' ? 'text-blue-600' : ''} />
                                </div>
                            </div>
                            {/* Listing Rows */}
                            {sortedListings.map(listing => (
                                <a key={listing.id} href={`/ilan/${listing.id}`} className="block group">
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition">
                                        {/* Desktop View */}
                                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center px-4 py-3">
                                            <div className="col-span-1">
                                                <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100">
                                                    <img
                                                        src={listing.images?.[0] || 'https://placehold.co/100x75?text=Yok'}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-3 pl-4">
                                                <h3 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition">{listing.title}</h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <MapPin size={10} />
                                                    <span>{listing.cities?.name}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center text-sm text-gray-700">{listing.details?.subCategory || '-'}</div>
                                            <div className="col-span-2 text-center text-sm text-gray-700">{listing.details?.condition || '-'}</div>
                                            <div className="col-span-2 text-center font-bold text-blue-600">{new Intl.NumberFormat('tr-TR').format(listing.price)} {listing.currency}</div>
                                            <div className="col-span-2 text-center text-xs text-gray-400">{new Date(listing.created_at).toLocaleDateString('tr-TR')}</div>
                                        </div>
                                        {/* Mobile View */}
                                        <div className="lg:hidden flex gap-3 p-3">
                                            <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={listing.images?.[0] || 'https://placehold.co/100x75?text=Yok'} alt={listing.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{listing.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <span>{listing.details?.subCategory}</span>
                                                    {listing.details?.condition && <><span>•</span><span>{listing.details?.condition}</span></>}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="font-bold text-blue-600">{new Intl.NumberFormat('tr-TR').format(listing.price)} {listing.currency}</span>
                                                    <span className="text-xs text-gray-400">{new Date(listing.created_at).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-200 min-h-[400px] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <Armchair className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Seçtiğiniz kriterlere uygun ilan bulunamadı. Filtreleri değiştirerek tekrar deneyebilir veya yeni bir arama yapabilirsiniz.
                            </p>
                            <button
                                onClick={() => {
                                    setSubCategory('');
                                    setPriceRange({ min: '', max: '' });
                                    setCondition('');
                                    setKeyword('');
                                    setSelectedCity('');
                                    setSelectedDistrict('');
                                    setAppliedFilters({
                                        selectedCity: '',
                                        selectedDistrict: '',
                                        selectedNeighborhood: '',
                                        subCategory: '',
                                        priceRange: { min: '', max: '' },
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

export default EvEsyalari;
