import { query } from './src/config/database.js';

const run = async () => {
    try {
        const r = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'sent_emails'`);
        console.log('Columns in sent_emails:', r.rows.map(row => row.column_name));
        
        // Also try adding columns if they don't exist
        await query(`ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255)`);
        await query(`ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(255)`);
        console.log('Columns added/verified');
        
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
};

run();
