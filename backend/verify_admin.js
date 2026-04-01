async function verifyAdminEndpoints() {
    try {
        console.log('Logging in as admin...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@demo.com',
                password: 'password'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Login failed: ' + JSON.stringify(loginData));
        console.log('Login successful.');

        console.log('Fetching admin stats...');
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const text = await statsRes.text();
        try {
            const statsData = JSON.parse(text);
            console.log('Admin Stats:', statsData);
        } catch (e) {
            console.error('Failed to parse JSON. Raw response:', text);
        }

    } catch (error) {
        console.error('Admin Verification failed:', error);
    }
}

verifyAdminEndpoints();
