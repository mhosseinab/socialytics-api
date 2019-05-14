'use strict';

const admin = require("firebase-admin");

//export GOOGLE_APPLICATION_CREDENTIALS="~/workspace/socialytics/socialyticsme-firebase-adminsdk.json"
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://socialyticsme.firebaseio.com"
});

const db = admin.firestore();
const userdata = db.collection('userdata');

const GetDoc = (dbref, userdoc) => {
  return new Promise((resolve, reject) => {

    dbref.doc(userdoc).get()
    .then(doc => {
      if (!doc.exists) {
        console.log('No such document: ' + userdoc);
        reject(Error("No such document"))
      } else {
        resolve(doc);
      }
    })
    .catch(err => {
      console.log('Error getting document', err);
      reject(err)
    });
  

  });
}

GetDoc(userdata, '8pJyWXyURtsefqrHFe22')
.then(doc => {
  console.log(doc)
  console.log(doc.id, '=>', doc.data());
})
.catch(err => {
  console.log('Error getting document', err);
});

module.exports = {
  db,
  userdata,
  GetDoc
}
