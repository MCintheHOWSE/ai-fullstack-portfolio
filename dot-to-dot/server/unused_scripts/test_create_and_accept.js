import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const test = async () => {
    // 1. Create Errand
    console.log('Creating errand...');
    const createRes = await fetch('http://localhost:3000/api/errands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: 17, // Test User
            item: 'Notification Test 4',
            shop_location: 'Shop',
            meet_location: 'Meet',
            price: 10
        })
    });
    const createData = await createRes.json();
    console.log('Create Result:', createData);
    const errandId = createData.id;

    if (!errandId) {
        console.error('Failed to create errand');
        return;
    }

    // 2. Accept Errand
    console.log(`Accepting errand ${errandId}...`);
    const acceptRes = await fetch(`http://localhost:3000/api/errands/${errandId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runner_id: 5 }) // Admin
    });
    const acceptData = await acceptRes.json();
    console.log('Accept Result:', acceptData);

    // 3. Read Log
    console.log('--- Server Log ---');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const logFile = path.resolve(__dirname, 'debug.log');

    if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf8');
        console.log(logContent);
    } else {
        console.log('Log file not found.');
    }
};

test();
