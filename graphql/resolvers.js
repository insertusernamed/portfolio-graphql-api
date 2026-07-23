import { getCachedPinnedRepos, getCachedOtherRepos } from '../services/githubService.js';

export const resolvers = {
    pinnedRepos: async () => {
        return getCachedPinnedRepos();
    },

    otherRepos: async () => {
        return getCachedOtherRepos();
    }
};
