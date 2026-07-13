import { useState, useEffect } from 'react';
import { FiUploadCloud, FiClock, FiPlus, FiTrash2, FiInfo, FiChevronRight, FiChevronLeft, FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { IMG_BASE_URL } from '../../lib/api';
import Skeleton from '../../components/shared/Skeleton';

const STEPS = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Images' },
    { id: 3, title: 'Quantity & Pricing' },
    { id: 4, title: 'Availability' },
    { id: 5, title: 'Details' },
    { id: 6, title: 'Logistics' },
    { id: 7, title: 'Review' }
];

const categories = ['Bakery', 'Produce', 'Prepared Meals', 'Dairy', 'Beverages', 'Other'];
const allergenOptions = ['Dairy', 'Nuts', 'Gluten', 'Soy', 'Shellfish', 'Eggs'];
const dietaryOptions = ['Veg', 'Non-veg', 'Vegan', 'Gluten-free', 'Halal'];

export default function EditListingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [formData, setFormData] = useState({
        name: '', category: '', subCategory: '', description: '', tags: '',
        newImages: [], existingImages: [],
        quantity: '', unit: 'kg', originalPrice: '', discountedPrice: '', minOrder: '',
        expiryDate: '', expiryTime: '', availableFrom: '', availableUntil: '',
        ingredients: '', allergens: [], dietary: [], storage: '',
        pickup: true, delivery: false, deliveryRadius: '', packaging: '', instructions: '',
        status: 'active',
    });

    // ── Load existing listing ─────────────────────────────────────────
    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setFetchError(null);
            try {
                const { data } = await api.get(`/restaurant/listings/${id}`);
                const l = data.listing;

                const parseArr = (val) => {
                    try { return typeof val === 'string' ? JSON.parse(val) : (val || []); }
                    catch { return []; }
                };

                const existingImages = parseArr(l.images).map(p =>
                    p.startsWith('http') ? p : `${IMG_BASE_URL}${p}`
                );

                const fmtDL = (val) => {
                    if (!val) return '';
                    try { return new Date(val).toISOString().slice(0, 16); }
                    catch { return ''; }
                };

                setFormData({
                    name: l.name || '',
                    category: l.category || '',
                    subCategory: l.subCategory || '',
                    description: l.description || '',
                    tags: l.tags || '',
                    newImages: [],
                    existingImages,
                    quantity: l.quantity ?? '',
                    unit: l.unit || 'kg',
                    originalPrice: l.originalPrice ?? '',
                    discountedPrice: l.discountedPrice ?? '',
                    minOrder: l.minOrder ?? '',
                    expiryDate: l.expiryDate || '',
                    expiryTime: l.expiryTime || '',
                    availableFrom: fmtDL(l.availableFrom),
                    availableUntil: fmtDL(l.availableUntil),
                    ingredients: l.ingredients || '',
                    allergens: parseArr(l.allergens),
                    dietary: parseArr(l.dietary),
                    storage: l.storage || '',
                    pickup: l.pickup ?? true,
                    delivery: l.delivery ?? false,
                    deliveryRadius: l.deliveryRadius ?? '',
                    packaging: l.packaging || '',
                    instructions: l.instructions || '',
                    status: l.status || 'active',
                });
            } catch (e) {
                setFetchError(e.response?.data?.error || 'Failed to load listing');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleArrayToggle = (field, value) => {
        setFormData(prev => {
            const updated = prev[field].includes(value)
                ? prev[field].filter(i => i !== value)
                : [...prev[field], value];
            return { ...prev, [field]: updated };
        });
    };

    const removeExistingImage = (idx) =>
        setFormData(prev => ({ ...prev, existingImages: prev.existingImages.filter((_, i) => i !== idx) }));

    const removeNewImage = (idx) =>
        setFormData(prev => ({ ...prev, newImages: prev.newImages.filter((_, i) => i !== idx) }));

    const totalImages = formData.existingImages.length + formData.newImages.length;

    const nextStep = () => { if (currentStep < STEPS.length) setCurrentStep(c => c + 1); };
    const prevStep = () => { if (currentStep > 1) setCurrentStep(c => c - 1); };

    // ── Submit ───────────────────────────────────────────────────────
    const handleUpdate = async (statusOverride) => {
        const finalStatus = statusOverride || formData.status;
        if (!formData.name || !formData.category) {
            toast.error('Please fill in the food name and category.'); return;
        }
        if (!formData.quantity || !formData.discountedPrice) {
            toast.error('Please fill in quantity and discounted price.'); return;
        }
        if (!formData.expiryDate || !formData.expiryTime) {
            toast.error('Please set the expiry date and time.'); return;
        }
        setSaving(true);
        try {
            const fd = new FormData();
            const scalarFields = [
                'name', 'category', 'subCategory', 'description', 'tags',
                'quantity', 'unit', 'originalPrice', 'discountedPrice', 'minOrder',
                'expiryDate', 'expiryTime', 'availableFrom', 'availableUntil',
                'ingredients', 'storage', 'packaging', 'instructions', 'deliveryRadius'
            ];
            scalarFields.forEach(key => {
                const val = formData[key];
                if (val !== '' && val !== null && val !== undefined) fd.append(key, val);
            });
            fd.append('pickup', formData.pickup);
            fd.append('delivery', formData.delivery);
            fd.append('allergens', JSON.stringify(formData.allergens));
            fd.append('dietary', JSON.stringify(formData.dietary));
            fd.append('status', finalStatus);
            fd.append('existingImages', JSON.stringify(
                formData.existingImages.map(url =>
                    url.startsWith(IMG_BASE_URL) ? url.replace(IMG_BASE_URL, '') : url
                )
            ));
            formData.newImages.forEach(img => { if (img instanceof File) fd.append('images', img); });

            await api.patch(`/restaurant/listings/${id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(finalStatus === 'draft' ? 'Draft saved!' : 'Listing updated successfully!');
            navigate('/restaurant/listings');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update listing.');
        } finally {
            setSaving(false);
        }
    };

    // ── States: loading / error ──────────────────────────────────────
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-pulse">
                {/* Header skeleton */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-44" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20 rounded-xl" />
                        <Skeleton className="h-9 w-28 rounded-xl" />
                    </div>
                </div>

                {/* Progress bar skeleton */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6">
                    <div className="flex items-center justify-between relative">
                        <Skeleton className="absolute left-0 top-1/2 -mt-px w-full h-1" />
                        {[1,2,3,4,5,6,7].map(i => (
                            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <Skeleton className="hidden sm:block h-3 w-14" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form area skeleton */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 space-y-6">
                    <Skeleton className="h-6 w-48" />

                    {/* Status row */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <Skeleton className="h-4 w-28" />
                        <div className="flex gap-2 ml-auto">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-14 rounded-full" />
                            <Skeleton className="h-6 w-18 rounded-full" />
                        </div>
                    </div>

                    {/* Food name */}
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>

                    {/* Category + SubCategory */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                    </div>

                    {/* Tags */}
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>

                {/* Nav buttons skeleton */}
                <div className="flex justify-between">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>
        );
    }
    if (fetchError) {
        return (
            <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <FiAlertCircle className="w-10 h-10 text-red-400" />
                <p className="text-red-600 font-medium">{fetchError}</p>
                <button onClick={() => navigate('/restaurant/listings')}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#059669] rounded-xl hover:bg-[#047857]">
                    Back to Listings
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fadeIn">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Edit Listing</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Update your food listing details.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => navigate('/restaurant/listings')}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex-1 sm:flex-none">
                        Cancel
                    </button>
                    <button onClick={() => handleUpdate('draft')} disabled={saving}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex-1 sm:flex-none disabled:opacity-60">
                        {saving ? <FiLoader className="w-4 h-4 animate-spin inline" /> : 'Save Draft'}
                    </button>
                    {currentStep === STEPS.length && (
                        <button onClick={() => handleUpdate('active')} disabled={saving}
                            className="px-3 py-2 text-sm font-medium text-white bg-[#059669] rounded-xl hover:bg-[#047857] transition-colors flex-1 sm:flex-none disabled:opacity-60">
                            {saving ? <FiLoader className="w-4 h-4 animate-spin inline" /> : 'Update Listing'}
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4 relative">
                    <div className="absolute left-0 top-1/2 -mt-px w-full h-1 bg-gray-200" />
                    <div className="absolute left-0 top-1/2 -mt-px h-1 bg-[#059669] transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
                    {STEPS.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <button onClick={() => setCurrentStep(step.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                                    step.id < currentStep ? 'bg-[#059669] border-[#059669] text-white'
                                    : step.id === currentStep ? 'bg-white border-[#059669] text-[#059669]'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {step.id < currentStep ? <FiCheck className="w-4 h-4" /> : step.id}
                            </button>
                            <span className={`hidden sm:block absolute top-10 text-xs font-medium whitespace-nowrap ${step.id <= currentStep ? 'text-[#064E3B]' : 'text-gray-400'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 sm:p-8 min-h-[400px]">

                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Basic Information</h2>

                        {/* Status picker */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <span className="text-sm font-medium text-gray-700 mr-auto">Listing Status</span>
                            {['active', 'draft', 'expired'].map(s => (
                                <button key={s} onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                                        formData.status === s
                                            ? s === 'active' ? 'bg-green-500 text-white'
                                                : s === 'draft' ? 'bg-amber-500 text-white'
                                                : 'bg-red-500 text-white'
                                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                    }`}>{s}</button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Food Name <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent outline-none"
                                placeholder="e.g. Fresh Artisan Sourdough Bread" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                                <select name="category" value={formData.category} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent outline-none bg-white">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-category</label>
                                <input type="text" name="subCategory" value={formData.subCategory} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                    placeholder="e.g. Artisan Breads" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none resize-none"
                                placeholder="Describe the food, condition, and why it's great..." />
                            <p className="text-xs text-gray-500 mt-1 text-right">{formData.description.length}/500 chars</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Keywords/Tags</label>
                            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                placeholder="e.g. bread, sourdough, vegan, fresh (comma separated)" />
                        </div>
                    </div>
                )}

                {/* Step 2: Images */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-2">Food Images</h2>
                        <p className="text-sm text-gray-500">Keep or remove existing images, and upload new ones. Max 5 total.</p>

                        {totalImages < 5 && (
                            <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                                    onChange={(e) => {
                                        const slots = 5 - totalImages;
                                        const files = Array.from(e.target.files).slice(0, slots);
                                        setFormData(prev => ({ ...prev, newImages: [...prev.newImages, ...files] }));
                                    }} />
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <FiUploadCloud className="w-8 h-8 text-[#059669]" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Click to upload images</h3>
                                <p className="text-sm text-gray-500 mb-2">PNG, JPG or WEBP up to 5MB.</p>
                                <span className="text-xs text-gray-400">{totalImages}/5 images used</span>
                            </label>
                        )}

                        {totalImages > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                {formData.existingImages.map((url, idx) => (
                                    <div key={`ex-${idx}`} className="aspect-square rounded-xl bg-gray-100 border border-gray-200 relative group overflow-hidden">
                                        <img src={url} alt={`Existing ${idx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <button type="button" onClick={() => removeExistingImage(idx)}
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiTrash2 /></button>
                                        </div>
                                        {idx === 0 && formData.newImages.length === 0 && (
                                            <span className="absolute top-2 left-2 bg-[#059669] text-white text-xs px-2 py-0.5 rounded-full font-medium">Primary</span>
                                        )}
                                        <span className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-1.5 py-0.5 rounded">Saved</span>
                                    </div>
                                ))}
                                {formData.newImages.map((img, idx) => (
                                    <div key={`new-${idx}`} className="aspect-square rounded-xl bg-gray-100 border border-blue-200 relative group overflow-hidden">
                                        <img src={URL.createObjectURL(img)} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <button type="button" onClick={() => removeNewImage(idx)}
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiTrash2 /></button>
                                        </div>
                                        {formData.existingImages.length === 0 && idx === 0 && (
                                            <span className="absolute top-2 left-2 bg-[#059669] text-white text-xs px-2 py-0.5 rounded-full font-medium">Primary</span>
                                        )}
                                        <span className="absolute bottom-2 left-2 bg-blue-500/80 text-white text-xs px-1.5 py-0.5 rounded">New</span>
                                    </div>
                                ))}
                                {totalImages < 5 && (
                                    <label className="aspect-square rounded-xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file && totalImages < 5) setFormData(prev => ({ ...prev, newImages: [...prev.newImages, file] }));
                                            }} />
                                        <FiPlus className="w-8 h-8 text-gray-400" />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Quantity & Pricing */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Quantity & Pricing</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Available <span className="text-red-500">*</span></label>
                                <div className="flex">
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-[#059669] outline-none border-r-0"
                                        placeholder="e.g. 10" />
                                    <select name="unit" value={formData.unit} onChange={handleInputChange}
                                        className="px-4 py-2 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-[#059669] outline-none bg-gray-50">
                                        <option value="kg">kg</option>
                                        <option value="pieces">pieces</option>
                                        <option value="liters">liters</option>
                                        <option value="boxes">boxes</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Qty</label>
                                <input type="number" name="minOrder" value={formData.minOrder} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                    placeholder="e.g. 1 (optional)" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleInputChange}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                        placeholder="0.00" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (₹) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleInputChange}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none font-semibold text-[#059669]"
                                        placeholder="0.00" />
                                </div>
                                {formData.originalPrice && formData.discountedPrice && (
                                    <p className="text-sm mt-2 font-medium text-[#059669]">
                                        Discount: {Math.round((1 - (formData.discountedPrice / formData.originalPrice)) * 100)}% off
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Availability */}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Expiry & Availability</h2>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 mb-6">
                            <FiInfo className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">Ensure expiry dates are accurate. Listings will automatically hide upon expiry.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date <span className="text-red-500">*</span></label>
                                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Time <span className="text-red-500">*</span></label>
                                <input type="time" name="expiryTime" value={formData.expiryTime} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                                <input type="datetime-local" name="availableFrom" value={formData.availableFrom} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
                                <input type="datetime-local" name="availableUntil" value={formData.availableUntil} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Details */}
                {currentStep === 5 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Additional Details & Guidelines</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {dietaryOptions.map(tag => (
                                    <button key={tag} onClick={() => handleArrayToggle('dietary', tag)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                            formData.dietary.includes(tag) ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white text-gray-700 border-gray-300 hover:border-[#059669]'
                                        }`}>{tag}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                            <div className="flex flex-wrap gap-2">
                                {allergenOptions.map(tag => (
                                    <button key={tag} onClick={() => handleArrayToggle('allergens', tag)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                            formData.allergens.includes(tag) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                                        }`}>{tag}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (Optional)</label>
                            <textarea name="ingredients" value={formData.ingredients} onChange={handleInputChange} rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none resize-none"
                                placeholder="List main ingredients..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Instructions (Optional)</label>
                            <input type="text" name="storage" value={formData.storage} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                placeholder="e.g. Keep refrigerated, consume within 2 days" />
                        </div>
                    </div>
                )}

                {/* Step 6: Logistics */}
                {currentStep === 6 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Pickup & Logistics</h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-[#059669] transition-colors">
                                <input type="checkbox" name="pickup" checked={formData.pickup} onChange={handleInputChange}
                                    className="w-5 h-5 text-[#059669] rounded focus:ring-[#059669]" />
                                <div>
                                    <p className="font-semibold text-gray-900">Available for Store Pickup</p>
                                    <p className="text-sm text-gray-500">Customers come to your location to pick up.</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-[#059669] transition-colors">
                                <input type="checkbox" name="delivery" checked={formData.delivery} onChange={handleInputChange}
                                    className="w-5 h-5 text-[#059669] rounded focus:ring-[#059669]" />
                                <div>
                                    <p className="font-semibold text-gray-900">Available for Delivery</p>
                                    <p className="text-sm text-gray-500">You handle the delivery to the customer.</p>
                                </div>
                            </label>
                        </div>
                        {formData.delivery && (
                            <div className="pl-8 border-l-2 border-[#059669] ml-2 animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                                <input type="number" name="deliveryRadius" value={formData.deliveryRadius} onChange={handleInputChange}
                                    className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                    placeholder="e.g. 5" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Type</label>
                            <input type="text" name="packaging" value={formData.packaging} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                placeholder="e.g. Cardboard box, Bring your own container" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions for Customer</label>
                            <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none resize-none"
                                placeholder="e.g. Please ring the bell at the back door." />
                        </div>
                    </div>
                )}

                {/* Step 7: Review */}
                {currentStep === 7 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Review & Update</h2>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-start gap-4 mb-6">
                                {(formData.existingImages[0] || formData.newImages[0]) ? (
                                    <img
                                        src={formData.existingImages[0] || URL.createObjectURL(formData.newImages[0])}
                                        alt="Preview" className="w-20 h-20 rounded-xl object-cover" />
                                ) : (
                                    <div className="w-20 h-20 rounded-xl bg-green-50 flex items-center justify-center text-4xl">🍱</div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {formData.name || 'Unnamed Item'}
                                        {formData.category && <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{formData.category}</span>}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                        <p><span className="font-semibold text-gray-900">{formData.quantity || 0} {formData.unit}</span> left</p>
                                        <span>•</span>
                                        <p className="flex items-center gap-1"><FiClock className="w-4 h-4" /> Exp: {formData.expiryDate} {formData.expiryTime}</p>
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-[#059669]">₹{formData.discountedPrice || '0'}</span>
                                        <span className="text-sm text-gray-400 line-through">₹{formData.originalPrice || '0'}</span>
                                    </div>
                                </div>
                            </div>
                            <hr className="border-gray-200 mb-4" />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block mb-1">Dietary & Allergens</span>
                                    <div className="flex flex-wrap gap-1">
                                        {formData.dietary.map(d => <span key={d} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{d}</span>)}
                                        {formData.allergens.map(a => <span key={a} className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs">{a}</span>)}
                                        {formData.dietary.length === 0 && formData.allergens.length === 0 && <span className="text-gray-400">None specified</span>}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Logistics</span>
                                    <p className="font-medium text-gray-800">
                                        {formData.pickup && '✓ Pickup '}
                                        {formData.delivery && '✓ Delivery'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Status</span>
                                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                                        formData.status === 'active' ? 'bg-green-100 text-green-700'
                                        : formData.status === 'draft' ? 'bg-gray-100 text-gray-600'
                                        : 'bg-red-100 text-red-600'
                                    }`}>{formData.status}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block mb-1">Images</span>
                                    <p className="font-medium text-gray-800">{totalImages} image{totalImages !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 text-sm text-blue-800">
                            <FiInfo className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                            <p>Updating this listing will immediately reflect changes to consumers browsing the platform.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
                <button onClick={prevStep} disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors ${
                        currentStep === 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}>
                    <FiChevronLeft className="w-5 h-5" /> Back
                </button>

                {currentStep < STEPS.length ? (
                    <button onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-[#059669] hover:bg-[#047857] transition-colors shadow-sm">
                        Next Step <FiChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button onClick={() => handleUpdate('active')} disabled={saving}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-[#059669] hover:bg-[#047857] transition-colors shadow-sm shadow-[#059669]/20 disabled:opacity-60">
                        {saving
                            ? <FiLoader className="w-5 h-5 animate-spin" />
                            : <><FiCheck className="w-5 h-5" /> Update Listing</>}
                    </button>
                )}
            </div>
        </div>
    );
}
