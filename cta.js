document.addEventListener('DOMContentLoaded', function() {
    // Handle CTA form submission
    const ctaForm = document.getElementById('interest-cta-form');
    if (ctaForm) {
        ctaForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Check if GDPR consent is checked
            const gdprConsent = document.getElementById('cta-gdpr-consent').checked;
            if (!gdprConsent) {
                alert('Please consent to data processing to continue.');
                return;
            }
            
            // Get selected interests
            const interests = Array.from(document.querySelectorAll('#interest-cta-form input[name="interests"]:checked')).map(el => el.value);
            
            if (interests.length === 0) {
                alert('Please select at least one topic of interest.');
                return;
            }
            
            try {
                // Send data to server
                const response = await fetch('http://localhost:3000/api/save-interests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ interests })
                });
                
                if (response.ok) {
                    // Show thank you message
                    const formContainer = ctaForm.parentElement;
                    formContainer.innerHTML = `
                        <div class="thank-you-message">
                            <h3>Thank You!</h3>
                            <p>We appreciate your feedback and will use this information to provide you with relevant content.</p>
                        </div>
                    `;
                } else {
                    throw new Error('Failed to save interests');
                }
            } catch (error) {
                console.error('Error saving interests:', error);
                alert('There was an error saving your preferences. Please try again later.');
            }
        });
    }
}); 