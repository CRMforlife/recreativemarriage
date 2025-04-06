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
        'shared-values': document.getElementById('values-score')
    };
    
    const scoreValueElements = {
        'communication': document.getElementById('communication-score-value'),
        'emotional-connection': document.getElementById('emotional-score-value'),
        'trust-honesty': document.getElementById('trust-score-value'),
        'shared-values': document.getElementById('values-score-value')
    };
    
    const feedbackElements = {
        'communication': document.getElementById('communication-feedback'),
        'emotional-connection': document.getElementById('emotional-feedback'),
        'trust-honesty': document.getElementById('trust-feedback'),
        'shared-values': document.getElementById('values-feedback')
    };
    
    // Initialize
    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = totalQuestions;
        updateProgress();
    }
    
    // Event Listeners
    if (startButton) {
        startButton.addEventListener('click', startAssessment);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', goToPreviousQuestion);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', goToNextQuestion);
    }
    
    if (healthCheckForm) {
        healthCheckForm.addEventListener('submit', submitAssessment);
    }
    
    if (downloadResultsButton) {
        downloadResultsButton.addEventListener('click', downloadResults);
    }
    
    // Share Results Modal
    if (shareResultsButton && shareModal) {
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
    }
    
    if (shareForm) {
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
    }
    
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
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }
    
    function goToPreviousQuestion() {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    }
    
    function goToNextQuestion() {
        if (currentQuestionIndex < totalQuestions - 1) {
            showQuestion(currentQuestionIndex + 1);
        }
    }
    
    function submitAssessment(e) {
        e.preventDefault();
        
        // Calculate scores for each category
        const scores = calculateScores();
        
        // Display results
        displayResults(scores);
        
        // Hide assessment form and show results
        assessmentForm.classList.remove('active');
        resultsSection.classList.add('active');
    }
    
    function calculateScores() {
        const scores = {
            'communication': 0,
            'emotional-connection': 0,
            'trust-honesty': 0,
            'shared-values': 0
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
            if (scores.hasOwnProperty(category)) {
                const score = scores[category];
                const scoreElement = scoreElements[category];
                const scoreValueElement = scoreValueElements[category];
                const feedbackElement = feedbackElements[category];
                
                if (scoreElement && scoreValueElement && feedbackElement) {
                    // Update score value
                    scoreValueElement.textContent = score;
                    
                    // Calculate percentage (assuming max score of 15)
                    const percentage = (score / 15) * 100;
                    
                    // Update score bar width and color
                    scoreElement.style.width = `${percentage}%`;
                    
                    // Determine color class based on score
                    if (percentage >= 80) {
                        scoreElement.className = 'score-fill green';
                        feedbackElement.textContent = getFeedback(category, 'high');
                    } else if (percentage >= 60) {
                        scoreElement.className = 'score-fill yellow';
                        feedbackElement.textContent = getFeedback(category, 'medium');
                    } else {
                        scoreElement.className = 'score-fill red';
                        feedbackElement.textContent = getFeedback(category, 'low');
                    }
                }
            }
        }
    }
    
    function getFeedback(category, level) {
        const feedback = {
            'communication': {
                'high': 'Excellent communication skills! You maintain open and effective dialogue.',
                'medium': 'Good foundation in communication. Consider working on deeper conversations.',
                'low': 'Communication could use some work. Focus on active listening and expressing feelings.'
            },
            'emotional-connection': {
                'high': 'Strong emotional bond! You share deep understanding and support.',
                'medium': 'Decent emotional connection. Try to deepen your emotional intimacy.',
                'low': 'Work on building emotional trust and showing more affection.'
            },
            'trust-honesty': {
                'high': 'Strong foundation of trust! Keep nurturing this vital aspect.',
                'medium': 'Good level of trust. Continue building transparency.',
                'low': 'Focus on rebuilding trust through consistent honest communication.'
            },
            'shared-values': {
                'high': 'Well-aligned values and vision! You are on the same page.',
                'medium': 'Some shared values present. Discuss future goals more often.',
                'low': 'Take time to discuss and align your values and future vision.'
            }
        };
        
        return feedback[category][level];
    }
    
    function downloadResults() {
        const scores = calculateScores();
        let content = 'Relationship Health Check Results\n\n';
        
        for (const category in scores) {
            if (scores.hasOwnProperty(category)) {
                const score = scores[category];
                const percentage = (score / 15) * 100;
                content += `${category.replace('-', ' ').toUpperCase()}\n`;
                content += `Score: ${score}/15 (${percentage.toFixed(1)}%)\n`;
                content += `${getFeedback(category, percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low')}\n\n`;
            }
        }
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relationship-health-check-results.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    
    function generateResultsData() {
        const scores = calculateScores();
        return {
            scores,
            feedback: Object.keys(scores).reduce((acc, category) => {
                const score = scores[category];
                const percentage = (score / 15) * 100;
                acc[category] = getFeedback(category, percentage >= 80 ? 'high' : percentage >= 60 ? 'medium' : 'low');
                return acc;
            }, {})
        };
    }
    
    function simulateSendingEmail(email, message, data) {
        console.log('Simulating email send to:', email);
        console.log('Message:', message);
        console.log('Results data:', data);
    }
}); 