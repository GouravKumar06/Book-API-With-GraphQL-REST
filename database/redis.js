const redis = require('redis');

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port:process.env.REDIS_PORT
})

//add event listener
client.on('error',(error)=>{
    console.log("redis error: ",error)
})

module.exports = client;