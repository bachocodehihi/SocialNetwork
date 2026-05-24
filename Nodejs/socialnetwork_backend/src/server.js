require('dotenv').config({ path: __dirname + '/../.env' });
console.log('=== ENVIRONMENT VARIABLES KEYS ===');
console.log(Object.keys(process.env).filter(key => !['PATH', 'LS_COLORS', 'SSH_AUTH_SOCK', 'SSH_CLIENT', 'SSH_CONNECTION', 'SSH_TTY', 'TERM'].includes(key)));
console.log('=== END ===');

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
}).catch(err => {
    console.error("Database connection failed:", err);
});
//node src/server.js