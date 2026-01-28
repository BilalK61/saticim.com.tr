import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car,
    Home,
    Shirt,
    Smartphone,
    ChevronRight,
    Upload,
    MapPin,
    Camera,
    AlertCircle,
    Check,
    ChevronLeft,
    Briefcase,
    Armchair,
    Wrench,
    Baby,
    Gamepad2,
    Book,
    Sparkles,
    Dumbbell
} from 'lucide-react';
import Footer from '../components/Footer';

const IlanEkle = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // Get listing ID from URL
    const { user } = useAuth();
    const isEditMode = !!id; // Edit mode if ID exists
    const [step, setStep] = useState(isEditMode ? 2 : 1); // Skip category selection in edit mode
    const [loadingData, setLoadingData] = useState(isEditMode);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: null,
        showCancel: false
    });

    const showModal = (title, message, type = 'info', onConfirm = null, showCancel = false) => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            showCancel
        });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    // ... existing states ...
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [images, setImages] = useState([]);

    // Location States
    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

    // Vehicle Specific States
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState([]);
    const [packages, setPackages] = useState([]);
    const [selectedMake, setSelectedMake] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedPackage, setSelectedPackage] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState({
        year: '',
        km: '',
        fuel: '',
        gear: '',
        bodyType: '',
        vehicleStatus: '',
        enginePower: '',
        engineVolume: '',
        traction: '',
        color: '',
        warranty: '',
        heavyDamage: '',
        plate: '',
        fromWhom: '',
        exchange: ''
    });

    const [realEstateDetails, setRealEstateDetails] = useState({
        type: '', // Daire, Villa, Arsa vs
        room: '',
        size: '', // m2
        age: '',
        floor: '', // Bulunduğu kat
        totalFloors: '', // Kat Sayısı (optional but good)
        heating: '',
        bathroom: '',
        furnished: false,
        balcony: false,
        fromSite: false,
        zoning: '', // İmar Durumu for Arsa
        credit: '',
        swap: ''
    });

    // Electronics Specific States
    const [phoneBrands, setPhoneBrands] = useState([]);
    const [phoneModels, setPhoneModels] = useState([]);
    const [phoneDetails, setPhoneDetails] = useState({
        subCategory: '', // Cep Telefonu, Tablet, Bilgisayar, Diğer
        brand: '',
        model: '',
        storage: '',
        ram: '',
        color: '',
        warranty: '',
        status: '',
        screenSize: '',
        camera: '',
        battery: '',
        releaseDate: ''
    });

    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        currency: 'TL',
        description: '',
        city: '',
        district: '',
        neighborhood: '',
        phone: ''
    });

    // ... categories definition ...
    const categories = [
        { id: 'vasita', name: 'Vasıta', icon: Car, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
        { id: 'emlak', name: 'Emlak', icon: Home, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
        { id: 'giyim', name: 'Giyim', icon: Shirt, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
        { id: 'elektronik', name: 'Elektronik', icon: Smartphone, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        { id: 'ev-esyalari', name: 'Ev Eşyaları', icon: Armchair, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
        { id: 'is-ilanlari', name: 'İş İlanları', icon: Briefcase, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
        { id: 'hizmetler', name: 'Hizmetler', icon: Wrench, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
        { id: 'anne-bebek', name: 'Anne & Bebek', icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
        { id: 'hobi-oyun', name: 'Hobi & Oyun', icon: Gamepad2, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
        { id: 'kitap-dergi', name: 'Kitap & Dergi', icon: Book, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
        { id: 'kozmetik', name: 'Kozmetik', icon: Sparkles, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
        { id: 'spor', name: 'Spor & Outdoor', icon: Dumbbell, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    ];

    // ... useEffects ...

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (selectedCity) {
            fetchDistricts(selectedCity);
            setFormData(prev => ({ ...prev, city: selectedCity }));
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
            setFormData(prev => ({ ...prev, district: selectedDistrict }));
        } else {
            setNeighborhoods([]);
        }
        setSelectedNeighborhood('');
    }, [selectedDistrict]);

    useEffect(() => {
        if (selectedNeighborhood) {
            setFormData(prev => ({ ...prev, neighborhood: selectedNeighborhood }));
        }
    }, [selectedNeighborhood]);

    // Vehicle Fetch Logic
    useEffect(() => {
        if (selectedCategory === 'vasita') {
            fetchMakes();
        }
    }, [selectedCategory]);

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

    // Phone Data Fetch Logic
    useEffect(() => {
        if (selectedCategory === 'elektronik') {
            fetchPhoneBrands();
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (phoneDetails.brand) {
            fetchPhoneModels(phoneDetails.brand);
        } else {
            setPhoneModels([]);
        }
        // Reset model when brand changes if model is not valid for new brand (handled by user selection usually but good to keep clean)
        // Check if current model belongs to new brand? No, simplify: if brand changes, just update list. 
        // User should re-select model if UI clears it or keep it if we don't clear. 
        // Usually better to clear model if brand changes.
        if (phoneDetails.brand && phoneModels.length > 0) {
            // Optional: verify/reset model
        }
    }, [phoneDetails.brand, phoneDetails.subCategory]);

    // Fetch full details when model changes
    useEffect(() => {
        if (phoneDetails.model) {
            fetchModelDetails(phoneDetails.model);
        }
    }, [phoneDetails.model]);

    const fetchMakes = async () => {
        const { data } = await supabase.from('vehicle_makes').select('*').order('name');
        setMakes(data || []);
    };
    const fetchModels = async (makeId) => {
        const { data } = await supabase.from('vehicle_models').select('*').eq('make_id', makeId).order('name');
        setModels(data || []);
    };
    const fetchPackages = async (modelId) => {
        const { data } = await supabase.from('vehicle_packages').select('*').eq('model_id', modelId).order('name');
        setPackages(data || []);
    };

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

            // Filter based on selected subCategory
            let filteredData = data || [];
            if (phoneDetails.subCategory === 'Cep Telefonu') {
                filteredData = filteredData.filter(m => !m.name.match(/iPad|Tab|Pad|Watch/i));
            } else if (phoneDetails.subCategory === 'Tablet') {
                filteredData = filteredData.filter(m => m.name.match(/iPad|Tab|Pad/i));
            }

            setPhoneModels(filteredData);
        } catch (error) {
            console.error('Telefon modelleri çekilirken hata:', error.message);
        }
    };

    const fetchModelDetails = async (modelId) => {
        try {
            const { data, error } = await supabase.from('phone_models').select('*').eq('id', modelId).single();
            if (error) throw error;

            if (data) {
                setPhoneDetails(prev => ({
                    ...prev,
                    screenSize: data.display_size || '',
                    camera: data.camera_pixels || '',
                    battery: data.battery_size || '',
                    releaseDate: data.released_at || ''
                }));
            }
        } catch (error) {
            console.error('Model detayları çekilirken hata:', error.message);
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

    // Fetch listing data for edit mode
    const fetchListingData = async (listingId) => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', listingId)
                .single();

            if (error) throw error;

            // Check authorization (Owner OR Admin/Moderator)
            const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
            if (data.user_id !== user?.id && !isAdmin) {
                showModal('Yetkisiz İşlem', 'Bu ilanı düzenleme yetkiniz yok.', 'error', () => navigate('/profil'));
                return;
            }

            // Populate form states
            setSelectedCategory(data.category);
            setImages(data.images || []);
            setFormData({
                title: data.title || '',
                price: data.price?.toString() || '',
                currency: data.currency || 'TL',
                description: data.description || '',
                phone: data.contact_phone || ''
            });

            // Set location data
            if (data.city_id) {
                setSelectedCity(data.city_id.toString());
            }
            if (data.district_id) {
                setSelectedDistrict(data.district_id.toString());
            }
            if (data.neighborhood_id) {
                setSelectedNeighborhood(data.neighborhood_id.toString());
            }

            // Vehicle specific data
            if (data.category === 'vasita' && data.details) {
                setVehicleDetails(data.details);
                if (data.details.make_id) setSelectedMake(data.details.make_id);
                if (data.details.model_id) setSelectedModel(data.details.model_id);
                if (data.details.package_id) setSelectedPackage(data.details.package_id);
            }

            // Real Estate specific data
            if (data.category === 'emlak' && data.details) {
                setRealEstateDetails(data.details);
            }

            // Electronics specific data
            if (data.category === 'elektronik' && data.details) {
                setPhoneDetails(data.details);
            }

        } catch (error) {
            console.error('İlan yüklenirken hata:', error);
            showModal('Hata', 'İlan verileri yüklenemedi.', 'error', () => navigate('/profil'));
        } finally {
            setLoadingData(false);
        }
    };

    // Load listing data in edit mode
    useEffect(() => {
        if (isEditMode && id && user) {
            fetchListingData(id);
        }
    }, [id, user, isEditMode]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (!user) {
                showModal('Giriş Gerekli', 'İlan vermek için giriş yapmalısınız.', 'warning', () => navigate('/login'));
                return;
            }

            const listingData = {
                title: formData.title,
                price: parseFloat(formData.price),
                currency: formData.currency,
                description: formData.description,
                category: selectedCategory,
                city_id: selectedCity ? parseInt(selectedCity) : null,
                district_id: selectedDistrict ? parseInt(selectedDistrict) : null,
                neighborhood_id: selectedNeighborhood ? parseInt(selectedNeighborhood) : null,

                contact_phone: formData.phone,
                images: images,
                details: selectedCategory === 'vasita' ? {
                    make_id: selectedMake,
                    model_id: selectedModel,
                    package_id: selectedPackage,
                    ...vehicleDetails
                } : selectedCategory === 'emlak' ? {
                    ...realEstateDetails
                } : selectedCategory === 'elektronik' ? {
                    ...phoneDetails
                } : {}
            };

            let error;

            if (isEditMode) {
                // UPDATE existing listing
                const result = await supabase
                    .from('listings')
                    .update({
                        ...listingData,
                        status: 'pending' // Reset status to pending on update
                    })
                    .eq('id', id)
                    .eq('user_id', user.id); // Ensure user owns the listing

                error = result.error;
            } else {
                // INSERT new listing
                const result = await supabase
                    .from('listings')
                    .insert([{
                        ...listingData,
                        user_id: user.id,
                        status: 'pending'
                    }]);

                error = result.error;
            }

            if (error) throw error;

            showModal(
                'Başarılı',
                isEditMode
                    ? 'İlanınız başarıyla güncellendi.'
                    : 'İlanınız başarıyla oluşturuldu ve onay için gönderildi.',
                'success',
                () => {
                    if (location.state?.from) {
                        navigate(location.state.from);
                    } else {
                        navigate('/profil');
                    }
                }
            );

        } catch (error) {
            console.error('Error submitting listing:', error);
            showModal('Hata', 'İlan gönderilirken bir hata oluştu: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const promises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises)
            .then(base64Images => {
                setImages(prev => [...prev, ...base64Images]);
            })
            .catch(err => console.error("Resim yükleme hatası:", err));
    };


    const renderStep1_Category = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold text-gray-800 text-center"
            >
                İlan Kategorisini Seçin
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat, index) => (
                    <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setSelectedCategory(cat.id);
                            setStep(2);
                        }}
                        className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-4
                            ${selectedCategory === cat.id
                                ? `${cat.border} ${cat.bg} ring-2 ring-offset-2 ring-blue-500 shadow-lg`
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                            }`}
                    >
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${cat.bg} ${cat.color}`}
                        >
                            <cat.icon size={24} />
                        </motion.div>
                        <span className="font-semibold text-gray-700">{cat.name}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    const renderStep2_Details = () => (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className="font-medium text-blue-600">Kategori:</span>
                <span className="capitalize">{selectedCategory}</span>
                {!isEditMode && (
                    <button
                        onClick={() => setStep(1)}
                        className="text-xs text-blue-600 hover:underline ml-2"
                    >
                        (Değiştir)
                    </button>
                )}
            </div>

            <div className="grid gap-6">
                {/* Vasıta Specific Fields */}
                {selectedCategory === 'vasita' && (
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-6">
                        <h3 className="font-semibold text-blue-800 text-lg border-b border-blue-200 pb-2">Araç Bilgileri</h3>

                        {/* 1. Temel Bilgiler */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                                <select
                                    value={selectedMake}
                                    onChange={(e) => setSelectedMake(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {makes.map(make => <option key={make.id} value={make.id}>{make.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    disabled={!selectedMake}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none disabled:bg-gray-100"
                                >
                                    <option value="">Seçiniz</option>
                                    {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Paket</label>
                                <select
                                    value={selectedPackage}
                                    onChange={(e) => setSelectedPackage(e.target.value)}
                                    disabled={!selectedModel}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none disabled:bg-gray-100"
                                >
                                    <option value="">Seçiniz</option>
                                    {packages.map(pkg => <option key={pkg.id} value={pkg.id}>{pkg.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 2. Teknik Detaylar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yıl</label>
                                <input
                                    type="number"
                                    placeholder="2023"
                                    value={vehicleDetails.year}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, year: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">KM</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={vehicleDetails.km}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, km: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Yakıt</label>
                                <select
                                    value={vehicleDetails.fuel}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, fuel: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Benzin', 'Benzin & LPG', 'Dizel', 'Elektrik', 'Hibrit'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vites</label>
                                <select
                                    value={vehicleDetails.gear}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, gear: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Manuel', 'Otomatik', 'Yarı Otomatik'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 3. Motor ve Performans */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kasa Tipi</label>
                                <select
                                    value={vehicleDetails.bodyType}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, bodyType: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Sedan', 'Hatchback', 'Station Wagon', 'SUV', 'Cabrio', 'Coupe', 'Minivan', 'Panelvan'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Motor Gücü (HP)</label>
                                <input
                                    type="number"
                                    placeholder="Örn: 150"
                                    value={vehicleDetails.enginePower}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, enginePower: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Motor Hacmi (CC)</label>
                                <input
                                    type="number"
                                    placeholder="Örn: 1600"
                                    value={vehicleDetails.engineVolume}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, engineVolume: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Çekiş</label>
                                <select
                                    value={vehicleDetails.traction}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, traction: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Önden Çekiş', 'Arkadan İtiş', '4WD (Sürekli)', 'AWD (Elektronik)'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 4. Durum ve Özellikler */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
                                <select
                                    value={vehicleDetails.color}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, color: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Beyaz', 'Siyah', 'Gri', 'Gümüş Gri', 'Kırmızı', 'Mavi', 'Lacivert', 'Yeşil', 'Sarı', 'Turuncu', 'Kahverengi', 'Bej', 'Füme', 'Şampanya'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Araç Durumu</label>
                                <select
                                    value={vehicleDetails.vehicleStatus}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, vehicleStatus: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Sıfır', 'İkinci El'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Garanti</label>
                                <select
                                    value={vehicleDetails.warranty}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, warranty: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Var', 'Yok'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ağır Hasar</label>
                                <select
                                    value={vehicleDetails.heavyDamage}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, heavyDamage: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Var', 'Yok'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* 5. Diğer */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Plaka / Uyruk</label>
                                <select
                                    value={vehicleDetails.plate}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, plate: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['TR Plakalı', 'Yabancı Plakalı (MA-MZ)'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kimden</label>
                                <select
                                    value={vehicleDetails.fromWhom}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, fromWhom: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Sahibinden', 'Galeriden', 'Yetkili Bayiden'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Takas</label>
                                <select
                                    value={vehicleDetails.exchange}
                                    onChange={(e) => setVehicleDetails({ ...vehicleDetails, exchange: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Evet', 'Hayır'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                    </div>
                )}


                {selectedCategory === 'elektronik' && (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-100 space-y-6">
                        <h3 className="font-semibold text-green-800 text-lg border-b border-green-200 pb-2">Elektronik Bilgileri</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Kategori</label>
                                <select
                                    value={phoneDetails.subCategory}
                                    onChange={(e) => setPhoneDetails({ ...phoneDetails, subCategory: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Cep Telefonu', 'Tablet', 'Bilgisayar', 'Diğer'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {phoneDetails.subCategory === 'Cep Telefonu' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Marka</label>
                                        <select
                                            value={phoneDetails.brand}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, brand: e.target.value, model: '' })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {phoneBrands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                                        <select
                                            value={phoneDetails.model}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, model: e.target.value })}
                                            disabled={!phoneDetails.brand}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none disabled:bg-gray-100"
                                        >
                                            <option value="">Seçiniz</option>
                                            {phoneModels.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dahili Hafıza</label>
                                        <select
                                            value={phoneDetails.storage}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, storage: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['16 GB', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', 'Diğer'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">RAM</label>
                                        <select
                                            value={phoneDetails.ram}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, ram: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB', 'Diğer'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Garanti</label>
                                        <select
                                            value={phoneDetails.warranty}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, warranty: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['Var', 'Yok'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Durumu</label>
                                        <select
                                            value={phoneDetails.status}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, status: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['Sıfır', 'İkinci El', 'Yenilenmiş'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Auto-filled Specs */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                                    <div className="col-span-full mb-2 border-b border-gray-200 pb-1">
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Teknik Özellikler (Otomatik)</span>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Ekran</label>
                                        <input
                                            type="text"
                                            value={phoneDetails.screenSize}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, screenSize: e.target.value })}
                                            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white"
                                            placeholder="Örn: 6.1 inç"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Kamera</label>
                                        <input
                                            type="text"
                                            value={phoneDetails.camera}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, camera: e.target.value })}
                                            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white"
                                            placeholder="Örn: 12 MP"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Pil</label>
                                        <input
                                            type="text"
                                            value={phoneDetails.battery}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, battery: e.target.value })}
                                            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white"
                                            placeholder="Örn: 3000 mAh"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Çıkış Yılı</label>
                                        <input
                                            type="text"
                                            value={phoneDetails.releaseDate}
                                            onChange={(e) => setPhoneDetails({ ...phoneDetails, releaseDate: e.target.value })}
                                            className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-white"
                                            placeholder="Örn: 2021"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        {phoneDetails.subCategory && phoneDetails.subCategory !== 'Cep Telefonu' && (
                            <div className="text-sm text-gray-500 italic">
                                Bu kategori için detaylı filtreler henüz eklenmedi. Başlık ve Açıklama kısmında detayları belirtebilirsiniz.
                            </div>
                        )}
                    </div>
                )}

                {selectedCategory === 'emlak' && (
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 space-y-6">
                        <h3 className="font-semibold text-orange-800 text-lg border-b border-orange-200 pb-2">Emlak Bilgileri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Emlak Tipi</label>
                                <select
                                    value={realEstateDetails.type}
                                    onChange={(e) => setRealEstateDetails({ ...realEstateDetails, type: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Satılık Daire', 'Kiralık Daire', 'Satılık Arsa', 'Kiralık Arsa', 'İşyeri', 'Müstakil Ev', 'Villa', 'Çiftlik Evi', 'Yazlık', 'Bina', 'Devre Mülk', 'Turistik Tesis'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Detail fields based on type */}
                        {['Satılık Daire', 'Kiralık Daire', 'Müstakil Ev', 'Villa', 'Yazlık', 'Bina'].includes(realEstateDetails.type) && (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Oda Sayısı</label>
                                        <select
                                            value={realEstateDetails.roomCount}
                                            onChange={(e) => setRealEstateDetails({ ...realEstateDetails, roomCount: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['1+0', '1+1', '2+1', '3+1', '4+1', '5+1', '6+ Üzeri'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Bina Yaşı</label>
                                        <select
                                            value={realEstateDetails.buildingAge}
                                            onChange={(e) => setRealEstateDetails({ ...realEstateDetails, buildingAge: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['0 (Yeni)', '1-5', '6-10', '11-15', '16-20', '21+'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Isıtma</label>
                                        <select
                                            value={realEstateDetails.heating}
                                            onChange={(e) => setRealEstateDetails({ ...realEstateDetails, heating: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['Kombi (Doğalgaz)', 'Merkezi', 'Merkezi (Pay Ölçer)', 'Yerden Isıtma', 'Klima', 'Soba', 'Yok'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Banyo Sayısı</label>
                                        <select
                                            value={realEstateDetails.bathroom}
                                            onChange={(e) => setRealEstateDetails({ ...realEstateDetails, bathroom: e.target.value })}
                                            className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                        >
                                            <option value="">Seçiniz</option>
                                            {['1', '2', '3', '4', '5', '6+ Üzeri'].map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={realEstateDetails.furnished}
                                            onChange={(e) => setRealEstateDetails({ ...realEstateDetails, furnished: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Eşyalı</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={realEstateDetails.balcony}
                                            onChange={(e) => setRealEstateDetails({ ...realEstateDetails, balcony: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Balkon</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={realEstateDetails.fromSite}
                                            onChange={(e) => setRealEstateDetails({ ...realEstateDetails, fromSite: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 font-medium">Site İçerisinde</span>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Land Specific: Zoning */}
                        {['Satılık Arsa', 'Kiralık Arsa', 'Bağ', 'Bahçe', 'Tarla', 'Zeytinlik'].includes(realEstateDetails.type) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">İmar Durumu</label>
                                <select
                                    value={realEstateDetails.zoning}
                                    onChange={(e) => setRealEstateDetails({ ...realEstateDetails, zoning: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="">Seçiniz</option>
                                    {['Konut', 'Ticari', 'Bağ-Bahçe', 'Tarla', 'Sanayi', 'Zeytinlik', 'Sit Alanı', 'Diğer'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Common boolean options */}
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={realEstateDetails.credit === 'true'} // assuming string 'true'/'false' or boolean, sticking to implementation plan state def
                                    onChange={(e) => setRealEstateDetails({ ...realEstateDetails, credit: e.target.checked ? 'true' : '' })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700 font-medium">Krediye Uygun</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={realEstateDetails.swap === 'true'}
                                    onChange={(e) => setRealEstateDetails({ ...realEstateDetails, swap: e.target.checked ? 'true' : '' })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700 font-medium">Takaslı</span>
                            </label>
                        </div>

                    </div>
                )}

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İlan Başlığı</label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="Örn: Sahibinden Temiz 2020 Model..."
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                {/* Price & Currency */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fiyat</label>
                        <input
                            type="number"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="0"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Para Birimi</label>
                        <select
                            value={formData.currency}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                        >
                            <option value="TL">TL</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                    <textarea
                        rows="6"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                        placeholder="Ürününüzü detaylı bir şekilde anlatın..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                </div>
            </div >

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => setStep(3)}
                    disabled={!formData.title || !formData.price}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    Sonraki Adım
                    <ChevronRight size={18} />
                </button>
            </div>
        </div >
    );

    const renderStep3_Images = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold text-gray-800"
            >
                Fotoğraflar
            </motion.h2>
            <motion.div
                whileHover={{ scale: 1.02, borderColor: 'rgb(96, 165, 250)' }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center cursor-pointer relative group"
            >
                <input
                    type="file"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                />
                <div className="flex flex-col items-center justify-center gap-3">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"
                    >
                        <Camera size={32} />
                    </motion.div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Fotoğraf Yüklemek İçin Tıklayın</h3>
                        <p className="text-sm text-gray-500 mt-1">veya sürükleyip bırakın</p>
                    </div>
                    <motion.p
                        whileHover={{ scale: 1.05 }}
                        className="text-xs text-blue-500 bg-blue-100 px-3 py-1 rounded-full"
                    >
                        Maksimum 10 Fotoğraf
                    </motion.p>
                </div>
            </motion.div>

            {/* Image Preview Grid */}
            <AnimatePresence mode="popLayout">
                {images.length > 0 && (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
                    >
                        {images.map((img, idx) => (
                            <motion.div
                                key={idx}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                whileHover={{ scale: 1.05 }}
                                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group"
                            >
                                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                <motion.button
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft size={16} className="rotate-45" />
                                </motion.button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between pt-6">
                <motion.button
                    whileHover={{ scale: 1.05, x: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                >
                    Geri Dön
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05, x: 4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(4)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                    Sonraki Adım
                    <ChevronRight size={18} />
                </motion.button>
            </div>
        </motion.div>
    );

    const renderStep4_LocationContact = () => (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800">Konum ve İletişim</h2>

            <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                        <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none"
                        >
                            <option value="">İl Seçin</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedCity}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">İlçe Seçin</option>
                            {districts.map(district => (
                                <option key={district.id} value={district.id}>{district.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mahalle</label>
                        <select
                            value={selectedNeighborhood}
                            onChange={(e) => setSelectedNeighborhood(e.target.value)}
                            disabled={!selectedDistrict}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">Mahalle Seçin</option>
                            {neighborhoods.map(neighborhood => (
                                <option key={neighborhood.id} value={neighborhood.id}>{neighborhood.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <AlertCircle size={18} className="text-blue-600" />
                        İletişim Bilgileri
                    </h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası</label>
                            <input
                                type="tel"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="0555 555 55 55"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <motion.button
                    whileHover={{ scale: 1.05, x: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(3)}
                    className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition"
                >
                    Geri Dön
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={loading ? { opacity: [1, 0.8, 1] } : {}}
                    transition={loading ? { repeat: Infinity, duration: 1.5 } : {}}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-green-200/50 flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <Check size={18} />
                    )}
                    {isEditMode ? 'Değişiklikleri Kaydet' : 'İlanı Yayınla'}
                </motion.button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {isEditMode ? 'İlan Düzenle' : 'Ücretsiz İlan Ver'}
                        </h1>
                        <p className="text-gray-500">
                            {isEditMode ? 'İlanınızdaki bilgileri güncelleyin.' : 'Hızlıca ilan verin, milyonlarca alıcıya ulaşın.'}
                        </p>
                    </div>

                    {/* Loading State for Edit Mode */}
                    {loadingData && isEditMode ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                                <p className="text-gray-600 font-medium">İlan bilgileri yükleniyor...</p>
                            </div>
                        </div>
                    ) : (
                        <>

                            {/* Progress Steps */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
                                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-300`}
                                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                                    ></div>

                                    {[1, 2, 3, 4].map((s) => (
                                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors bg-white
                                    ${step >= s ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-400'}`}>
                                            {s}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-xs font-medium text-gray-500 px-1">
                                    <span>Kategori</span>
                                    <span>Detaylar</span>
                                    <span>Fotoğraflar</span>
                                    <span>Onay</span>
                                </div>
                            </div>

                            {/* Form Container */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                                {step === 1 && renderStep1_Category()}
                                {step === 2 && renderStep2_Details()}
                                {step === 3 && renderStep3_Images()}
                                {step === 4 && renderStep4_LocationContact()}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onConfirm={modal.onConfirm}
                showCancel={modal.showCancel}
            />
            <Footer />
        </div>
    );
};

export default IlanEkle;
