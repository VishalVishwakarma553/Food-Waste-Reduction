// GET /api/public/geocode?q={address_string}
// Server-side Nominatim proxy — avoids browser CORS issues and hides User-Agent requirements
export async function geocodeAddress(req, res) {
    const { q } = req.query;
    if (!q || !q.trim()) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q.trim())}&format=json&limit=5&countrycodes=in&addressdetails=1`;
        const response = await fetch(url, {
            headers: {
                // Nominatim ToS requires a descriptive User-Agent
                "User-Agent": "FoodSave-App/1.0 (foodwaste-reduction-platform)",
                "Accept-Language": "en",
            },
        });
        if (!response.ok) {
            return res.status(502).json({ error: "Geocoding service unavailable" });
        }
        const data = await response.json();
        // Return simplified shape: [{lat, lng, display_name}]
        const results = data.map((r) => ({
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            display_name: r.display_name,
            address: r.address,
        }));
        res.json({ results });
    } catch (err) {
        console.error("Geocoding proxy error:", err);
        res.status(500).json({ error: "Geocoding failed" });
    }
}

// GET /api/public/reverse-geocode?lat={lat}&lng={lng}
// Reverse geocode coordinates to a human-readable address
export async function reverseGeocode(req, res) {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ error: "lat and lng query parameters are required" });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
        const response = await fetch(url, {
            headers: {
                "User-Agent": "FoodSave-App/1.0 (foodwaste-reduction-platform)",
                "Accept-Language": "en",
            },
        });
        if (!response.ok) {
            return res.status(502).json({ error: "Reverse geocoding service unavailable" });
        }
        const data = await response.json();
        res.json({
            display_name: data.display_name,
            address: data.address,
        });
    } catch (err) {
        console.error("Reverse geocoding proxy error:", err);
        res.status(500).json({ error: "Reverse geocoding failed" });
    }
}
