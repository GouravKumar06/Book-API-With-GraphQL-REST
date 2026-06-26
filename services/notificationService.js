const redis = require('redis');

exports.startNotificationService = async (bookData) =>  {

    console.log("🕵️‍♂️ [Notification Service] Active and listening for new books...");

    console.log(`\n📧 [NOTIFICATION] Sending notification to User: ${bookData.uploadedBy}`);
    console.log(`🎉 Success! Your book "${bookData.title}" by ${bookData.author} is now live!`);
}