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

    // Header scroll transparency effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Populate itinerary details & render OpenStreetMap if on itinerary page
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

        // Initialize OpenStreetMap via Leaflet (Centered around London coordinates as default)
        const map = L.map('osmMap', { zoomControl: false }).setView([51.5074, -0.1278], 11);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Approximate coordinates for route demonstration (Pickup: Central London, Dropoff: Heathrow)
        const pickupCoords = [51.5074, -0.1278];
        const dropoffCoords = [51.4700, -0.4543];

        // Add markers
        const pickupMarker = L.marker(pickupCoords).addTo(map).bindPopup(`<b>Pickup:</b> ${pickupText}`);
        const dropoffMarker = L.marker(dropoffCoords).addTo(map).bindPopup(`<b>Drop-off:</b> ${dropoffText}`);

        // Draw line connecting the route
        const routeLine = L.polyline([pickupCoords, dropoffCoords], {
            color: '#d4af37',
            weight: 4,
            opacity: 0.8,
            dashArray: '6, 6'
        }).addTo(map);

        // Fit map bounds to show both points clearly
        map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
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