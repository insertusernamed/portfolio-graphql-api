import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { renderPlaygroundPage } from 'graphql-playground-html';
import schema from './data/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { PORT, CORS_ORIGINS } from './constants/config.js';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || CORS_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// GraphQL endpoint
app.all(
    '/graphql',
    createHandler({
        schema,
        rootValue: resolvers,
    })
);

// GraphQL playground, only for development
if (process.env.NODE_ENV !== 'production') {
    app.get('/graphiql', (_req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.send(
            renderPlaygroundPage({
                endpoint: '/graphql',
                title: 'GraphQL Playground',
            })
        );
    });
}

// Root route
app.get('/', (_, res) => {
    res.send('Server is running. Access /graphql for the API.');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
});