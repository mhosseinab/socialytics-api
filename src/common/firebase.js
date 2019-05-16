'use strict';

const admin = require("firebase-admin");

//export GOOGLE_APPLICATION_CREDENTIALS="/home/ubuntu/workspace/socialytics/socialyticsme-firebase-adminsdk.json"
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://socialyticsme.firebaseio.com"
});

const firestore = admin.firestore();

module.exports = { firestore }