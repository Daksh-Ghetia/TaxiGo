// importScripts('https://gstatic.com/firebasejs/9.0.0/firebase-app.js');
// importScripts('https://gstatic.com/firebasejs/9.0.0/firebase-messaging.js');

// firebase.initializeApp({
//     apiKey: "AIzaSyBbq0DgIeuedDcp6fqkL-vm5SGGuA3hn4E",
  // authDomain: "my-first-project-1748f.firebaseapp.com",
  // projectId: "my-first-project-1748f",
  // storageBucket: "my-first-project-1748f.appspot.com",
  // messagingSenderId: "1061296328400",
  // appId: "1:1061296328400:web:09fc14bd0884ef5372d8d5",
  // measurementId: "G-51B0R16GMP"
// })

// const messaging = firebase.messaging();


// import { initializeApp } from "firebase/app";
// import { getMessaging } from "firebase/messaging";

// const firebaseApp = initializeApp({
//   apiKey: "AIzaSyBbq0DgIeuedDcp6fqkL-vm5SGGuA3hn4E",
//   authDomain: "my-first-project-1748f.firebaseapp.com",
//   projectId: "my-first-project-1748f",
//   storageBucket: "my-first-project-1748f.appspot.com",
//   messagingSenderId: "1061296328400",
//   appId: "1:1061296328400:web:09fc14bd0884ef5372d8d5",
//   measurementId: "G-51B0R16GMP"
// });


// const messaging = getMessaging(firebaseApp);



importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCHk1QsDZ0R6cnKY011100ylciMufQjqto",
  authDomain: "godrive-9e426.firebaseapp.com",
  projectId: "godrive-9e426",
  storageBucket: "godrive-9e426.appspot.com",
  messagingSenderId: "1079628430087",
  appId: "1:1079628430087:web:f963c478544f6d295fe3a2",
  measurementId: "G-2HYGM8Z8H3"});

const messaging = firebase.messaging();

getToken(messaging, { vapidKey: 'BL3dOkvdnJBW9Xvd9aFS7_ImSn2Z3X_XlqEq_tuvzoCplGvip5gsWNFPseT_2qSnUJyt___MS4v2Of6GrZ09-qM' }).then((currentToken) => {
  if (currentToken) {
    // Send the token to your server and update the UI if necessary
    // ...
  } else {
    // Show permission request UI
    console.log('No registration token available. Request permission to generate one.');
    // ...
  }
}).catch((err) => {
  console.log('An error occurred while retrieving token. ', err);
  // ...
});

// navigator.serviceWorker.register();