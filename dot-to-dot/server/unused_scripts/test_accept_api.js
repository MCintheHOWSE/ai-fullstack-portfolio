

const testAccept = async () => {
    const errandId = 8; // Notification Test 3
    const runnerId = 5; // Admin

    console.log(`Attempting to accept errand ${errandId} with runner ${runnerId}...`);

    try {
        const response = await fetch(`http://localhost:3000/api/errands/${errandId}/accept`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ runner_id: runnerId }),
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', data);
    } catch (error) {
        console.error('Error:', error);
    }
};

testAccept();
