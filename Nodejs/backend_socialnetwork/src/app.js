const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoute = require('./routes/auth.route');
const accountRoute = require('./routes/account.route');
const contactRoute = require('./routes/contact.route');
const contentRoute = require('./routes/content.route');
const messageRoute = require('./routes/message.route');
const groupRoute = require('./routes/group.route');
const notificationRoute = require('./routes/notification.route');

app.use('/api/auth', authRoute);
app.use('/api/account', accountRoute);
app.use('/api/contact', contactRoute);
app.use('/api/content', contentRoute);
app.use('/api/message', messageRoute);
app.use('/api/groups', groupRoute);
app.use('/api/notification', notificationRoute);

app.get('/', (req, res) => {
    res.send('Social Network API Server is running');
});

module.exports = app;