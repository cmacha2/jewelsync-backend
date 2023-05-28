var admin = require("firebase-admin");
const privateKey = process.env.FIREBASE_PRIVATE_KEY
require('dotenv').config()

console.log(privateKey)

var serviceAccount = {
    "type": process.env.FIREBASE_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Para reemplazar los caracteres de escape de nueva línea
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
    "universal_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
};

console.log(process.env)

// const serviceAccount = require('../jewelsync-firebase-backend.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore();

module.exports = {
    db,
    admin
}
