const admin = require("firebase-admin");
let serviceAccount;

try {
  serviceAccount = require("./firebaseServiceAccount.json");
  
  if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  } else {
    console.error("❌ Firebase Service Account Error: private_key is missing!");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin Initialized");
} catch (error) {
  console.warn("⚠️ Firebase Service Account Not Found or Invalid. Firebase features will be disabled.");
  console.warn("Error details:", error.message);

  // Mock messaging and other used features to prevent server crashes
  if (!admin.apps.length) {
    // We don't initialize because we don't have credentials
    // But we can patch the admin object to avoid crashes on method calls
    admin.messaging = () => ({
      send: async (msg) => {
        console.warn("⚠️ Firebase messaging.send() called but Firebase is not initialized.");
        return null;
      },
      sendToDevice: async () => {
        console.warn("⚠️ Firebase sendToDevice() called but Firebase is not initialized.");
        return null;
      },
      subscribeToTopic: async (token, topic) => {
        console.warn(`⚠️ Firebase subscribeToTopic(${topic}) called but Firebase is not initialized.`);
        return { success: false, message: "Firebase not initialized" };
      },
      unsubscribeFromTopic: async (token, topic) => {
        console.warn(`⚠️ Firebase unsubscribeFromTopic(${topic}) called but Firebase is not initialized.`);
        return { success: false, message: "Firebase not initialized" };
      }
    });
  }
}

module.exports = admin;
