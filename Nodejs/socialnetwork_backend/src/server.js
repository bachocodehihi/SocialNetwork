require('dotenv').config({ path: __dirname + '/../.env' });
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    setInterval(async () => {
        try {
            const Account = require('./models/account.model');
            const result = await Account.deleteMany({
                isDeleted: true,
                deleteAt: { $lte: new Date() }
            });
            if (result.deletedCount > 0) {
                console.log(`[CLEANUP] Automatically permanently deleted ${result.deletedCount} expired accounts.`);
            }
        } catch (err) {
            console.error("[CLEANUP ERROR] Failed to clean up expired accounts:", err);
        }
    }, 3600000);
}).catch(err => {
    console.error("Database connection failed:", err);
});
//node src/server.js