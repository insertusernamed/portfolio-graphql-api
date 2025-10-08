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

export async function fetchRepoDetails(owner, name) {
    try {
        const res = await axios.post(
            GITHUB_API,
            {
                query: GET_REPO_DETAILS,
                variables: { owner, name }
            },
            { headers }
        );

        if (res.data.errors) {
            console.error(`GraphQL errors for ${owner}/${name}:`, res.data.errors);
            return null;
        }

        return res.data.data.repository;
    } catch (error) {
        console.error(`Error fetching details for ${owner}/${name}:`, error.message);
        return null;
    }
}

export async function fetchPinnedRepos() {
    try {
        const res = await axios.post(
            GITHUB_API,
            { query: GET_PINNED_REPOS },
            { headers }
        );

        if (res.data.errors) {
            console.error('GraphQL errors in pinnedRepos:', res.data.errors);
            return [];
        }

        return res.data.data.viewer.pinnedItems.nodes;
    } catch (error) {
        console.error('Error fetching pinned repos:', error.message);
        return [];
    }
}

export async function fetchOtherRepos() {
    try {
        // Get pinned repo names for filtering
        const pinnedRes = await axios.post(
            GITHUB_API,
            { query: GET_PINNED_REPO_NAMES },
            { headers }
        );

        if (pinnedRes.data.errors) {
            console.error('GraphQL errors in pinned query:', pinnedRes.data.errors);
            return [];
        }

        const pinnedRepos = new Set(
            pinnedRes.data.data.viewer.pinnedItems.nodes.map(r =>
                `${r.owner.login}/${r.name}`
            )
        );

        // Fetch all repositories
        const reposRes = await axios.post(
            GITHUB_API,
            { query: GET_ALL_REPOS },
            { headers }
        );

        if (reposRes.data.errors) {
            console.error('GraphQL errors in repos query:', reposRes.data.errors);
            return [];
        }

        const allRepos = reposRes.data.data.viewer.repositories.nodes;

        // Filter out pinned and private repos
        const otherRepos = allRepos.filter(repo =>
            !repo.isPrivate && !pinnedRepos.has(`${repo.owner.login}/${repo.name}`)
        );

        // Fetch detailed information for each repository
        const detailedRepos = [];
        for (const repo of otherRepos.slice(0, 20)) {
            const details = await fetchRepoDetails(repo.owner.login, repo.name);
            if (details) {
                detailedRepos.push(details);
            }
            // Prevent rate limiting
            await delay(REQUEST_DELAY);
        }

        return detailedRepos;
    } catch (error) {
        console.error('Error fetching other repos:', error.response?.data || error.message);
        return [];
    }
}
