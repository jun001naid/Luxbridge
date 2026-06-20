// --- 1. Mobile Menu Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const menuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        if (mobileMenu.classList.contains('hidden')) {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        } else {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark');
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        });
    });
});

// --- 2. Form Submission Logic (Text Only) ---
const form = document.getElementById('contact-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    
    // UI Loading state
    submitBtn.disabled = true;
    submitText.innerText = "Sending...";
    submitSpinner.classList.remove('hidden');

    const formData = new FormData(form);
    
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show Success Overlay
            document.getElementById('success-overlay').classList.remove('hidden');
            document.getElementById('success-overlay').classList.add('flex');
            form.reset();
        } else {
            alert("Submission failed: " + data.message);
        }
        
    } catch (error) {
        alert("A network error occurred. Please check your connection and try again.");
    } finally {
        // Reset UI
        submitBtn.disabled = false;
        submitText.innerText = "Submit Enquiry";
        submitSpinner.classList.add('hidden');
    }
});

// Logic to close the success overlay
document.getElementById('close-success-btn').addEventListener('click', () => {
    document.getElementById('success-overlay').classList.add('hidden');
    document.getElementById('success-overlay').classList.remove('flex');
});
