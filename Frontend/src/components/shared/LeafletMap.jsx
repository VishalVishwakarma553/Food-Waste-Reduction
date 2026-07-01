import { useEffect, useState, useRef } from 'react';
import { FiLoader } from 'react-icons/fi';

export default function LeafletMap({
    ngoLat,
    ngoLng,
    donations = [],
    zoom = 13,
}) {
    const mapContainerRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const mapRef = useRef(null);
    const markersGroupRef = useRef(null);
    const LRef = useRef(null);

    // Load Leaflet dynamically
    useEffect(() => {
        let isMounted = true;

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

    // Initialize Map and render markers
    useEffect(() => {
        if (!mapLoaded || !LRef.current || !mapContainerRef.current) return;

        const L = LRef.current;

        const centerLat = ngoLat ? parseFloat(ngoLat) : 26.7956;
        const centerLng = ngoLng ? parseFloat(ngoLng) : 82.1943;

        // Create Map if it doesn't exist
        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], zoom);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            markersGroupRef.current = L.layerGroup().addTo(map);
        } else {
            // Update center
            mapRef.current.setView([centerLat, centerLng], zoom);
        }

        const map = mapRef.current;
        const markersGroup = markersGroupRef.current;

        // Clear existing markers
        markersGroup.clearLayers();

        // Custom icons
        const ngoIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        const restaurantIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Add NGO marker
        L.marker([centerLat, centerLng], { icon: ngoIcon })
            .addTo(markersGroup)
            .bindPopup(`<b>Your NGO Location</b><br/>Registered Address Center`);

        // Add restaurant markers
        // Track coordinate counts so we can offset duplicate pins slightly (spiderfy effect)
        const coordsCounts = {};

        donations.forEach((d) => {
            if (d.latitude == null || d.longitude == null) return;

            let latVal = parseFloat(d.latitude);
            let lngVal = parseFloat(d.longitude);

            const key = `${latVal.toFixed(5)},${lngVal.toFixed(5)}`;
            if (coordsCounts[key] != null) {
                coordsCounts[key]++;
                // add small offset to avoid complete overlapping
                latVal += (Math.random() - 0.5) * 0.00015;
                lngVal += (Math.random() - 0.5) * 0.00015;
            } else {
                coordsCounts[key] = 1;
            }

            const popupContent = `
                <div class="p-1 space-y-1">
                    <h4 class="font-bold text-[#064E3B] text-xs">${d.name}</h4>
                    <p class="text-[10px] text-gray-600"><b>Restaurant:</b> ${d.restaurant}</p>
                    <p class="text-[10px] text-gray-600"><b>Quantity:</b> ${d.quantity} ${d.unit}</p>
                    <p class="text-[10px] text-gray-600"><b>Distance:</b> ${d.distance} km</p>
                    <p class="text-[10px] text-amber-600"><b>Expiry:</b> ${d.expiry}</p>
                    <p class="text-[10px] font-bold text-emerald-700 mt-1">${d.type} Donation</p>
                </div>
            `;

            L.marker([latVal, lngVal], { icon: restaurantIcon })
                .addTo(markersGroup)
                .bindPopup(popupContent);
        });

    }, [mapLoaded, ngoLat, ngoLng, donations]);

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden min-h-[450px]">
            {!mapLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#F0FDF4] z-10">
                    <FiLoader className="animate-spin text-[#059669] w-8 h-8" />
                    <p className="text-[#065F46] text-xs font-medium">Loading interactive map...</p>
                </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full min-h-[450px] z-0" />
        </div>
    );
}
