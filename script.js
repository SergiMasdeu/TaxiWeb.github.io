document.addEventListener('DOMContentLoaded', () => {
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

    // High-Precision Google-Maps-Style Autocomplete Helper
    function setupAutocomplete(inputElementId, dropdownElementId) {
        const input = document.getElementById(inputElementId);
        const dropdown = document.getElementById(dropdownElementId);

        if (!input || !dropdown) return;

        let debounceTimer;

        input.addEventListener('input', () => {
            const query = input.value.trim();
            clearTimeout(debounceTimer);

            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const biasLat = 51.5074;
                    const biasLon = -0.1278;
                    const endpoint = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${biasLat}&lon=${biasLon}&limit=6`;
                    
                    const response = await fetch(endpoint);
                    const data = await response.json();
                    
                    dropdown.innerHTML = '';
                    if (data && data.features && data.features.length > 0) {
                        data.features.forEach(feature => {
                            const props = feature.properties;
                            
                            const primaryPart = [props.housenumber, props.name, props.street].filter(Boolean).join(' ');
                            const secondaryPart = [props.city || props.county, props.state, props.country].filter(Boolean);
                            
                            const namePieces = [primaryPart, ...secondaryPart];
                            const displayName = [...new Set(namePieces)].filter(Boolean).join(', ');

                            const item = document.createElement('div');
                            item.className = 'suggestion-item';
                            item.textContent = displayName;
                            
                            item.addEventListener('click', () => {
                                input.value = displayName;
                                dropdown.style.display = 'none';
                            });

                            dropdown.appendChild(item);
                        });
                        dropdown.style.display = 'block';
                    } else {
                        dropdown.style.display = 'none';
                    }
                } catch (error) {
                    console.error('Autocomplete fetch error:', error);
                    dropdown.style.display = 'none';
                }
            }, 200);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    setupAutocomplete('pickup', 'pickupSuggestions');
    setupAutocomplete('dropoff', 'dropoffSuggestions');

    // Helper function to calculate great-circle distance (Haversine formula)
    function calculateDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const straightLineKm = R * c;
        // Multiply by 1.2 road deviation factor to approximate real driving distance
        return straightLineKm * 1.2;
    }

    // Format hours and minutes from total distance (assuming average speed ~55 km/h accounting for city traffic)
    function formatDuration(distanceKm) {
        const avgSpeedKmh = 50; 
        const totalHours = distanceKm / avgSpeedKmh;
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        if (hours === 0) {
            return `${Math.max(minutes, 5)} mins`;
        }
        return `${hours} hr ${minutes} mins`;
    }

    // Dynamic Itinerary & OpenStreetMap Rendering via Leaflet
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

        const map = L.map('osmMap', { zoomControl: false }).setView([51.5074, -0.1278], 11);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd'
        }).addTo(map);

        async function getCoordinates(address) {
            try {
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`);
                const data = await response.json();
                if (data && data.features && data.features.length > 0) {
                    const coords = data.features[0].geometry.coordinates; // [lon, lat]
                    return [coords[1], coords[0]]; // Converted to [lat, lon] for Leaflet
                }
            } catch (error) {
                console.error("Geocoding error:", error);
            }
            return null;
        }

        async function updateMapRoute() {
            const [pickupCoords, dropoffCoords] = await Promise.all([
                getCoordinates(pickupText),
                getCoordinates(dropoffText)
            ]);

            const finalPickup = pickupCoords || [51.5074, -0.1278]; 
            const finalDropoff = dropoffCoords || [50.8503, 4.3517]; 

            // Calculate distance & time values
            const distanceKm = calculateDistanceKm(finalPickup[0], finalPickup[1], finalDropoff[0], finalDropoff[1]);
            const durationText = formatDuration(distanceKm);

            // Update UI elements on itinerary page
            document.getElementById('summaryDistance').textContent = `${distanceKm.toFixed(1)} km`;
            document.getElementById('summaryDuration').textContent = durationText;

            L.marker(finalPickup).addTo(map).bindPopup(`<b>Pickup:</b> ${pickupText}`);
            L.marker(finalDropoff).addTo(map).bindPopup(`<b>Drop-off:</b> ${dropoffText}`);

            const routeLine = L.polyline([finalPickup, finalDropoff], {
                color: '#d4af37',
                weight: 4,
                opacity: 0.8,
                dashArray: '6, 6'
            }).addTo(map);

            map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
            setTimeout(() => map.invalidateSize(), 200);
        }

        updateMapRoute();
    }

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