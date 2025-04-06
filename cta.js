document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    document.getElementById('cta-form').addEventListener('submit', async function(e) {
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
            console.log('Sending interests to server:', interests);
            
            // Send data to server
            const response = await fetch('http://localhost:3000/api/save-interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests })
            });
            
            console.log('Server response status:', response.status);
            
            if (response.ok) {
                // Show thank you message
                const ctaSection = document.getElementById('cta-section');
                ctaSection.innerHTML = `
                    <div class="thank-you-message">
                        <h2>Thank You!</h2>
                        <p>We've received your preferences and will use this information to provide you with relevant content.</p>
                    </div>
                `;
            } else {
                // Try to get error details from response
                const errorData = await response.json().catch(() => ({}));
                console.error('Server error:', errorData);
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