
const testRating = async () => {
    const from_user_id = 1; // Admin
    const to_user_id = 17; // Test User (test_login@scu.edu.tw)
    const score = 4.5;
    const comment = "Great service!";

    console.log('Submitting rating...');
    try {
        const response = await fetch('http://localhost:3000/api/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from_user_id,
                to_user_id,
                service_type: 'errand',
                service_id: 999, // Dummy ID
                score,
                comment
            })
        });
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);

        if (response.ok) {
            console.log('\nVerifying user rating...');
            // Check user profile via login or direct DB check (simulated via login here for simplicity if endpoint existed, but we'll trust the response new_rating for now)
            console.log(`New Rating for user ${to_user_id}: ${data.new_rating}`);
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

testRating();
