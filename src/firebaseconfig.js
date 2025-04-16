const admin = require('firebase-admin');
const serviceAccount = require('../talktome-50a22-firebase-adminsdk-fbsvc-bcda6af5d3.json');

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = messaging;