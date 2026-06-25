const dotenv = require('dotenv')
dotenv.config();

const express = require('express');
const connectDB = require('./database/db');
const { ApolloServer } = require('@apollo/server');

const { expressMiddleware } = require('@as-integrations/express4');

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { buildAuthContext } = require('./middleware/middleware');
const configureCors = require('./config/corsConfig');



const bookRoutes = require('./routes/book.routes');
const authRoutes = require('./routes/auth.routes');
const { requestLogger } = require('./middleware/loggerMiddleware');


const app = express();

const PORT = process.env.PORT || 3000

// middleware to parse the json data
app.use(express.json());
app.use(configureCors());

app.use(requestLogger)

app.use('/api/books/v1',bookRoutes)
app.use('/api/auth/v1',authRoutes)


app.get("/healthcheck",(req,res)=>{
    res.send("this is health point check up")
})

const server = new ApolloServer({
    typeDefs,
    resolvers,
});


const startServer = async () => {
    await connectDB();

    // 🚀 Start Apollo Server first (Required by v4)
    await server.start();

    app.use('/graphql', expressMiddleware(server, {
        context: buildAuthContext 
    }));

    app.listen(PORT, () => {
        console.log(`🚀 Hybrid Server fully live on port ${PORT}!`);
        console.log(`👉 REST APIs: http://localhost:${PORT}`);
        console.log(`👉 GraphQL Endpoint: http://localhost:${PORT}/graphql`);
    });
};

startServer();