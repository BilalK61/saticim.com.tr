import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Footer from '../../components/Footer';
import { Search, Home, MapPin, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const Emlak = () => {
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
    const [roomCount, setRoomCount] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sizeRange, setSizeRange] = useState({ min: '', max: '' });
    const [buildingAge, setBuildingAge] = useState('');
    const [heating, setHeating] = useState('');
    const [floor, setFloor] = useState('');
    const [bathroomCount, setBathroomCount] = useState('');
    const [furnished, setFurnished] = useState(false);
    const [balcony, setBalcony] = useState(false);
    const [fromSite, setFromSite] = useState(false);
    const [credit, setCredit] = useState('');
    const [swap, setSwap] = useState('');
    const [zoning, setZoning] = useState('');
    const [keyword, setKeyword] = useState('');

    // Filter Visibility State
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Applied Filters (Triggered by button)
    const [appliedFilters, setAppliedFilters] = useState({
        selectedCity: '',
        selectedDistrict: '',
        selectedNeighborhood: '',
        category: '',
        subCategory: '',
        roomCount: '',
        priceRange: { min: '', max: '' },
        sizeRange: { min: '', max: '' },
        buildingAge: '',
        heating: '',
        floor: '',
        bathroomCount: '',
        furnished: false,
        balcony: false,
        fromSite: false,
        credit: '',
        swap: '',
        zoning: '',
        keyword: ''
    });

    const handleApplyFilters = () => {
        setAppliedFilters({
            selectedCity,
            selectedDistrict,
            selectedNeighborhood,
            category,
            subCategory,
            roomCount,
            priceRange,
            sizeRange,
            buildingAge,
            heating,
            floor,
            bathroomCount,
            furnished,
            balcony,
            fromSite,
            credit,
            swap,
            zoning,
            keyword
        });
        setShowMobileFilters(false); // Close mobile filters after applying
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

    const categories = [
        { id: 'konut', name: 'Konut' },
        { id: 'isyeri', name: 'İş Yeri' },
        { id: 'arsa', name: 'Arsa' },
        { id: 'devremulk', name: 'Devremülk' },
        { id: 'turistik', name: 'Turistik Tesis' }
    ];

    const subCategories = {
        'konut': ['Daire', 'Residence', 'Müstakil Ev', 'Villa', 'Çiftlik Evi', 'Yalı', 'Yazlık'],
        'isyeri': ['Dükkan & Mağaza', 'Ofis & Büro', 'Depo & Antrepo', 'Fabrika', 'Plaza Katı'],
        'arsa': ['Satılık Arsa', 'Kiralık Arsa'],
        // ... extend as needed
    };

    const roomCounts = ['1+0', '1+1', '2+0', '2+1', '2+2', '3+1', '3+2', '4+1', '4+2', '5+1', '5+2', '6+ A üzeri'];
    const ages = ['0', '1', '2', '3', '4', '5-10', '11-15', '16-20', '21 ve üzeri'];
    const heatings = ['Kombi (Doğalgaz)', 'Merkezi', 'Merkezi (Pay Ölçer)', 'Yerden Isıtma', 'Klima', 'Soba', 'Yok'];
    const bathroomCounts = ['1', '2', '3', '4', '5', '6+ Üzeri'];
    const zoningTypes = ['Konut', 'Ticari', 'Bağ-Bahçe', 'Tarla', 'Sanayi', 'Zeytinlik', 'Sit Alanı', 'Diğer'];

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
            // 1. Base Query (sadece onaylı ilanlar)
            let query = supabase
                .from('listings')
                .select('*')
                .eq('status', 'approved')
                .eq('category', 'emlak')
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
            if (appliedFilters.roomCount) {
                query = query.contains('details', { room: appliedFilters.roomCount });
            }
            if (appliedFilters.subCategory) {
                query = query.contains('details', { type: appliedFilters.subCategory });
            }
            if (appliedFilters.bathroomCount) query = query.contains('details', { bathroom: appliedFilters.bathroomCount });
            if (appliedFilters.furnished) query = query.contains('details', { furnished: true });
            if (appliedFilters.balcony) query = query.contains('details', { balcony: true });
            if (appliedFilters.fromSite) query = query.contains('details', { fromSite: true });
            if (appliedFilters.zoning) query = query.contains('details', { zoning: appliedFilters.zoning });

            // Boolean/String checks (assuming these are stored as 'Var'/'Yok' or boolean in details)
            if (appliedFilters.credit === 'true') query = query.eq('credit', true);
            if (appliedFilters.swap === 'true') query = query.eq('swap', true);

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
                        <div
                            className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer lg:cursor-default"
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                        >
                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                <SlidersHorizontal size={20} className="text-blue-600" />
                                <span>Detaylı Filtre</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCategory('');
                                        setSubCategory('');
                                        setRoomCount('');
                                        setPriceRange({ min: '', max: '' });
                                        setSizeRange({ min: '', max: '' });
                                        setBuildingAge('');
                                        setHeating('');
                                        setFloor('');
                                        setKeyword('');
                                        setSelectedCity('');
                                        setSelectedDistrict('');
                                        setSelectedNeighborhood('');
                                        setBathroomCount('');
                                        setFurnished(false);
                                        setBalcony(false);
                                        setFromSite(false);
                                        setCredit('');
                                        setSwap('');
                                        setZoning('');
                                        setAppliedFilters({
                                            selectedCity: '',
                                            selectedDistrict: '',
                                            selectedNeighborhood: '',
                                            category: '',
                                            subCategory: '',
                                            roomCount: '',
                                            priceRange: { min: '', max: '' },
                                            sizeRange: { min: '', max: '' },
                                            buildingAge: '',
                                            heating: '',
                                            floor: '',
                                            bathroomCount: '',
                                            furnished: false,
                                            balcony: false,
                                            fromSite: false,
                                            credit: '',
                                            swap: '',
                                            zoning: '',
                                            keyword: ''
                                        });
                                    }}
                                    className="text-xs text-blue-600 hover:underline font-medium"
                                >
                                    Temizle
                                </button>
                                <div className="lg:hidden text-gray-500">
                                    {showMobileFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
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
                            <FilterSection title="Emlak Tipi">
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
                                        <option value="">Tip Seçin</option>
                                        {category && subCategories[category] && subCategories[category].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
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

                            {/* Size (m2) */}
                            <FilterSection title="Metrekare (m²)">
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={sizeRange.min}
                                        onChange={e => setSizeRange({ ...sizeRange, min: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={sizeRange.max}
                                        onChange={e => setSizeRange({ ...sizeRange, max: e.target.value })}
                                    />
                                </div>
                            </FilterSection>

                            {/* Residential Specific Filters */}
                            {category !== 'arsa' && (
                                <>
                                    {/* Room Count */}
                                    <FilterSection title="Oda Sayısı">
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {roomCounts.map(rc => (
                                                <label key={rc} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={roomCount === rc} // Example logic, normally multi-select
                                                        onChange={() => setRoomCount(rc)}
                                                    />
                                                    {rc}
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    {/* Building Age */}
                                    <FilterSection title="Bina Yaşı" isOpen={false}>
                                        <div className="space-y-2">
                                            {ages.map(age => (
                                                <label key={age} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    {age}
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    {/* Floor */}
                                    <FilterSection title="Bulunduğu Kat" isOpen={false}>
                                        <select
                                            className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={floor}
                                            onChange={(e) => setFloor(e.target.value)}
                                        >
                                            <option value="">Seçiniz</option>
                                            <option value="Bahçe Katı">Bahçe Katı</option>
                                            <option value="Giriş Katı">Giriş Katı</option>
                                            <option value="Yüksek Giriş">Yüksek Giriş</option>
                                            <option value="Müstakil">Müstakil</option>
                                            {[...Array(30).keys()].map(i => <option key={i + 1} value={i + 1}>{i + 1}. Kat</option>)}
                                            <option value="Kot 1">Kot 1</option>
                                            <option value="Kot 2">Kot 2</option>
                                        </select>
                                    </FilterSection>

                                    {/* Heating */}
                                    <FilterSection title="Isıtma" isOpen={false}>
                                        <div className="space-y-2">
                                            {heatings.map(h => (
                                                <label key={h} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    {h}
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    {/* Bathroom Count */}
                                    <FilterSection title="Banyo Sayısı" isOpen={false}>
                                        <div className="space-y-2">
                                            {bathroomCounts.map(bc => (
                                                <label key={bc} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                    <input
                                                        type="radio"
                                                        name="bathroom"
                                                        className="w-4 h-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={bathroomCount === bc}
                                                        onChange={() => setBathroomCount(bc)}
                                                    />
                                                    {bc}
                                                </label>
                                            ))}
                                        </div>
                                    </FilterSection>

                                    {/* Additional Boolean Filters */}
                                    <FilterSection title="Diğer Özellikler" isOpen={false}>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={furnished}
                                                    onChange={(e) => setFurnished(e.target.checked)}
                                                />
                                                Eşyalı
                                            </label>
                                            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={balcony}
                                                    onChange={(e) => setBalcony(e.target.checked)}
                                                />
                                                Balkon
                                            </label>
                                            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={fromSite}
                                                    onChange={(e) => setFromSite(e.target.checked)}
                                                />
                                                Site İçerisinde
                                            </label>
                                        </div>
                                    </FilterSection>
                                </>
                            )}

                            {/* Land Specific Filters */}
                            {category === 'arsa' && (
                                <FilterSection title="İmar Durumu">
                                    <div className="space-y-2">
                                        {zoningTypes.map(z => (
                                            <label key={z} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                                <input
                                                    type="radio"
                                                    name="zoning"
                                                    className="w-4 h-4 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={zoning === z}
                                                    onChange={() => setZoning(z)}
                                                />
                                                {z}
                                            </label>
                                        ))}
                                    </div>
                                </FilterSection>
                            )}

                            {/* General Additional Filters */}
                            <FilterSection title="Kredi & Takas" isOpen={false}>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={credit === 'true'}
                                            onChange={(e) => setCredit(e.target.checked ? 'true' : '')}
                                        />
                                        Krediye Uygun
                                    </label>
                                    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={swap === 'true'}
                                            onChange={(e) => setSwap(e.target.checked ? 'true' : '')}
                                        />
                                        Takaslı
                                    </label>
                                </div>
                            </FilterSection>

                            {/* From Whom */}
                            <FilterSection title="Kimden" isOpen={false}>
                                <div className="space-y-2">
                                    {['Sahibinden', 'Emlak Ofisinden', 'İnşaat Firmasından', 'Bankadan'].map(from => (
                                        <label key={from} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            {from}
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
                                {appliedFilters.category ? categories.find(c => c.id === appliedFilters.category)?.name : 'Tüm Emlak İlanları'}
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
                                <a key={listing.id} href={`/ilan/${listing.id}`} className="block group">
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
                                            {listing.details?.type && (
                                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                                    {listing.details.type}
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
                                                <span>{listing.details?.room}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{listing.details?.size} m²</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{listing.details?.floor}</span>
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
                                <Home className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Seçtiğiniz kriterlere uygun ilan bulunamadı. Filtreleri değiştirerek tekrar deneyebilir veya yeni bir arama yapabilirsiniz.
                            </p>
                            <button
                                onClick={() => {
                                    setCategory('');
                                    setSubCategory('');
                                    setRoomCount('');
                                    setPriceRange({ min: '', max: '' });
                                    setSizeRange({ min: '', max: '' });
                                    setBuildingAge('');
                                    setHeating('');
                                    setFloor('');
                                    setBathroomCount('');
                                    setFurnished(false);
                                    setBalcony(false);
                                    setFromSite(false);
                                    setCredit('');
                                    setSwap('');
                                    setZoning('');
                                    setSelectedCity('');
                                    setSelectedDistrict('');
                                    setAppliedFilters({
                                        selectedCity: '',
                                        selectedDistrict: '',
                                        selectedNeighborhood: '',
                                        category: '',
                                        subCategory: '',
                                        roomCount: '',
                                        priceRange: { min: '', max: '' },
                                        sizeRange: { min: '', max: '' },
                                        buildingAge: '',
                                        heating: '',
                                        floor: '',
                                        bathroomCount: '',
                                        furnished: false,
                                        balcony: false,
                                        fromSite: false,
                                        credit: '',
                                        swap: '',
                                        zoning: '',
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
}

export default Emlak;
