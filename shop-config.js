/* Public URLs and Firebase WEB app config only. Never put Stripe secret keys here. */
window.GA_STORE_CONFIG = {
  functionsBase: "https://us-central1-YOUR_FIREBASE_PROJECT_ID.cloudfunctions.net",
  firebase: {
    apiKey: "YOUR_FIREBASE_WEB_API_KEY",
    authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    appId: "YOUR_FIREBASE_WEB_APP_ID"
  }
};
