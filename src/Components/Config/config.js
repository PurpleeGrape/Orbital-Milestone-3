import firebase from 'firebase';

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAowEcAzR0DwWOvOLaAvDLgSUXXphcNTBw",
    authDomain: "planus-2019.firebaseapp.com",
    databaseURL: "https://planus-2019.firebaseio.com",
    projectId: "planus-2019",
    storageBucket: "",
    messagingSenderId: "983082953935",
    appId: "1:983082953935:web:001c9b10e5d5f53a"
  };
  // Initialize Firebase
  const fb = firebase.initializeApp(firebaseConfig);
  export default fb;