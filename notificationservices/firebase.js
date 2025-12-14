const admin = require("firebase-admin");
const serviceAccount = require("./life2rich-firebase-adminsdk-fbsvc-5fc4bd16f6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
