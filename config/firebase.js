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

  // Wrap messaging to handle potential credential errors during runtime
  const originalMessaging = admin.messaging;
  admin.messaging = function() {
    const msging = originalMessaging.apply(this, arguments);
    return {
      send: async (msg) => {
        try { return await msging.send(msg); }
        catch (err) {
          console.error("⚠️ Firebase send() error:", err.message);
          return null;
        }
      },
      subscribeToTopic: async (token, topic) => {
        try { return await msging.subscribeToTopic(token, topic); }
        catch (err) {
          console.error(`⚠️ Firebase subscribeToTopic(${topic}) error:`, err.message);
          return { success: false, message: err.message };
        }
      },
      unsubscribeFromTopic: async (token, topic) => {
        try { return await msging.unsubscribeFromTopic(token, topic); }
        catch (err) {
          console.error(`⚠️ Firebase unsubscribeFromTopic(${topic}) error:`, err.message);
          return { success: false, message: err.message };
        }
      }
    };
  };

  console.log("✅ Firebase Admin Initialized");
} catch (error) {
  console.warn("⚠️ Firebase Service Account Not Found or Invalid. Firebase features will be disabled.");
  console.warn("Error details:", error.message);

  // Mock messaging and other used features to prevent server crashes
  if (!admin.apps.length || !admin.messaging) {
    admin.messaging = () => ({
      send: async () => { console.warn("⚠️ Firebase disabled"); return null; },
      subscribeToTopic: async () => { console.warn("⚠️ Firebase disabled"); return { success: false }; },
      unsubscribeFromTopic: async () => { console.warn("⚠️ Firebase disabled"); return { success: false }; }
    });
  }
}

module.exports = admin;
