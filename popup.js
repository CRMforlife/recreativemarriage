document.addEventListener('DOMContentLoaded', function() {
    // Check if the popup has been shown before
    if (!localStorage.getItem('popupShown')) {
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
            console.log('Sending interests to server:', interests);
            
            // Send data to server
            const response = await fetch('http://localhost:3000/api/save-interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests })
            });
            
            console.log('Server response status:', response.status);
            
            if (response.ok) {
                // Hide popup and mark as shown
                document.getElementById('interest-popup-overlay').classList.remove('active');
                localStorage.setItem('popupShown', 'true');
                
                // Show thank you message
                alert('Thank you for your response! We\'ll use this information to provide you with relevant content.');
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