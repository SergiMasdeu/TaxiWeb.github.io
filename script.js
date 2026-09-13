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

    // Populate itinerary details automatically if URL query parameters exist
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('pickup')) {
        const pickupElem = document.getElementById('summaryPickup');
        const dropoffElem = document.getElementById('summaryDropoff');
        const dateElem = document.getElementById('summaryDate');
        const timeElem = document.getElementById('summaryTime');

        if (pickupElem) pickupElem.textContent = urlParams.get('pickup');
        if (dropoffElem) dropoffElem.textContent = urlParams.get('dropoff');
        if (dateElem) dateElem.textContent = urlParams.get('date');
        if (timeElem) timeElem.textContent = urlParams.get('time');
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