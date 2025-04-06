document.addEventListener('DOMContentLoaded', function() {
    // Function to check if the device is mobile
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }

    // Function to get the API URL based on environment
    function getApiUrl() {
        // Check if we're on GitHub Pages
        if (window.location.hostname.includes('github.io')) {
            // For GitHub Pages, use a serverless function or static JSON
            // For now, we'll simulate success and store in localStorage
            return 'static';
        }
        return 'http://localhost:3000';
    }

    // Function to save interests locally when API is not available
    async function saveInterestsLocally(interests) {
        try {
            // Get existing data from localStorage
            const existingData = localStorage.getItem('savedInterests');
            const data = existingData ? JSON.parse(existingData) : { interests: [] };
            
            // Add new entry
            const newEntry = {
                id: Date.now(),
                submitted_at: new Date().toISOString(),
                interests: interests
            };
            
            data.interests.push(newEntry);
            
            // Save back to localStorage
            localStorage.setItem('savedInterests', JSON.stringify(data));
            
            return {
                ok: true,
                json: () => ({ message: 'Interests saved successfully', data: newEntry })
            };
        } catch (error) {
            console.error('Error saving interests locally:', error);
            throw error;
        }
    }

    // Function to display thank you message
    function displayThankYouMessage(interests) {
        const interestsList = interests.map(interest => {
            switch(interest) {
                case 'creativity':
                    return 'Creativity and imagination in relationships';
                case 'empathy':
                    return 'Empathy, communication, and constructive dialogue';
                case 'intimacy':
                    return 'Emotional connection and intimacy';
                case 'conflict':
                    return 'Constructive handling of disagreements';
                case 'imagination':
                    return 'Using imagination to strengthen the relationship';
                default:
                    return interest;
            }
        });

        const thankYouHTML = `
            <div class="thank-you-container">
                <h2>💛 Thank You for Sharing Your Interests!</h2>
                
                <p>We truly appreciate you taking the time to let us know what topics matter most to you. Your selections help us tailor our content to better support your journey in building a deeper, more imaginative, and connected relationship.</p>
                
                <div class="selected-interests">
                    <h3>We're excited to bring you insights, tools, and inspiration around:</h3>
                    <ul>
                        ${interestsList.map(interest => `<li>${interest}</li>`).join('')}
                    </ul>
                </div>
                
                <p>✨ Stay tuned — we'll be in touch soon with personalized content crafted just for you.</p>
                
                <div class="cta-section">
                    <h3>📘 Ready to Go Deeper?</h3>
                    <p>Explore our full guide to relationship growth and creativity — now available on Amazon.</p>
                    <a href="https://a.co/d/bp4vWb1" class="cta-button" target="_blank" rel="noopener">
                        👉 Order Your Copy on Amazon
                    </a>
                    <p class="closing-text">Let the transformation begin — one imaginative step at a time.</p>
                </div>
            </div>
        `;

        return thankYouHTML;
    }

    // Only show popup if not on mobile and hasn't been shown before
    if (!localStorage.getItem('popupShown') && !isMobileDevice()) {
        // Show popup after a short delay
        setTimeout(() => {
            document.getElementById('interest-popup-overlay').classList.add('active');
        }, 3000); // Show after 3 seconds
    }

    // Close popup when clicking the close button
    document.getElementById('close-popup').addEventListener('click', function() {
        document.getElementById('interest-popup-overlay').classList.remove('active');
        localStorage.setItem('popupShown', 'true');
    });

    // Close popup when clicking outside
    document.getElementById('interest-popup-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            localStorage.setItem('popupShown', 'true');
        }
    });

    // Handle form submission
    document.getElementById('interest-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check if GDPR consent is checked
        const gdprConsent = document.getElementById('gdpr-consent').checked;
        if (!gdprConsent) {
            alert('Please consent to data processing to continue.');
            return;
        }
        
        // Get selected interests
        const interests = Array.from(document.querySelectorAll('input[name="interests"]:checked')).map(el => el.value);
        
        if (interests.length === 0) {
            alert('Please select at least one topic of interest.');
            return;
        }
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Saving...';
        submitButton.disabled = true;
        
        try {
            console.log('Sending interests:', interests);
            
            let response;
            const apiUrl = getApiUrl();
            
            if (apiUrl === 'static') {
                response = await saveInterestsLocally(interests);
            } else {
                response = await fetch(`${apiUrl}/api/save-interests`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interests })
                });
            }
            
            console.log('Response status:', response.ok);
            
            if (response.ok) {
                // Replace popup content with thank you message
                const popupContent = document.querySelector('.interest-popup');
                popupContent.innerHTML = displayThankYouMessage(interests);
                
                // Set a timeout to close the popup after 10 seconds
                setTimeout(() => {
                    document.getElementById('interest-popup-overlay').classList.remove('active');
                    localStorage.setItem('popupShown', 'true');
                }, 10000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error:', errorData);
                throw new Error(errorData.error || 'Failed to save interests');
            }
        } catch (error) {
            console.error('Error saving interests:', error);
            alert('There was an error saving your preferences: ' + error.message + '. Please try again later.');
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}); 