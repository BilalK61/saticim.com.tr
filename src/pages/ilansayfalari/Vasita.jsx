import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import Footer from '../../components/Footer';
import { Search, Filter, Car, MapPin, ChevronDown, ChevronUp, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const Vasita = () => {
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [packages, setPackages] = useState([]);
    const [listings, setListings] = useState([]); // Replaces filteredListings
    const [loadingListings, setLoadingListings] = useState(false);

    // Location States
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

    // Filter States
    // Filter States
    const [selectedMake, setSelectedMake] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedPackage, setSelectedPackage] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [yearRange, setYearRange] = useState({ min: '', max: '' });
    const [kmRange, setKmRange] = useState({ min: '', max: '' });

    // Extended Filter States
    const [vehicleStatus, setVehicleStatus] = useState('');
    const [gear, setGear] = useState([]);
    const [fuel, setFuel] = useState([]);
    const [bodyType, setBodyType] = useState([]);
    const [enginePower, setEnginePower] = useState({ min: '', max: '' });
    const [engineVolume, setEngineVolume] = useState({ min: '', max: '' });
    const [traction, setTraction] = useState('');
    const [color, setColor] = useState([]);
    const [warranty, setWarranty] = useState(''); // Garanti
    const [heavyDamage, setHeavyDamage] = useState(''); // Ağır Hasar
    const [plate, setPlate] = useState(''); // Plaka / Uyruk
    const [fromWhom, setFromWhom] = useState([]); // Kimden
    const [exchange, setExchange] = useState(''); // Takaslı
    const [hasPhoto, setHasPhoto] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);
    const [keyword, setKeyword] = useState('');

    // Filter Visibility State
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Applied Filters (Triggered by button)
    // Table sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const sortedListings = React.useMemo(() => {
        if (!sortConfig.key) return listings;
        return [...listings].sort((a, b) => {
            let aVal, bVal;
            switch (sortConfig.key) {
                case 'year':
                    aVal = a.details?.year || 0;
                    bVal = b.details?.year || 0;
                    break;
                case 'km':
                    aVal = a.details?.km || 0;
                    bVal = b.details?.km || 0;
                    break;
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

    const [appliedFilters, setAppliedFilters] = useState({
        selectedCity: '',
        selectedDistrict: '',
        selectedNeighborhood: '',
        selectedMake: '',
        selectedModel: '',
        selectedPackage: '',
        priceRange: { min: '', max: '' },
        yearRange: { min: '', max: '' },
        kmRange: { min: '', max: '' },
        vehicleStatus: '',
        gear: [],
        fuel: [],
        bodyType: [],
        enginePower: { min: '', max: '' },
        engineVolume: { min: '', max: '' },
        traction: '',
        color: [],
        warranty: '',
        heavyDamage: '',
        plate: '',
        fromWhom: [],
        exchange: '',
        hasPhoto: false,
        hasVideo: false,
        keyword: ''
    });

    const handleApplyFilters = () => {
        setAppliedFilters({
            selectedCity,
            selectedDistrict,
            selectedNeighborhood,
            selectedMake,
            selectedModel,
            selectedPackage,
            priceRange,
            yearRange,
            kmRange,
            vehicleStatus,
            gear,
            fuel,
            bodyType,
            enginePower,
            engineVolume,
            traction,
            color,
            warranty,
            heavyDamage,
            plate,
            fromWhom,
            exchange,
            hasPhoto,
            hasVideo,
            keyword
        });
        setShowMobileFilters(false); // Close mobile filters after applying
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMakes();
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

    useEffect(() => {
        if (selectedMake) {
            fetchModels(selectedMake);
        } else {
            setModels([]);
            setPackages([]);
        }
        setSelectedModel('');
        setSelectedPackage('');
    }, [selectedMake]);

    useEffect(() => {
        if (selectedModel) {
            fetchPackages(selectedModel);
        } else {
            setPackages([]);
        }
        setSelectedPackage('');
    }, [selectedModel]);

    // Fetch listings when filters change
    useEffect(() => {
        fetchListings();
    }, [appliedFilters]);

    const fetchMakes = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicle_makes')
                .select('*')
                .order('name');

            if (error) throw error;
            setMakes(data);
        } catch (error) {
            console.error('Markalar çekilirken hata:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchModels = async (makeId) => {
        try {
            const { data, error } = await supabase
                .from('vehicle_models')
                .select('*')
                .eq('make_id', makeId)
                .order('name');

            if (error) throw error;
            setModels(data);
        } catch (error) {
            console.error('Modeller çekilirken hata:', error.message);
        }
    };

    const fetchPackages = async (modelId) => {
        try {
            const { data, error } = await supabase
                .from('vehicle_packages')
                .select('*')
                .eq('model_id', modelId)
                .order('name');

            if (error) throw error;
            setPackages(data);
        } catch (error) {
            console.error('Paketler çekilirken hata:', error.message);
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
                .eq('category', 'vasita')
                .order('created_at', { ascending: false });

            // Apply Filters (Core)
            if (appliedFilters.selectedCity) query = query.eq('city_id', appliedFilters.selectedCity);
            if (appliedFilters.selectedDistrict) query = query.eq('district_id', appliedFilters.selectedDistrict);
            if (appliedFilters.priceRange.min) query = query.gte('price', appliedFilters.priceRange.min);
            if (appliedFilters.priceRange.max) query = query.lte('price', appliedFilters.priceRange.max);

            // Keyword Search
            if (appliedFilters.keyword) {
                query = query.ilike('title', `%${appliedFilters.keyword}%`);
            }

            // --- JSONB Column Filters (details) ---
            // Make/Model/Package (Assuming these are stored in details or as IDs, matching current state)
            // Note: If your schema puts make_id on the top level, use .eq('make_id', ...)
            // The original code passed 'vehicle_makes' ID but didn't filter by it in fetchListings originally?
            // Actually, original code didn't have make filter implementation inside fetchListings logic visible in lines 201-215! 
            // It only filtered by city/price. I will Fix that now.
            if (appliedFilters.selectedMake) query = query.eq('details->>make_id', appliedFilters.selectedMake);
            if (appliedFilters.selectedModel) query = query.eq('details->>model_id', appliedFilters.selectedModel);
            if (appliedFilters.selectedPackage) query = query.eq('details->>package_id', appliedFilters.selectedPackage);

            // Ranges
            if (appliedFilters.yearRange.min) query = query.filter('details->>year', 'gte', appliedFilters.yearRange.min);
            if (appliedFilters.yearRange.max) query = query.filter('details->>year', 'lte', appliedFilters.yearRange.max);

            if (appliedFilters.kmRange.min) query = query.filter('details->>km', 'gte', appliedFilters.kmRange.min);
            if (appliedFilters.kmRange.max) query = query.filter('details->>km', 'lte', appliedFilters.kmRange.max);

            if (appliedFilters.enginePower.min) query = query.filter('details->>enginePower', 'gte', appliedFilters.enginePower.min);
            if (appliedFilters.enginePower.max) query = query.filter('details->>enginePower', 'lte', appliedFilters.enginePower.max);

            if (appliedFilters.engineVolume.min) query = query.filter('details->>engineVolume', 'gte', appliedFilters.engineVolume.min);
            if (appliedFilters.engineVolume.max) query = query.filter('details->>engineVolume', 'lte', appliedFilters.engineVolume.max);

            // Single Selects (Exact match)
            if (appliedFilters.vehicleStatus) query = query.eq('details->>vehicleStatus', appliedFilters.vehicleStatus);
            if (appliedFilters.traction) query = query.eq('details->>traction', appliedFilters.traction);
            if (appliedFilters.warranty) query = query.eq('details->>warranty', appliedFilters.warranty);
            if (appliedFilters.heavyDamage) query = query.eq('details->>heavyDamage', appliedFilters.heavyDamage);
            if (appliedFilters.plate) query = query.eq('details->>plate', appliedFilters.plate);
            if (appliedFilters.exchange) query = query.eq('details->>exchange', appliedFilters.exchange);

            // Multi Selects (IN operator)
            if (appliedFilters.gear.length > 0) query = query.filter('details->>gear', 'in', `(${appliedFilters.gear.map(g => `"${g}"`).join(',')})`);
            // Note: Supabase .in() expects array. .filter(col, 'in', '(...)') is for PostgREST syntax.
            // Using .in('details->>gear', appliedFilters.gear) is cleaner if supported.
            // Let's use the safer .in() which works on columns. For JSON accessor, it should work too.
            if (appliedFilters.gear.length > 0) query = query.in('details->>gear', appliedFilters.gear);
            if (appliedFilters.fuel.length > 0) query = query.in('details->>fuel', appliedFilters.fuel);
            if (appliedFilters.bodyType.length > 0) query = query.in('details->>bodyType', appliedFilters.bodyType);
            if (appliedFilters.color.length > 0) query = query.in('details->>color', appliedFilters.color);
            if (appliedFilters.fromWhom.length > 0) query = query.in('details->>fromWhom', appliedFilters.fromWhom);

            const { data: listingsData, error: listingsError } = await query;

            if (listingsError) throw listingsError;

            let finalData = listingsData || [];

            // In-memory filter for Photo logic (if not supported by simpler query)
            if (appliedFilters.hasPhoto) {
                finalData = finalData.filter(l => l.images && l.images.length > 0);
            }
            // Video (assuming no field yet, skip or implement if field exists)

            if (finalData.length === 0) {
                setListings([]);
                return;
            }

            // 2. Fetch Location Details (Two-step fetch to avoid join errors)
            const cityIds = [...new Set(finalData.map(l => l.city_id).filter(Boolean))];
            const districtIds = [...new Set(finalData.map(l => l.district_id).filter(Boolean))];

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
            const mergedListings = finalData.map(listing => ({
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
                                        setAppliedFilters({
                                            selectedCity: '',
                                            selectedDistrict: '',
                                            selectedNeighborhood: '',
                                            selectedMake: '',
                                            selectedModel: '',
                                            selectedPackage: '',
                                            priceRange: { min: '', max: '' },
                                            yearRange: { min: '', max: '' },
                                            kmRange: { min: '', max: '' },
                                            vehicleStatus: '',
                                            gear: [],
                                            fuel: [],
                                            bodyType: [],
                                            enginePower: { min: '', max: '' },
                                            engineVolume: { min: '', max: '' },
                                            traction: '',
                                            color: [],
                                            warranty: '',
                                            heavyDamage: '',
                                            plate: '',
                                            fromWhom: [],
                                            exchange: '',
                                            hasPhoto: false,
                                            hasVideo: false,
                                            keyword: ''
                                        });
                                        // Reset local states too
                                        setSelectedMake('');
                                        setSelectedModel('');
                                        setSelectedPackage('');
                                        setPriceRange({ min: '', max: '' });
                                        setYearRange({ min: '', max: '' });
                                        setKmRange({ min: '', max: '' });
                                        setSelectedCity('');
                                        setSelectedDistrict('');
                                        setVehicleStatus('');
                                        setGear([]);
                                        setFuel([]);
                                        setBodyType([]);
                                        setEnginePower({ min: '', max: '' });
                                        setEngineVolume({ min: '', max: '' });
                                        setTraction('');
                                        setColor([]);
                                        setWarranty('');
                                        setHeavyDamage('');
                                        setPlate('');
                                        setFromWhom([]);
                                        setExchange('');
                                        setHasPhoto(false);
                                        setHasVideo(false);
                                        setKeyword('');
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
                            {/* Location (First, as requested by image usually top, but image shows after keywords?)
                                Image shows: Keywords (at bottom actually), Location/Address at top usually or separate.
                                The user's specific request "vasıta sayfasına bu filtreleri ekle" and image shows a list.
                                Let's follow standard hierarchical order: Address -> Category -> Specs.
                            */}
                            {/* Kelime ile Filtrele - Bottom */}
                            <FilterSection title="Kelime ile Filtrele">
                                <div className="space-y-2.5">
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
                                </div>
                            </FilterSection>
                            <FilterSection title="Adres" isOpen={false}>
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

                            {/* Category Drilldown (Marka/Model) */}
                            <FilterSection title="Vasıta">
                                <div className="space-y-2.5">
                                    <select
                                        value={selectedMake}
                                        onChange={(e) => setSelectedMake(e.target.value)}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Marka Seçin</option>
                                        {makes.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>

                                    <select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        disabled={!selectedMake}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">Model Seçin</option>
                                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                    </select>

                                    <select
                                        value={selectedPackage}
                                        onChange={(e) => setSelectedPackage(e.target.value)}
                                        disabled={!selectedModel}
                                        className="w-full p-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        <option value="">Paket Seçin</option>
                                        {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </FilterSection>

                            {/* Fiyat */}
                            <FilterSection title="Fiyat (TL)" isOpen={false}>
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

                            {/* Yıl */}
                            <FilterSection title="Yıl" isOpen={false}>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={yearRange.min}
                                        onChange={e => setYearRange({ ...yearRange, min: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={yearRange.max}
                                        onChange={e => setYearRange({ ...yearRange, max: e.target.value })}
                                    />
                                </div>
                            </FilterSection>

                            {/* Yakıt Tipi */}
                            <FilterSection title="Yakıt Tipi" isOpen={false}>
                                <div className="space-y-2">
                                    {['Benzin', 'Benzin & LPG', 'Dizel', 'Elektrik', 'Hibrit'].map(f => (
                                        <label key={f} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={fuel.includes(f)}
                                                onChange={() => setFuel(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                                            />
                                            {f}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Vites */}
                            <FilterSection title="Vites" isOpen={false}>
                                <div className="space-y-2">
                                    {['Manuel', 'Otomatik', 'Yarı Otomatik'].map(g => (
                                        <label key={g} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={gear.includes(g)}
                                                onChange={() => setGear(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                                            />
                                            {g}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Araç Durumu */}
                            <FilterSection title="Araç Durumu" isOpen={false}>
                                <div className="space-y-2">
                                    {['Sıfır', 'İkinci El'].map(s => (
                                        <label key={s} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="radio"
                                                name="vehicleStatus"
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={vehicleStatus === s}
                                                onChange={() => setVehicleStatus(s)}
                                            />
                                            {s}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* KM */}
                            <FilterSection title="KM" isOpen={false}>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={kmRange.min}
                                        onChange={e => setKmRange({ ...kmRange, min: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={kmRange.max}
                                        onChange={e => setKmRange({ ...kmRange, max: e.target.value })}
                                    />
                                </div>
                            </FilterSection>

                            {/* Kasa Tipi */}
                            <FilterSection title="Kasa Tipi" isOpen={false}>
                                <div className="space-y-2">
                                    {['Sedan', 'Hatchback', 'Station Wagon', 'SUV', 'Cabrio', 'Coupe', 'Minivan', 'Panelvan'].map(b => (
                                        <label key={b} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={bodyType.includes(b)}
                                                onChange={() => setBodyType(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])}
                                            />
                                            {b}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Motor Gücü */}
                            <FilterSection title="Motor Gücü (HP)" isOpen={false}>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={enginePower.min}
                                        onChange={e => setEnginePower({ ...enginePower, min: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={enginePower.max}
                                        onChange={e => setEnginePower({ ...enginePower, max: e.target.value })}
                                    />
                                </div>
                            </FilterSection>

                            {/* Motor Hacmi */}
                            <FilterSection title="Motor Hacmi (CC)" isOpen={false}>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={engineVolume.min}
                                        onChange={e => setEngineVolume({ ...engineVolume, min: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={engineVolume.max}
                                        onChange={e => setEngineVolume({ ...engineVolume, max: e.target.value })}
                                    />
                                </div>
                            </FilterSection>

                            {/* Çekiş */}
                            <FilterSection title="Çekiş" isOpen={false}>
                                <div className="space-y-2">
                                    {['Önden Çekiş', 'Arkadan İtiş', '4WD (Sürekli)', 'AWD (Elektronik)'].map(t => (
                                        <label key={t} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="radio"
                                                name="traction"
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={traction === t}
                                                onChange={() => setTraction(t)}
                                            />
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Renk */}
                            <FilterSection title="Renk" isOpen={false}>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Beyaz', 'Siyah', 'Gri', 'Gümüş Gri', 'Kırmızı', 'Mavi', 'Lacivert', 'Yeşil', 'Sarı', 'Turuncu', 'Kahverengi', 'Bej', 'Füme', 'Şampanya'].map(c => (
                                        <label key={c} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={color.includes(c)}
                                                onChange={() => setColor(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                            />
                                            {c}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Garanti */}
                            <FilterSection title="Garanti" isOpen={false}>
                                <div className="space-y-2">
                                    {['Var', 'Yok'].map(w => (
                                        <label key={w} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="radio"
                                                name="warranty"
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={warranty === w}
                                                onChange={() => setWarranty(w)}
                                            />
                                            {w}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Ağır Hasar Kayıtlı */}
                            <FilterSection title="Ağır Hasar Kayıtlı" isOpen={false}>
                                <div className="space-y-2">
                                    {['Var', 'Yok'].map(h => (
                                        <label key={h} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="radio"
                                                name="heavyDamage"
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={heavyDamage === h}
                                                onChange={() => setHeavyDamage(h)}
                                            />
                                            {h}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Plaka / Uyruk */}
                            <FilterSection title="Plaka / Uyruk" isOpen={false}>
                                <div className="space-y-2">
                                    {['TR Plakalı', 'Yabancı Plakalı (MA-MZ)'].map(p => (
                                        <label key={p} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="radio"
                                                name="plate"
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={plate === p}
                                                onChange={() => setPlate(p)}
                                            />
                                            {p}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Kimden */}
                            <FilterSection title="Kimden" isOpen={false}>
                                <div className="space-y-2">
                                    {['Sahibinden', 'Galeriden', 'Yetkili Bayiden'].map(from => (
                                        <label key={from} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={fromWhom.includes(from)}
                                                onChange={() => setFromWhom(prev => prev.includes(from) ? prev.filter(x => x !== from) : [...prev, from])}
                                            />
                                            {from}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Takaslı */}
                            <FilterSection title="Takaslı" isOpen={false}>
                                <div className="space-y-2">
                                    {['Evet', 'Hayır'].map(e => (
                                        <label key={e} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                            <input
                                                type="radio"
                                                name="exchange"
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                checked={exchange === e}
                                                onChange={() => setExchange(e)}
                                            />
                                            {e}
                                        </label>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* Fotoğraf, Video */}
                            <FilterSection title="Fotoğraf, Video" isOpen={false}>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={hasPhoto}
                                            onChange={(e) => setHasPhoto(e.target.checked)}
                                        />
                                        Fotoğraflı
                                    </label>
                                    <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-blue-600">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={hasVideo}
                                            onChange={(e) => setHasVideo(e.target.checked)}
                                        />
                                        Videolu
                                    </label>
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
                                {appliedFilters.selectedMake ? makes.find(m => m.id == appliedFilters.selectedMake)?.name : 'Tüm Vasıta İlanları'}
                                {selectedModel && (
                                    <>
                                        <span className="text-gray-400">/</span>
                                        <span className="text-blue-600">{models.find(m => m.id == appliedFilters.selectedModel)?.name}</span>
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

                    {/* Listings Table */}
                    {loadingListings ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                    ) : listings.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {/* Table Header - Desktop Only */}
                            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-gray-100 rounded-lg text-sm font-semibold text-gray-600">
                                <div className="col-span-1">Foto</div>
                                <div className="col-span-3 pl-4">İlan Başlığı</div>
                                <div className="col-span-1 text-center cursor-pointer hover:text-blue-600 flex items-center justify-center gap-1" onClick={() => handleSort('year')}>
                                    Yıl <ArrowUpDown size={14} className={sortConfig.key === 'year' ? 'text-blue-600' : ''} />
                                </div>
                                <div className="col-span-2 text-center cursor-pointer hover:text-blue-600 flex items-center justify-center gap-1" onClick={() => handleSort('km')}>
                                    KM <ArrowUpDown size={14} className={sortConfig.key === 'km' ? 'text-blue-600' : ''} />
                                </div>
                                <div className="col-span-1 text-center">Renk</div>
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
                                                        src={listing.images && listing.images[0] ? listing.images[0] : 'https://placehold.co/100x75?text=Yok'}
                                                        alt={listing.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-3 pl-4">
                                                <h3 className="font-semibold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition">
                                                    {listing.title}
                                                </h3>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <MapPin size={10} />
                                                    <span>{listing.cities?.name}</span>
                                                </div>
                                            </div>
                                            <div className="col-span-1 text-center text-sm text-gray-700">
                                                {listing.details?.year || '-'}
                                            </div>
                                            <div className="col-span-2 text-center text-sm text-gray-700">
                                                {listing.details?.km ? new Intl.NumberFormat('tr-TR').format(listing.details.km) : '-'}
                                            </div>
                                            <div className="col-span-1 text-center text-sm text-gray-700">
                                                {listing.details?.color || '-'}
                                            </div>
                                            <div className="col-span-2 text-center font-bold text-blue-600">
                                                {new Intl.NumberFormat('tr-TR').format(listing.price)} {listing.currency}
                                            </div>
                                            <div className="col-span-2 text-center text-xs text-gray-400">
                                                {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                        {/* Mobile View */}
                                        <div className="lg:hidden flex gap-3 p-3">
                                            <div className="w-28 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={listing.images && listing.images[0] ? listing.images[0] : 'https://placehold.co/100x75?text=Yok'}
                                                    alt={listing.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-base line-clamp-1">{listing.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <span>{listing.details?.year}</span>
                                                    <span>•</span>
                                                    <span>{listing.details?.km ? new Intl.NumberFormat('tr-TR').format(listing.details.km) + ' km' : '-'}</span>
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
                                <Car className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">İlan Bulunamadı</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-8">
                                Seçtiğiniz kriterlere uygun ilan bulunamadı. Filtreleri değiştirerek tekrar deneyebilir veya yeni bir arama yapabilirsiniz.
                            </p>
                            <button
                                onClick={() => {
                                    setAppliedFilters({
                                        selectedCity: '',
                                        selectedDistrict: '',
                                        selectedNeighborhood: '',
                                        selectedMake: '',
                                        selectedModel: '',
                                        selectedPackage: '',
                                        priceRange: { min: '', max: '' },
                                        yearRange: { min: '', max: '' },
                                        kmRange: { min: '', max: '' },
                                        vehicleStatus: '',
                                        gear: [],
                                        fuel: [],
                                        bodyType: [],
                                        enginePower: { min: '', max: '' },
                                        engineVolume: { min: '', max: '' },
                                        traction: '',
                                        color: [],
                                        warranty: '',
                                        heavyDamage: '',
                                        plate: '',
                                        fromWhom: [],
                                        exchange: '',
                                        hasPhoto: false,
                                        hasVideo: false,
                                        keyword: ''
                                    });
                                    // Reset local states too
                                    setSelectedMake('');
                                    setSelectedModel('');
                                    setSelectedPackage('');
                                    setPriceRange({ min: '', max: '' });
                                    setYearRange({ min: '', max: '' });
                                    setKmRange({ min: '', max: '' });
                                    setSelectedCity('');
                                    setSelectedDistrict('');
                                    setVehicleStatus('');
                                    setGear([]);
                                    setFuel([]);
                                    setBodyType([]);
                                    setEnginePower({ min: '', max: '' });
                                    setEngineVolume({ min: '', max: '' });
                                    setTraction('');
                                    setColor([]);
                                    setWarranty('');
                                    setHeavyDamage('');
                                    setPlate('');
                                    setFromWhom([]);
                                    setExchange('');
                                    setHasPhoto(false);
                                    setHasVideo(false);
                                    setKeyword('');
                                }}
                                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    )}
                </main>
            </div >
            <Footer />
        </div >
    );
}

export default Vasita;
