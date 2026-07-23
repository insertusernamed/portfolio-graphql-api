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
const CACHE_TTL_MS = 30 * 60 * 1000;
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

async function doFetch() {
    const [pinnedData, pinnedNamesData] = await Promise.all([
        fetchGitHubGraphQL(GET_PINNED_REPOS),
        fetchGitHubGraphQL(GET_PINNED_REPO_NAMES),
    ]);

    const pinnedRepos = pinnedData.viewer.pinnedItems.nodes;
    const pinnedRepoNames = new Set(
        pinnedNamesData.viewer.pinnedItems.nodes.map(r =>
            `${r.owner.login}/${r.name}`
        )
    );

    const reposData = await fetchGitHubGraphQL(GET_ALL_REPOS);
    const allRepos = reposData.viewer.repositories.nodes;

    const otherRepos = allRepos.filter(repo =>
        !repo.isPrivate && !pinnedRepoNames.has(`${repo.owner.login}/${repo.name}`)
    );

    const detailedRepos = await mapWithConcurrency(
        otherRepos.slice(0, 20),
        4,
        async (repo, i) => {
            if (i > 0) await delay(REQUEST_DELAY);
            return fetchRepoDetails(repo.owner.login, repo.name);
        }
    );

    const filteredDetailedRepos = detailedRepos.filter(Boolean);

    cache.set('pinnedRepos', pinnedRepos);
    cache.set('otherRepos', filteredDetailedRepos);

    console.log(`[Cache] Updated — ${pinnedRepos.length} pinned, ${filteredDetailedRepos.length} other repos`);
}

export function startBackgroundRefresh() {
    doFetch().catch(err => console.error('[Cache] Initial fetch failed:', err.message));
    setInterval(() => {
        doFetch().catch(err => console.error('[Cache] Refresh failed:', err.message));
    }, CACHE_TTL_MS);
    console.log(`[Cache] Background refresh every ${CACHE_TTL_MS / 60000} minutes`);
}

export function getCachedPinnedRepos() {
    return cache.get('pinnedRepos') ?? [];
}

export function getCachedOtherRepos() {
    return cache.get('otherRepos') ?? [];
}
