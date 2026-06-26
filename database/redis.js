const redis = require('redis');

const client = redis.createClient({
    host:'localhost',
    port:6379
})

//add event listener
client.on('error',(error)=>{
    console.log("redis error: ",error)
})

module.exports = client;