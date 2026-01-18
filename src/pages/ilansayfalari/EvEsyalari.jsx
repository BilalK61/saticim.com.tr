import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Footer from '../../components/Footer';
import { Search, Filter, Home, MapPin, ChevronDown, ChevronUp, SlidersHorizontal, Armchair } from 'lucide-react';

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

                    {loadingListings ? (
                        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                    ) : listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map(listing => (
                                <a key={listing.id} href={`/ilan-detay/${listing.id}`} className="block group">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                            <img
                                                src={listing.images?.[0] || 'https://placehold.co/400x300?text=Resim+Yok'}
                                                alt={listing.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <MapPin size={12} />
                                                {listing.cities?.name} / {listing.districts?.name}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition mb-2">{listing.title}</h3>
                                            <div className="text-xl font-bold text-blue-600 mb-3">{new Intl.NumberFormat('tr-TR').format(listing.price)} {listing.currency}</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span>{listing.details?.subCategory}</span>
                                                {listing.details?.condition && <><span className="w-1 h-1 bg-gray-300 rounded-full"></span><span>{listing.details?.condition}</span></>}
                                            </div>
                                            <div className="text-xs text-gray-400 text-right mt-2">{new Date(listing.created_at).toLocaleDateString('tr-TR')}</div>
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
