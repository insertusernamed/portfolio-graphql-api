import 'dotenv/config';

export const PORT = process.env.PORT || 3003;
export const GITHUB_API = 'https://api.github.com/graphql';
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const REQUEST_DELAY = 100;
export const CORS_ORIGINS = [
    'http://localhost:3003',
    'http://localhost:5173',
    'https://danielyevtushenko.com'
];
