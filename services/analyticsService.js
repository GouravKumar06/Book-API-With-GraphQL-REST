let totalBooksCountInSystem = 100; 

exports.trackBookAnalytics = (bookData) => {
    totalBooksCountInSystem++;
    console.log(`\n📈 [ANALYTICS] New Book Logged: ${bookData.title}`);
    console.log(`🔢 Updated Total Books Count: ${totalBooksCountInSystem}`);
};