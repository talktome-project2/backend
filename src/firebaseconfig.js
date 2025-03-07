const admin = require('firebase-admin');
const serviceAccount = require('../talktome-50a22-firebase-adminsdk-fbsvc-57e7d332be.json');

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = messaging;