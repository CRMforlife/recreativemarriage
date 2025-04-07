// Prevent popup from showing on health-check page
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const introSection = document.getElementById('intro-section');
    const assessmentForm = document.getElementById('assessment-form');
    const resultsSection = document.getElementById('results-section');
    const startButton = document.getElementById('start-assessment');
    const healthCheckForm = document.getElementById('health-check-form');
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');
    const submitButton = document.getElementById('submit-assessment');
    const progressFill = document.getElementById('progress-fill');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const downloadResultsButton = document.getElementById('download-results');
    const shareResultsButton = document.getElementById('share-results');
    const shareModal = document.getElementById('share-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const shareForm = document.getElementById('share-form');
    
    // Question Groups
    const questionGroups = document.querySelectorAll('.question-group');
    const totalQuestions = questionGroups.length;
    let currentQuestionIndex = 0;
    
    // Results Elements
    const scoreElements = {
        'communication': document.getElementById('communication-score'),
        'emotional-connection': document.getElementById('emotional-score'),
        'trust-honesty': document.getElementById('trust-score'),
        'shared-values': document.getElementById('values-score'),
        'daily-life': document.getElementById('daily-score'),
        'intimacy': document.getElementById('intimacy-score')
    };
    
    const scoreValueElements = {
        'communication': document.getElementById('communication-score-value'),
        'emotional-connection': document.getElementById('emotional-score-value'),
        'trust-honesty': document.getElementById('trust-score-value'),
        'shared-values': document.getElementById('values-score-value'),
        'daily-life': document.getElementById('daily-score-value'),
        'intimacy': document.getElementById('intimacy-score-value')
    };
    
    const feedbackElements = {
        'communication': document.getElementById('communication-feedback'),
        'emotional-connection': document.getElementById('emotional-feedback'),
        'trust-honesty': document.getElementById('trust-feedback'),
        'shared-values': document.getElementById('values-feedback'),
        'daily-life': document.getElementById('daily-feedback'),
        'intimacy': document.getElementById('intimacy-feedback')
    };
    
    // Initialize
    totalQuestionsSpan.textContent = totalQuestions;
    updateProgress();
    
    // Event Listeners
    startButton.addEventListener('click', startAssessment);
    prevButton.addEventListener('click', goToPreviousQuestion);
    nextButton.addEventListener('click', goToNextQuestion);
    healthCheckForm.addEventListener('submit', submitAssessment);
    downloadResultsButton.addEventListener('click', downloadResults);
    
    // Share Results Modal
    shareResultsButton.addEventListener('click', function() {
        shareModal.style.display = 'block';
    });
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            shareModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });
    
    shareForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const partnerEmail = document.getElementById('partner-email').value;
        const message = document.getElementById('message').value;
        
        // Get the current results data
        const resultsData = generateResultsData();
        
        // In a real implementation, you would send this data to a server
        // For now, we'll simulate sending the email
        simulateSendingEmail(partnerEmail, message, resultsData);
        
        // Close the modal
        shareModal.style.display = 'none';
        
        // Show success message
        alert('Results sent to your partner! They will receive an email with your relationship health check results.');
    });
    
    // Functions
    function startAssessment() {
        introSection.classList.remove('active');
        assessmentForm.classList.add('active');
        showQuestion(0);
    }
    
    function showQuestion(index) {
        // Hide all question groups
        questionGroups.forEach(group => {
            group.classList.remove('active');
        });
        
        // Show the current question group
        questionGroups[index].classList.add('active');
        
        // Update navigation buttons
        prevButton.disabled = index === 0;
        nextButton.style.display = index === totalQuestions - 1 ? 'none' : 'inline-block';
        submitButton.style.display = index === totalQuestions - 1 ? 'inline-block' : 'none';
        
        // Update progress
        currentQuestionIndex = index;
        currentQuestionSpan.textContent = index + 1;
        updateProgress();
    }
    
    function updateProgress() {
        const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
        progressFill.style.width = `${progress}%`;
    }
    
    function goToPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    }
    
    function goToNextQuestion() {
        const currentGroup = questionGroups[currentQuestionIndex];
        
        if (!validateQuestionGroup(currentGroup)) {
            alert('Please answer all questions in this section before proceeding.');
            return;
        }
        
        if (currentQuestionIndex < totalQuestions - 1) {
            showQuestion(currentQuestionIndex + 1);
        }
    }
    
    function submitAssessment(e) {
        e.preventDefault();
        
        // Validate all question groups
        let isValid = true;
        questionGroups.forEach(group => {
            if (!validateQuestionGroup(group)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            alert('Please answer all questions before submitting.');
            return;
        }
        
        // Calculate scores for each category
        const scores = calculateScores();
        
        // Display results
        displayResults(scores);
        
        // Generate and display analysis
        generateAnalysis(scores);
        
        // Hide assessment form and show results
        assessmentForm.classList.remove('active');
        resultsSection.classList.add('active');
    }
    
    function calculateScores() {
        const scores = {
            'communication': 0,
            'emotional-connection': 0,
            'trust-honesty': 0,
            'shared-values': 0,
            'daily-life': 0,
            'intimacy': 0
        };
        
        // Get all answered questions
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked');
        
        // Calculate scores for each category
        answeredQuestions.forEach(input => {
            const questionElement = input.closest('.question');
            const questionGroup = questionElement.closest('.question-group');
            const category = questionGroup.dataset.category;
            
            if (category && scores.hasOwnProperty(category)) {
                scores[category] += parseInt(input.value);
            }
        });
        
        return scores;
    }
    
    function displayResults(scores) {
        // Update score bars and values
        for (const category in scores) {
            const score = scores[category];
            const scoreElement = scoreElements[category];
            const scoreValueElement = scoreValueElements[category];
            const feedbackElement = feedbackElements[category];
            
            // Update score value
            scoreValueElement.textContent = score;
            
            // Update score bar width and color
            const percentage = (score / 15) * 100;
            scoreElement.style.width = `${percentage}%`;
            
            // Set color based on score
            if (score >= 12) {
                scoreElement.className = 'score-fill green';
                feedbackElement.textContent = 'Healthy and strong. Keep nurturing this aspect of your relationship.';
            } else if (score >= 9) {
                scoreElement.className = 'score-fill yellow';
                feedbackElement.textContent = 'Worth discussing. Consider having an open conversation about this area.';
            } else {
                scoreElement.className = 'score-fill red';
                feedbackElement.textContent = 'Important to address. I recommend getting the book.';
            }
        }
    }
    
    function generateAnalysis(scores) {
        // Create analysis container if it doesn't exist
        let analysisContainer = document.getElementById('analysis-container');
        if (!analysisContainer) {
            analysisContainer = document.createElement('div');
            analysisContainer.id = 'analysis-container';
            analysisContainer.className = 'analysis-container';
            
            // Insert after results container
            const resultsContainer = document.querySelector('.results-container');
            resultsContainer.parentNode.insertBefore(analysisContainer, resultsContainer.nextSibling);
        }
        
        // Calculate overall relationship health
        let totalScore = 0;
        for (const category in scores) {
            totalScore += scores[category];
        }
        const averageScore = totalScore / Object.keys(scores).length;
        const overallHealth = averageScore >= 12 ? 'Strong' : (averageScore >= 9 ? 'Moderate' : 'Needs Attention');
        
        // Find strengths and areas for improvement
        const strengths = [];
        const improvements = [];
        
        for (const category in scores) {
            const score = scores[category];
            const categoryName = category.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            if (score >= 12) {
                strengths.push(categoryName);
            } else if (score <= 8) {
                improvements.push(categoryName);
            }
        }
        
        // Generate personalized recommendations
        const recommendations = generateRecommendations(scores, strengths, improvements);
        
        // Create analysis content
        let analysisHTML = `
            <h3>Relationship Analysis</h3>
            <div class="analysis-content">
                <div class="overall-health">
                    <h4>Overall Relationship Health: <span class="health-${overallHealth.toLowerCase().replace(' ', '-')}">${overallHealth}</span></h4>
                    <p>Your relationship shows ${overallHealth.toLowerCase()} health with an average score of ${averageScore.toFixed(1)} out of 15 across all categories.</p>
                </div>
                
                <div class="strengths-weaknesses">
                    <div class="strengths">
                        <h4>Relationship Strengths</h4>
                        ${strengths.length > 0 ? 
                            `<ul>${strengths.map(strength => `<li>${strength}</li>`).join('')}</ul>` : 
                            '<p>No specific areas scored in the "strong" range. This is normal and doesn\'t indicate problems.</p>'}
                    </div>
                    
                    <div class="improvements">
                        <h4>Areas for Growth</h4>
                        ${improvements.length > 0 ? 
                            `<ul>${improvements.map(improvement => `<li>${improvement}</li>`).join('')}</ul>` : 
                            '<p>No specific areas scored in the "needs attention" range. Great job!</p>'}
                    </div>
                </div>
                
                <div class="recommendations">
                    <h4>Personalized Recommendations</h4>
                    <ul>
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="next-steps">
                    <h4>Next Steps</h4>
                    <p>Consider discussing these results with your partner. Remember, this assessment is a starting point for conversation, not a final judgment. The goal is to increase awareness and spark meaningful dialogue about your relationship.</p>
                    <p>If you'd like to explore these topics further, consider reading "ReCreative Marriage" for practical tools and strategies to strengthen your partnership.</p>
                </div>
            </div>
        `;
        
        analysisContainer.innerHTML = analysisHTML;
    }
    
    function generateRecommendations(scores, strengths, improvements) {
        const recommendations = [];
        
        // Communication recommendations
        if (scores['communication'] < 12) {
            if (scores['communication'] < 9) {
                recommendations.push("Practice active listening techniques with your partner. Set aside dedicated time for meaningful conversations without distractions.");
            } else {
                recommendations.push("Continue to nurture your communication skills. Try introducing regular check-ins to discuss feelings and concerns.");
            }
        }
        
        // Emotional connection recommendations
        if (scores['emotional-connection'] < 12) {
            if (scores['emotional-connection'] < 9) {
                recommendations.push("Work on expressing appreciation more frequently. Small gestures of affection can significantly strengthen emotional bonds.");
            } else {
                recommendations.push("Find new ways to connect emotionally. Consider sharing daily highlights or challenges with each other.");
            }
        }
        
        // Trust & honesty recommendations
        if (scores['trust-honesty'] < 12) {
            if (scores['trust-honesty'] < 9) {
                recommendations.push("Focus on building trust through consistent honesty and reliability. Address any past betrayals or secrets that may be affecting your relationship.");
            } else {
                recommendations.push("Continue to prioritize transparency in your relationship. Discuss any areas where you feel hesitant to be fully honest.");
            }
        }
        
        // Shared values recommendations
        if (scores['shared-values'] < 12) {
            if (scores['shared-values'] < 9) {
                recommendations.push("Have open discussions about your core values and life goals. Identify areas of alignment and potential compromise.");
            } else {
                recommendations.push("Regularly revisit your shared vision for the future. Celebrate progress toward common goals.");
            }
        }
        
        // Daily life recommendations
        if (scores['daily-life'] < 12) {
            if (scores['daily-life'] < 9) {
                recommendations.push("Review your division of responsibilities and discuss any imbalances. Create a more equitable system for managing daily tasks.");
            } else {
                recommendations.push("Look for opportunities to make daily life more cooperative. Consider scheduling regular quality time together.");
            }
        }
        
        // Intimacy recommendations
        if (scores['intimacy'] < 12) {
            if (scores['intimacy'] < 9) {
                recommendations.push("Openly discuss your needs and desires regarding physical intimacy. Address any barriers to a satisfying sex life.");
            } else {
                recommendations.push("Continue to prioritize physical connection. Explore new ways to express affection and maintain intimacy.");
            }
        }
        
        // Add general recommendations based on overall score
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const averageScore = totalScore / Object.keys(scores).length;
        
        if (averageScore < 9) {
            recommendations.push("I recommend getting the book to address multiple areas of concern.");
        } else if (averageScore < 12) {
            recommendations.push("Focus on small, consistent improvements rather than trying to fix everything at once. Progress in relationships happens gradually.");
        } else {
            recommendations.push("Continue to invest in your relationship. Even strong relationships benefit from ongoing attention and nurturing.");
        }
        
        return recommendations;
    }
    
    function downloadResults() {
        // Get the current results data
        const resultsData = generateResultsData();
        
        // Format the results for download
        const formattedResults = formatResultsForDownload(resultsData);
        
        // Create a blob and download link
        const blob = new Blob([formattedResults], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relationship-health-check-results.txt';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }
    
    function formatResultsForDownload(data) {
        let formattedText = 'RELATIONSHIP HEALTH CHECK RESULTS\n\n';
        
        // Add scores
        formattedText += 'SCORES:\n';
        for (const [category, score] of Object.entries(data.scores)) {
            const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            formattedText += `${categoryName}: ${score}/5\n`;
        }
        
        // Add analysis
        formattedText += '\nANALYSIS:\n';
        formattedText += data.analysis + '\n\n';
        
        // Add strengths
        formattedText += 'STRENGTHS:\n';
        data.strengths.forEach(strength => {
            formattedText += `- ${strength}\n`;
        });
        
        // Add areas for improvement
        formattedText += '\nAREAS FOR IMPROVEMENT:\n';
        data.areasForImprovement.forEach(area => {
            formattedText += `- ${area}\n`;
        });
        
        // Add recommendations
        formattedText += '\nRECOMMENDATIONS:\n';
        data.recommendations.forEach(recommendation => {
            formattedText += `- ${recommendation}\n`;
        });
        
        return formattedText;
    }
    
    function simulateSendingEmail(email, message, resultsData) {
        console.log('Simulating email send to:', email);
        console.log('Message:', message);
        console.log('Results data:', resultsData);
        
        // In a real implementation, this would send the data to a server
        // For now, we'll just log it to the console
    }
    
    function validateQuestionGroup(group) {
        const questions = group.querySelectorAll('.question');
        let isValid = true;
        
        questions.forEach(question => {
            const selectedOption = question.querySelector('input[type="radio"]:checked');
            if (!selectedOption) {
                question.classList.add('invalid');
                isValid = false;
            } else {
                question.classList.remove('invalid');
            }
        });
        
        return isValid;
    }
    
    function generateResultsData() {
        const resultsData = {
            date: new Date().toLocaleDateString(),
            scores: {}
        };
        
        // Add scores for each category
        for (const category in scoreValueElements) {
            resultsData.scores[category] = scoreValueElements[category].textContent;
        }
        
        // Add analysis if available
        const analysisContainer = document.querySelector('.analysis-container');
        if (analysisContainer) {
            resultsData.analysis = {
                overallHealth: document.querySelector('.overall-health h3')?.textContent || '',
                strengths: Array.from(document.querySelectorAll('.strengths-list li')).map(li => li.textContent),
                improvements: Array.from(document.querySelectorAll('.improvements-list li')).map(li => li.textContent),
                recommendations: Array.from(document.querySelectorAll('.recommendations-list li')).map(li => li.textContent)
            };
        }
        
        return resultsData;
    }

    // Modal Functions
    function openShareModal() {
        const modal = document.getElementById('shareModal');
        modal.classList.add('active');
    }

    function closeShareModal() {
        const modal = document.getElementById('shareModal');
        modal.classList.remove('active');
    }

    function openDownloadModal() {
        const modal = document.getElementById('downloadModal');
        modal.classList.add('active');
    }

    function closeDownloadModal() {
        const modal = document.getElementById('downloadModal');
        modal.classList.remove('active');
    }

    // Form Validation
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validateForm(form) {
        let isValid = true;
        const emailInput = form.querySelector('#recipientEmail');
        const emailError = emailInput.nextElementSibling;

        if (!validateEmail(emailInput.value)) {
            emailInput.classList.add('error');
            emailError.style.display = 'block';
            isValid = false;
        } else {
            emailInput.classList.remove('error');
            emailError.style.display = 'none';
        }

        return isValid;
    }

    // Share Form Handler
    document.getElementById('shareForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm(e.target)) {
            return;
        }

        const email = document.getElementById('recipientEmail').value;
        const message = document.getElementById('message').value;
        
        try {
            // Here you would typically send the data to your backend
            // For now, we'll just show a success message
            alert('Results shared successfully!');
            closeShareModal();
        } catch (error) {
            console.error('Error sharing results:', error);
            alert('Failed to share results. Please try again.');
        }
    });

    // Update Progress Bar
    function updateProgressBar() {
        const totalQuestions = document.querySelectorAll('.question').length;
        const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
        const progress = (answeredQuestions / totalQuestions) * 100;
        
        const progressBar = document.querySelector('.progress');
        const progressText = document.querySelector('.progress-text');
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${answeredQuestions} of ${totalQuestions} questions answered`;
    }

    // Add event listeners for radio buttons
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const question = radio.closest('.question');
            question.classList.remove('invalid');
            updateProgressBar();
        });
    });
}); 