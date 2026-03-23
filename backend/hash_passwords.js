const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
(async () => {
    try {
        const pool = mysql.createPool({ host: 'localhost', user: 'root', password: 'priya123', database: 'bicycle_hub'});
        const adminHash = bcrypt.hashSync('admin123', 10);
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [adminHash, 'admin@bicyclehub.com']);
        const userHash = bcrypt.hashSync('user123', 10);
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [userHash, 'user@bicyclehub.com']);
        console.log('Successfully updated hashes');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
})();
