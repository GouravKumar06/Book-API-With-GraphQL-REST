const client = require('../database/redis');
const { trackBookAnalytics } = require('../services/analyticsService');
const { startNotificationService } = require('../services/notificationService');

async function initEventManager() {
    const subscriber = client.duplicate()

    await subscriber.connect()
    
    subscriber.on('error', (err) => console.error('❌ Redis Subscriber Error', err));
    
    console.log("🕵️‍♂️ [Event Manager] Connected and listening to central Redis events...");

    // Subscribe only one time for the entire application
    await subscriber.subscribe('book:created', (message) => {
        try {
            const bookData = JSON.parse(message);
            console.log(`📩 [Event Manager] New event received on 'book:created'`);

            startNotificationService(bookData);
            trackBookAnalytics(bookData);
            
        } catch (error) {
            console.error("Error parsing event message:", error);
        }
    });
}

module.exports = { initEventManager };