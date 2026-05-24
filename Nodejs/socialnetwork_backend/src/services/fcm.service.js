const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

if (!admin.apps.length) {
    let credential;
    const firebaseEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
    const localFilePath = path.join(__dirname, '../firebase-service-account.json');

    if (firebaseEnv) {
        // Server: đọc từ biến môi trường Railway
        try {
            const serviceAccount = JSON.parse(firebaseEnv);
            credential = admin.credential.cert(serviceAccount);
            console.log('✅ Firebase initialized from ENV');
        } catch (e) {
            console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
        }
    } else if (fs.existsSync(localFilePath)) {
        // Local: đọc từ file JSON
        credential = admin.credential.cert(localFilePath);
        console.log('✅ Firebase initialized from local file');
    } else {
        console.warn('⚠️ No Firebase credentials found! FCM will not work.');
        admin.initializeApp();
    }

    if (credential) {
        admin.initializeApp({ credential });
    }
}

const _removeInvalidToken = async (fcmToken) => {
    try {
        const Account = require('../models/account.model');
        await Account.findOneAndUpdate({ fcmToken }, { fcmToken: null });
        console.log('🗑️ Removed invalid FCM token');
    } catch (e) {
        console.error('Error removing FCM token:', e.message);
    }
};

const sendMessageNotification = async ({ fcmToken, senderName, senderAvatar, message, conversationId, groupName }) => {
    if (!fcmToken) return;
    try {
        const title = groupName ? groupName : senderName;
        const body = groupName
            ? `${senderName}: ${message}`
            : (message.length > 100 ? message.substring(0, 100) + '...' : message);

        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: title,
                body: body,
            },
            android: {
                priority: 'high',
            },
            apns: {
                headers: { 'apns-priority': '10' },
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                        'mutable-content': 1,
                        'content-available': 1,
                    },
                },
            },

            data: {
                type: 'message',
                conversationId: conversationId.toString(),
                senderName,
                senderAvatar: senderAvatar || '',
                title: title,
                body: body,
            },
        });
        console.log('📱 FCM message sent → ' + senderName);
    } catch (err) {
        if (
            err.code === 'messaging/registration-token-not-registered' ||
            err.code === 'messaging/invalid-registration-token'
        ) {
            await _removeInvalidToken(fcmToken);
        } else {
            console.error('❌ FCM sendMessage error:', err.message);
        }
    }
};

const sendCallNotification = async ({ fcmToken, callerName, callerAvatar, callType, callId, conversationId }) => {
    if (!fcmToken) return;
    try {
        const title = callerName;
        const body = callType === 'video' ? '📹 Cuộc gọi video đến' : '📞 Cuộc gọi thoại đến';

        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: title,
                body: body,
            },
            android: {
                priority: 'high',
            },
            apns: {
                headers: { 'apns-priority': '10' },
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                        'content-available': 1,
                    },
                },
            },
            data: {
                type: 'call',
                callId: callId.toString(),
                callType,
                callerName,
                callerAvatar: callerAvatar || '',
                conversationId: conversationId.toString(),
                title: title,
                body: body,
            },
        });
        console.log('📱 FCM call sent → ' + callerName);
    } catch (err) {
        if (
            err.code === 'messaging/registration-token-not-registered' ||
            err.code === 'messaging/invalid-registration-token'
        ) {
            await _removeInvalidToken(fcmToken);
        } else {
            console.error('❌ FCM sendCall error:', err.message);
        }
    }
};

const sendFriendRequestNotification = async ({ fcmToken, senderName, senderAvatar, senderId }) => {
    if (!fcmToken) return;
    try {
        const title = 'Lời mời kết bạn';
        const body = senderName + ' đã gửi lời mời kết bạn';

        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: title,
                body: body,
            },
            android: {
                priority: 'high',
            },
            apns: {
                headers: { 'apns-priority': '10' },
                payload: {
                    aps: { sound: 'default', badge: 1 },
                },
            },
            data: {
                type: 'friend_request',
                senderId: senderId.toString(),
                senderName,
                senderAvatar: senderAvatar || '',
                title: title,
                body: body,
            },
        });
        console.log('📱 FCM friend request sent → ' + senderName);
    } catch (err) {
        if (
            err.code === 'messaging/registration-token-not-registered' ||
            err.code === 'messaging/invalid-registration-token'
        ) {
            await _removeInvalidToken(fcmToken);
        } else {
            console.error('❌ FCM sendFriendRequest error:', err.message);
        }
    }
};

const sendPushNotification = async ({ fcmToken, title, body, type, relatedId, senderName, senderAvatar }) => {
    if (!fcmToken) return;
    try {
        await admin.messaging().send({
            token: fcmToken,
            notification: {
                title: title,
                body: body,
            },
            android: {
                priority: 'high',
            },
            apns: {
                headers: { 'apns-priority': '10' },
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                        'content-available': 1,
                    },
                },
            },
            data: {
                type: type || 'notification',
                relatedId: relatedId ? relatedId.toString() : '',
                senderName: senderName || '',
                senderAvatar: senderAvatar || '',
                title: title,
                body: body,
            },
        });
        console.log(`📱 FCM Generic Notification Sent → Title: "${title}"`);
    } catch (err) {
        if (
            err.code === 'messaging/registration-token-not-registered' ||
            err.code === 'messaging/invalid-registration-token'
        ) {
            await _removeInvalidToken(fcmToken);
        } else {
            console.error('❌ FCM sendPushNotification error:', err.message);
        }
    }
};

module.exports = {
    sendMessageNotification,
    sendCallNotification,
    sendFriendRequestNotification,
    sendPushNotification
};