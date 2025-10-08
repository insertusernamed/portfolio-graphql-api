import { fetchPinnedRepos, fetchOtherRepos } from '../services/githubService.js';

export const resolvers = {
    pinnedRepos: async () => {
        return await fetchPinnedRepos();
    },

    otherRepos: async () => {
        return await fetchOtherRepos();
    }
};
