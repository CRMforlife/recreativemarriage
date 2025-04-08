import fetch from 'node-fetch';

async function testApi() {
    try {
        // Test data submission
        const response = await fetch('http://localhost:3000/api/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                interests: ['creativity', 'empathy', 'intimacy']
            })
        });

        const result = await response.json();
        console.log('Submission result:', result);

        // Test admin login
        const loginResponse = await fetch('http://localhost:3000/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        const loginResult = await loginResponse.json();
        console.log('Login result:', loginResult);

        if (loginResult.token) {
            // Test getting responses
            const responsesResponse = await fetch('http://localhost:3000/api/responses', {
                headers: {
                    'Authorization': `Bearer ${loginResult.token}`
                }
            });

            const responses = await responsesResponse.json();
            console.log('All responses:', responses);
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testApi(); 