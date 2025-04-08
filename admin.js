document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';
    let token = localStorage.getItem('adminToken');

    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout');
    const exportButton = document.getElementById('export-csv');
    const responsesTable = document.getElementById('responses-table');
    const responsesBody = document.getElementById('responses-body');
    const totalResponsesElement = document.getElementById('total-responses');
    const todayResponsesElement = document.getElementById('today-responses');

    // Check if user is logged in
    function checkAuth() {
        if (token) {
            showDashboard();
            fetchResponses();
        } else {
            showLogin();
        }
    }

    // Show/Hide sections
    function showLogin() {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }

    function showDashboard() {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
    }

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                token = data.token;
                localStorage.setItem('adminToken', token);
                showDashboard();
                fetchResponses();
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });

    // Handle logout
    logoutButton.addEventListener('click', () => {
        token = null;
        localStorage.removeItem('adminToken');
        showLogin();
    });

    // Fetch responses
    async function fetchResponses() {
        try {
            const response = await fetch(`${API_URL}/responses`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                displayResponses(data);
                updateStats(data);
            } else {
                if (response.status === 401) {
                    token = null;
                    localStorage.removeItem('adminToken');
                    showLogin();
                }
                throw new Error('Failed to fetch responses');
            }
        } catch (error) {
            console.error('Error fetching responses:', error);
            alert('Failed to fetch responses. Please try again.');
        }
    }

    // Display responses in table
    function displayResponses(responses) {
        responsesBody.innerHTML = '';
        
        responses.forEach(response => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(response.submittedAt).toLocaleString()}</td>
                <td>${response.interests.join(', ')}</td>
                <td>${response.userAgent}</td>
                <td>${response.ipAddress}</td>
            `;
            responsesBody.appendChild(row);
        });
    }

    // Update statistics
    function updateStats(responses) {
        totalResponsesElement.textContent = responses.length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayResponses = responses.filter(response => {
            const responseDate = new Date(response.submittedAt);
            return responseDate >= today;
        });

        todayResponsesElement.textContent = todayResponses.length;
    }

    // Handle CSV export
    exportButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/responses/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'responses.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                throw new Error('Failed to export responses');
            }
        } catch (error) {
            console.error('Error exporting responses:', error);
            alert('Failed to export responses. Please try again.');
        }
    });

    // Initialize
    checkAuth();
}); 