document.addEventListener('DOMContentLoaded', () => {
    // Mobile navigation toggle
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Dynamic Itinerary & OpenStreetMap Geocoding
    const urlParams = new URLSearchParams(window.location.search);
    if (document.getElementById('osmMap')) {
        const pickupText = urlParams.get('pickup') || 'Central London';
        const dropoffText = urlParams.get('dropoff') || 'Heathrow Airport (LHR)';
        const dateText = urlParams.get('date') || '2026-06-15';
        const timeText = urlParams.get('time') || '12:00';

        document.getElementById('summaryPickup').textContent = pickupText;
        document.getElementById('summaryDropoff').textContent = dropoffText;
        document.getElementById('summaryDate').textContent = dateText;
        document.getElementById('summaryTime').textContent = timeText;

        // Initialize Leaflet Map centered in London as default
        const map = L.map('osmMap', { zoomControl: false }).setView([51.5074, -0.1278], 11);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd'
        }).addTo(map);

        // Helper function to fetch coordinates from OpenStreetMap's Nominatim API
        async function getCoordinates(address) {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
                const data = await response.json();
                if (data && data.length > 0) {
                    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                }
            } catch (error) {
                console.error("Geocoding error:", error);
            }
            return null; // Fallback handled later
        }

        async function updateMapRoute() {
            // Fetch real coordinates for both inputs concurrently
            const [pickupCoords, dropoffCoords] = await Promise.all([
                getCoordinates(pickupText),
                getCoordinates(dropoffText)
            ]);

            // Fallback coordinates if location cannot be resolved
            const finalPickup = pickupCoords || [51.5074, -0.1278]; // Default Central London
            const finalDropoff = dropoffCoords || [51.4700, -0.4543]; // Default Heathrow

            // Add markers
            L.marker(finalPickup).addTo(map).bindPopup(`<b>Pickup:</b> ${pickupText}`);
            L.marker(finalDropoff).addTo(map).bindPopup(`<b>Drop-off:</b> ${dropoffText}`);

            // Draw route line
            const routeLine = L.polyline([finalPickup, finalDropoff], {
                color: '#d4af37',
                weight: 4,
                opacity: 0.8,
                dashArray: '6, 6'
            }).addTo(map);

            // Zoom bounds to fit both points
            map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
            setTimeout(() => map.invalidateSize(), 200);
        }

        updateMapRoute();
    }

    // Tier selection confirmation alerts
    document.querySelectorAll('.select-tier-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.price-card');
            const tierName = card.getAttribute('data-tier');
            const price = card.getAttribute('data-price');
            
            alert(`Booking confirmed! You selected the ${tierName} tier for ${price}. Our concierge team has dispatched your reservation details.`);
            window.location.href = 'index.html';
        });
    });
});