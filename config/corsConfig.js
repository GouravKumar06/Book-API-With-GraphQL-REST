const cors = require('cors');

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000'
]

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization','Accept-Version'],
    credentials: true, // for cookies
    optionsSuccessStatus: 200, 
};


const configureCors = () => {
    return cors(corsOptions)
}


module.exports = configureCors