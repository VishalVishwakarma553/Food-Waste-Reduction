import { useState } from 'react';
import { FiUploadCloud, FiClock, FiPlus, FiTrash2, FiInfo, FiChevronRight, FiChevronLeft, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, title: 'Basic Info' },
    { id: 2, title: 'Images' },
    { id: 3, title: 'Quantity & Pricing' },
    { id: 4, title: 'Availability' },
    { id: 5, title: 'Details' },
    { id: 6, title: 'Logistics' },
    { id: 7, title: 'Review' }
];

export default function AddListingPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        subCategory: '',
        description: '',
        tags: '',

        images: [],

        quantity: '',
        unit: 'kg',
        originalPrice: '',
        discountedPrice: '',
        minOrder: '',

        expiryDate: '',
        expiryTime: '',
        prepDate: '',
        availableFrom: '',
        availableUntil: '',

        ingredients: '',
        allergens: [],
        calories: '',
        dietary: [],
        storage: '',

        pickup: true,
        delivery: false,
        deliveryRadius: '',
        packaging: '',
        instructions: ''
    });

    const categories = ['Bakery', 'Produce', 'Prepared Meals', 'Dairy', 'Beverages', 'Other'];
    const allergenOptions = ['Dairy', 'Nuts', 'Gluten', 'Soy', 'Shellfish', 'Eggs'];
    const dietaryOptions = ['Veg', 'Non-veg', 'Vegan', 'Gluten-free', 'Halal'];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayToggle = (field, value) => {
        setFormData(prev => {
            const current = prev[field];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const nextStep = () => {
        // Add basic validation here if needed
        if (currentStep < STEPS.length) setCurrentStep(c => c + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handlePublish = () => {
        toast.success("Listing published successfully!");
        navigate('/restaurant/listings');
    };

    const handleSaveDraft = () => {
        toast.success("Draft saved successfully.");
        navigate('/restaurant/listings');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#111827]">Add New Listing</h1>
                    <p className="text-gray-500 text-sm mt-1">Create a new food listing to rescue surplus food.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleSaveDraft} className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        Save Draft
                    </button>
                    {currentStep === STEPS.length && (
                        <button onClick={handlePublish} className="px-4 py-2 font-medium text-white bg-[#059669] rounded-xl hover:bg-[#047857] transition-colors">
                            Publish Listing
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-4 sm:p-6 mb-6">
                <div className="flex items-center justify-between mb-4 relative">
                    <div className="absolute left-0 top-1/2 -mt-px w-full h-1 bg-gray-200" />
                    <div
                        className="absolute left-0 top-1/2 -mt-px h-1 bg-[#059669] transition-all duration-300"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${step.id < currentStep ? 'bg-[#059669] border-[#059669] text-white' :
                                step.id === currentStep ? 'bg-white border-[#059669] text-[#059669]' :
                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {step.id < currentStep ? <FiCheck className="w-4 h-4" /> : step.id}
                            </div>
                            <span className={`hidden sm:block absolute top-10 text-xs font-medium whitespace-nowrap ${step.id <= currentStep ? 'text-[#064E3B]' : 'text-gray-400'
                                }`}>
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Food Name <span className="text-red-500">*</span></label>
                            <input
                                type="text" name="name" value={formData.name} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent outline-none"
                                placeholder="e.g. Fresh Artisan Sourdough Bread"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                                <select
                                    name="category" value={formData.category} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent outline-none bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-category</label>
                                <input
                                    type="text" name="subCategory" value={formData.subCategory} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                    placeholder="e.g. Artisan Breads"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description" value={formData.description} onChange={handleInputChange} rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none resize-none"
                                placeholder="Describe the food, condition, and why it's great..."
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-1 text-right">{formData.description.length}/500 chars</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Keywords/Tags</label>
                            <input
                                type="text" name="tags" value={formData.tags} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                placeholder="e.g. bread, sourdough, vegan, fresh (comma separated)"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Images */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Food Images</h2>

                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <FiUploadCloud className="w-8 h-8 text-[#059669]" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Click or drag images here</h3>
                            <p className="text-sm text-gray-500 mb-4">Upload high-quality photos to make your food appealing.</p>
                            <span className="text-xs text-gray-400">Max 5 images. PNG, JPG or WEBP up to 5MB.</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                            {/* Dummy Image Previews */}
                            <div className="aspect-square rounded-xl bg-gray-100 border border-gray-200 relative group overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300" alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <button className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"><FiTrash2 /></button>
                                </div>
                                <span className="absolute top-2 left-2 bg-[#059669] text-white text-xs px-2 py-0.5 rounded-full font-medium">Primary</span>
                            </div>
                            <div className="aspect-square rounded-xl bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                                <FiPlus className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
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
                                    <input
                                        type="number" name="quantity" value={formData.quantity} onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-l-xl focus:ring-2 focus:ring-[#059669] outline-none border-r-0"
                                        placeholder="e.g. 10"
                                    />
                                    <select
                                        name="unit" value={formData.unit} onChange={handleInputChange}
                                        className="px-4 py-2 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-[#059669] outline-none bg-gray-50"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="pieces">pieces</option>
                                        <option value="liters">liters</option>
                                        <option value="boxes">boxes</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Qty</label>
                                <input
                                    type="number" name="minOrder" value={formData.minOrder} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                    placeholder="e.g. 1 (optional)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number" readOnly name="originalPrice" value={formData.originalPrice} onChange={handleInputChange}
                                        className="w-full cursor-not-allowed pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price (₹) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                    <input
                                        type="number" name="discountedPrice" readOnly value={formData.discountedPrice} onChange={handleInputChange}
                                        className="w-full cursor-not-allowed pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none font-semibold text-[#059669]"
                                        placeholder="0.00"
                                    />
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
                            <p className="text-sm text-amber-800">Please ensure expiry dates are accurate. Food safety is our top priority. Listings will automatically hide upon expiry.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Time <span className="text-red-500">*</span></label>
                                <input
                                    type="time" name="expiryTime" value={formData.expiryTime} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                                <input
                                    type="datetime-local" name="availableFrom" value={formData.availableFrom} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Available Until</label>
                                <input
                                    type="datetime-local" name="availableUntil" value={formData.availableUntil} onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                />
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
                                    <button
                                        key={tag}
                                        onClick={() => handleArrayToggle('dietary', tag)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${formData.dietary.includes(tag)
                                            ? 'bg-[#059669] text-white border-[#059669]'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#059669]'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Allergens</label>
                            <div className="flex flex-wrap gap-2">
                                {allergenOptions.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleArrayToggle('allergens', tag)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${formData.allergens.includes(tag)
                                            ? 'bg-red-500 text-white border-red-500'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients (Optional)</label>
                            <textarea
                                name="ingredients" value={formData.ingredients} onChange={handleInputChange} rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none resize-none"
                                placeholder="List main ingredients..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Storage Instructions (Optional)</label>
                            <input
                                type="text" name="storage" value={formData.storage} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                placeholder="e.g. Keep refrigerated, consume within 2 days"
                            />
                        </div>
                    </div>
                )}

                {/* Step 6: Logistics */}
                {currentStep === 6 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Pickup & Logistics</h2>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-[#059669] transition-colors">
                                <input
                                    type="checkbox"
                                    name="pickup"
                                    checked={formData.pickup}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-[#059669] rounded focus:ring-[#059669]"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">Available for Store Pickup</p>
                                    <p className="text-sm text-gray-500">Customers come to your location to pick up.</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:border-[#059669] transition-colors">
                                <input
                                    type="checkbox"
                                    name="delivery"
                                    checked={formData.delivery}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-[#059669] rounded focus:ring-[#059669]"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">Available for Delivery</p>
                                    <p className="text-sm text-gray-500">You handle the delivery to the customer.</p>
                                </div>
                            </label>
                        </div>

                        {formData.delivery && (
                            <div className="pl-8 border-l-2 border-[#059669] ml-2 animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
                                <input
                                    type="number" name="deliveryRadius" value={formData.deliveryRadius} onChange={handleInputChange}
                                    className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                    placeholder="e.g. 5"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Packaging Type</label>
                            <input
                                type="text" name="packaging" value={formData.packaging} onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none"
                                placeholder="e.g. Cardboard box, Bring your own container"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions for Customer</label>
                            <textarea
                                name="instructions" value={formData.instructions} onChange={handleInputChange} rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] outline-none resize-none"
                                placeholder="e.g. Please ring the bell at the back door."
                            ></textarea>
                        </div>
                    </div>
                )}

                {/* Step 7: Review */}
                {currentStep === 7 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-[#111827] mb-6">Review & Publish</h2>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-start gap-4 mb-6">
                                <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop" alt="Preview" className="w-20 h-20 rounded-xl object-cover" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{formData.name || 'Unnamed Item'}
                                        {formData.category && <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 bg-opacity-70">{formData.category}</span>}
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
                                        {formData.pickup && "✓ Pickup "}
                                        {formData.delivery && "✓ Delivery"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 text-sm text-blue-800">
                            <FiInfo className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                            <p>By publishing this listing, you confirm that the food complies with local food safety regulations and our platform's quality standards.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors ${currentStep === 1
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    <FiChevronLeft className="w-5 h-5" /> Back
                </button>

                {currentStep < STEPS.length ? (
                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-[#059669] hover:bg-[#047857] transition-colors shadow-sm"
                    >
                        Next Step <FiChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={handlePublish}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-[#059669] hover:bg-[#047857] transition-colors shadow-sm shadow-[#059669]/20"
                    >
                        Publish Now <FiCheck className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
