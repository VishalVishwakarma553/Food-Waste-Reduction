import { useEffect, useState, useRef } from 'react';
import { FiMapPin, FiSearch, FiLoader } from 'react-icons/fi';
import api from '../../lib/api';

export default function LocationPicker({
    initialLat,
    initialLng,
    onLocationChange,
    placeholder = "Search for your address..."
}) {
    const mapContainerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [mapLoaded, setMapLoaded] = useState(false);

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const LRef = useRef(null);

    // Default coordinates: Bengaluru, India if none provided
    const lat = initialLat ? parseFloat(initialLat) : 12.9716;
    const lng = initialLng ? parseFloat(initialLng) : 77.5946;

    useEffect(() => {
        let isMounted = true;

        // Dynamic script loading of Leaflet
        const loadLeaflet = async () => {
            if (window.L) {
                LRef.current = window.L;
                if (isMounted) setMapLoaded(true);
                return;
            }

            // CSS
            if (!document.getElementById('leaflet-css')) {
                const link = document.createElement('link');
                link.id = 'leaflet-css';
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
            }

            // JS
            if (!document.getElementById('leaflet-js')) {
                const script = document.createElement('script');
                script.id = 'leaflet-js';
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.async = true;
                script.onload = () => {
                    LRef.current = window.L;
                    if (isMounted) setMapLoaded(true);
                };
                document.body.appendChild(script);
            } else {
                // Poll check if script tag exists but load is in-progress
                const timer = setInterval(() => {
                    if (window.L) {
                        clearInterval(timer);
                        LRef.current = window.L;
                        if (isMounted) setMapLoaded(true);
                    }
                }, 100);
            }
        };

        loadLeaflet();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Initialize Map once Leaflet JS is loaded and container is ready
    useEffect(() => {
        if (!mapLoaded || !LRef.current || !mapContainerRef.current || mapRef.current) return;

        const L = LRef.current;

        // Custom marker icon due to leaflet asset path issues in single bundles
        const customIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Create Map
        const map = L.map(mapContainerRef.current).setView([lat, lng], 14);
        mapRef.current = map;

        // Tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Draggable Marker
        const marker = L.marker([lat, lng], { draggable: true, icon: customIcon }).addTo(map);
        markerRef.current = marker;

        // Handle marker drag
        marker.on('dragend', async () => {
            const position = marker.getLatLng();
            await reverseGeocode(position.lat, position.lng);
        });

        // Click on map to place marker
        map.on('click', async (e) => {
            const { lat: clickLat, lng: clickLng } = e.latlng;
            marker.setLatLng([clickLat, clickLng]);
            await reverseGeocode(clickLat, clickLng);
        });

    }, [mapLoaded]);

    // Reverse geocode lat,lng using our backend proxy
    const reverseGeocode = async (latitude, longitude) => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get('/public/reverse-geocode', {
                params: { lat: latitude, lng: longitude }
            });

            // Extract components nicely
            const details = data.address || {};
            const address = data.display_name || '';
            const city = details.city || details.town || details.village || details.suburb || '';
            const state = details.state || '';
            const pincode = details.postcode || '';

            onLocationChange({
                latitude,
                longitude,
                address,
                city,
                state,
                pincode
            });
        } catch (err) {
            console.error(err);
            setError('Could not fetch address details for coordinates.');
        } finally {
            setLoading(false);
        }
    };

    // Forward geocode search using our backend proxy
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setSearching(true);
        setError('');
        try {
            const { data } = await api.get('/public/geocode', {
                params: { q: searchQuery }
            });

            if (data.results && data.results.length > 0) {
                const bestResult = data.results[0];
                const { lat: foundLat, lng: foundLng, display_name } = bestResult;

                // Move map and marker
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([foundLat, foundLng], 15);
                    markerRef.current.setLatLng([foundLat, foundLng]);
                }

                // Extract details
                const details = bestResult.address || {};
                const city = details.city || details.town || details.village || details.suburb || '';
                const state = details.state || '';
                const pincode = details.postcode || '';

                onLocationChange({
                    latitude: foundLat,
                    longitude: foundLng,
                    address: display_name,
                    city,
                    state,
                    pincode
                });
            } else {
                setError('Address not found. Please try a different query or pincode.');
            }
        } catch (err) {
            console.error(err);
            setError('Address search failed.');
        } finally {
            setSearching(false);
        }
    };

    // Capture user's GPS coords
    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                if (mapRef.current && markerRef.current) {
                    mapRef.current.setView([latitude, longitude], 16);
                    markerRef.current.setLatLng([latitude, longitude]);
                }
                await reverseGeocode(latitude, longitude);
            },
            (err) => {
                console.error(err);
                setError('Failed to obtain location. Make sure GPS access is enabled.');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    return (
        <div className="space-y-3">
            {/* Search inputs */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={placeholder}
                        className="input-field pl-8! text-sm"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searching}
                    className="btn-primary py-2 px-4 text-xs font-semibold shrink-0"
                >
                    {searching ? <FiLoader className="animate-spin w-4 h-4" /> : 'Search'}
                </button>
            </div>

            {/* Map Container */}
            <div className="relative border border-[#D1FAE5] rounded-2xl overflow-hidden shadow-inner bg-gray-50 h-64 md:h-80">
                {!mapLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F0FDF4] z-10">
                        <FiLoader className="animate-spin text-[#059669] w-8 h-8" />
                        <p className="text-[#065F46] text-xs font-medium">Loading interactive map...</p>
                    </div>
                )}

                {loading && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur border border-emerald-100 py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-md z-[1000] text-xs text-[#065F46] font-semibold">
                        <FiLoader className="animate-spin text-[#059669]" />
                        Fetching Address...
                    </div>
                )}

                <div ref={mapContainerRef} className="w-full h-full z-0" />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={loading || searching}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                    <FiMapPin className="text-[#059669]" />
                    Use Current Location
                </button>

                <p className="text-[11px] text-gray-400">
                    * You can also drag the pin or click on the map to select.
                </p>
            </div>

            {error && (
                <div className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl p-2.5">
                    {error}
                </div>
            )}
        </div>
    );
}
