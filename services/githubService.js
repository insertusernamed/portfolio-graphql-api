import axios from 'axios';
import { GITHUB_API, GITHUB_TOKEN, REQUEST_DELAY } from '../constants/config.js';
import {
    GET_PINNED_REPOS,
    GET_PINNED_REPO_NAMES,
    GET_ALL_REPOS,
    GET_REPO_DETAILS
} from '../graphql/queries.js';

const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

async function fetchGitHubGraphQL(query, variables = {}) {
    const res = await axios.post(
        GITHUB_API,
        { query, variables },
        { headers }
    );

    if (res.data.errors) {
        throw new Error(JSON.stringify(res.data.errors));
    }

    return res.data.data;
}

function getCache(key) {
    const cached = cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
        cache.delete(key);
        return null;
    }
    return cached.value;
}

function setCache(key, value) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + CACHE_TTL_MS
    });
}

async function mapWithConcurrency(items, concurrency, mapper) {
    const output = new Array(items.length);
    let index = 0;

    async function worker() {
        while (index < items.length) {
            const current = index++;
            output[current] = await mapper(items[current], current);
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
    await Promise.all(workers);
    return output;
}

export async function fetchRepoDetails(owner, name) {
    try {
        const data = await fetchGitHubGraphQL(GET_REPO_DETAILS, { owner, name });
        return data.repository;
    } catch (error) {
        console.error(`Error fetching details for ${owner}/${name}:`, error.message);
        return null;
    }
}

export async function fetchPinnedRepos() {
    const cacheKey = 'pinnedRepos';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        const data = await fetchGitHubGraphQL(GET_PINNED_REPOS);
        const repos = data.viewer.pinnedItems.nodes;
        setCache(cacheKey, repos);
        return repos;
    } catch (error) {
        console.error('Error fetching pinned repos:', error.message);
        return [];
    }
}

export async function fetchOtherRepos() {
    const cacheKey = 'otherRepos';
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
        // Get pinned repo names for filtering
        const pinnedData = await fetchGitHubGraphQL(GET_PINNED_REPO_NAMES);
        const pinnedRepos = new Set(
            pinnedData.viewer.pinnedItems.nodes.map(r =>
                `${r.owner.login}/${r.name}`
            )
        );

        // Fetch all repositories
        const reposData = await fetchGitHubGraphQL(GET_ALL_REPOS);
        const allRepos = reposData.viewer.repositories.nodes;

        // Filter out pinned and private repos
        const otherRepos = allRepos.filter(repo =>
            !repo.isPrivate && !pinnedRepos.has(`${repo.owner.login}/${repo.name}`)
        );

        // Fetch detailed information for each repository
        const detailedRepos = await mapWithConcurrency(
            otherRepos.slice(0, 20),
            4,
            async (repo, i) => {
                if (i > 0) {
                    // Stagger requests slightly to reduce burst pressure.
                    await delay(REQUEST_DELAY);
                }
                return fetchRepoDetails(repo.owner.login, repo.name);
            }
        );

        const filteredDetailedRepos = detailedRepos.filter(Boolean);
        setCache(cacheKey, filteredDetailedRepos);
        return filteredDetailedRepos;
    } catch (error) {
        console.error('Error fetching other repos:', error.response?.data || error.message);
        return [];
    }
}
