const  rateLimit  = require('express-rate-limit')


const createRateLimiter = (maxRequests,time) => {
    return rateLimit({
        windowMs: time, 
        limit: maxRequests, 
        message:"Too many requests,please try again later",
        standardHeaders: true, 
        legacyHeaders: false, 
        ipv6Subnet: 56, 
    })
}


module.exports=createRateLimiter