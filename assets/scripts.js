document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('mainHeader');

    // Header Scroll Effect (Glassmorphism)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Form Submission Feedback
    const form = document.getElementById('bookingForm');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('.btn-grad');
            btn.innerText = "Processing Reservation...";
            btn.style.opacity = "0.7";

            setTimeout(() => {
                alert("Confirmation Sent! Our concierge will call you shortly.");
                btn.innerText = "Confirm Booking";
                btn.style.opacity = "1";
                form.reset();
            }, 2000);
        });
    }

    // Fade-in Animation on Scroll
    const observerOptions = { threshold: 0.1 };
    const observer =