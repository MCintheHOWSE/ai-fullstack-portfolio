import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const testFullFlow = async () => {
    const baseUrl = 'http://localhost:3000/api';
    const password = 'password123';

    const post = async (url, body) => {
        const res = await fetch(baseUrl + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    };

    const put = async (url, body) => {
        const res = await fetch(baseUrl + url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        return res.json();
    };

    try {
        console.log('1. Seeding users...');
        const { stdout } = await execPromise('node server/seed_test_users.js');
        // The output might contain other logs, so we need to find the JSON part
        const lines = stdout.trim().split('\n');
        const jsonLine = lines[lines.length - 1]; // Assuming JSON is the last line
        const users = JSON.parse(jsonLine);

        const raterId = users.userA.id;
        const ratedId = users.userB.id;
        const ratedEmail = users.userB.email;

        console.log(`   Rater ID: ${raterId}, Rated ID: ${ratedId}`);

        console.log('2. User A posts errand...');
        const errand = await post('/errands', {
            user_id: raterId,
            item: 'Test Errand',
            shop_location: 'Shop',
            meet_location: 'Dorm',
            price: 100,
            destination: 'Dorm'
        });
        const errandId = errand.data.id;
        console.log(`   Errand ID: ${errandId}`);

        console.log('3. User B accepts errand...');
        await put(`/errands/${errandId}/accept`, { runner_id: ratedId });

        console.log('4. Both confirm completion...');
        await post(`/errands/${errandId}/confirm`, { user_id: raterId });
        const confirmRes = await post(`/errands/${errandId}/confirm`, { user_id: ratedId });

        if (confirmRes.status !== 'completed') throw new Error('Errand not completed');
        console.log('   Errand status: completed');

        console.log('5. User A rates User B (5 stars)...');
        const ratingRes = await post('/ratings', {
            from_user_id: raterId,
            to_user_id: ratedId,
            service_type: 'errand',
            service_id: errandId,
            score: 5.0,
            comment: 'Excellent!'
        });
        console.log(`   Rating Response:`, ratingRes);

        console.log('6. Verifying User B rating...');
        // We can check by logging in as User B
        const loginRes = await post('/login', { email: ratedEmail, password });
        const userData = loginRes.data;
        console.log(`   User B Rating: ${userData.rating} (${userData.rating_count} reviews)`);

        if (userData.rating === 5 && userData.rating_count === 1) {
            console.log('\n✅ TEST PASSED: Full rating flow verified.');
        } else {
            console.log('\n❌ TEST FAILED: Rating mismatch.');
        }

    } catch (error) {
        console.error('\n❌ TEST ERROR:', error);
    }
};

testFullFlow();
