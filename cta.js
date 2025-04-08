document.addEventListener('DOMContentLoaded', function() {
    // Function to get the API URL based on environment
    function getApiUrl() {
        return window.location.hostname === 'localhost' 
            ? 'http://localhost:3000/api'
            : 'https://api.recreativemarriage.com/api';
    }

    // Function to save interests to the server
    async function saveInterests(interests) {
        try {
            const response = await fetch(`${getApiUrl()}/responses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ interests })
            });

            if (!response.ok) {
                throw new Error('Failed to save interests');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving interests:', error);
            // Fallback to local storage if server is unavailable
            return saveInterestsLocally(interests);
        }
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

    // Handle form submission
    document.getElementById('interest-cta-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check if GDPR consent is checked
        const gdprConsent = document.getElementById('cta-gdpr-consent').checked;
        if (!gdprConsent) {
            alert('Please consent to data processing to continue.');
            return;
        }
        
        // Get selected interests
        const interests = Array.from(document.querySelectorAll('input[name="cta-interests"]:checked')).map(el => el.value);
        
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
            // Save interests to server or locally
            const result = await saveInterests(interests);
            
            // Display thank you message
            const formContainer = document.querySelector('.interest-cta-form');
            const thankYouContent = displayThankYouMessage(interests);
            
            if (formContainer) {
                formContainer.innerHTML = thankYouContent;
                console.log('Thank you message displayed successfully');
                
                // Store that interests were submitted
                localStorage.setItem('interestsSubmitted', 'true');
                
                // Scroll to the thank you message
                formContainer.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('Could not find form container element');
            }
        } catch (error) {
            console.error('Error saving interests:', error);
            alert('There was an error saving your interests. Please try again.');
        } finally {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}); 