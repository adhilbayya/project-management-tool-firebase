// firebaseAdmin.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "firebase-service-account.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
