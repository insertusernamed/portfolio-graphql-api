export const GET_PINNED_REPOS = `
    query {
        viewer {
            pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                    ... on Repository {
                        name
                        description
                        url
                        stargazerCount
                        forkCount
                        updatedAt
                        isPrivate
                        homepageUrl
                        owner { 
                            login 
                            url 
                        }
                        languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                            nodes {
                                name
                                color
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const GET_PINNED_REPO_NAMES = `
    query {
        viewer {
            pinnedItems(first: 6, types: REPOSITORY) {
                nodes { 
                    ... on Repository { 
                        name 
                        owner { 
                            login 
                        } 
                    } 
                }
            }
        }
    }
`;

export const GET_ALL_REPOS = `
    query {
        viewer {
            repositories(
                first: 100,
                affiliations: [OWNER],
                ownerAffiliations: [OWNER],
                orderBy: { field: PUSHED_AT, direction: DESC }
            ) {
                nodes {
                    name
                    owner {
                        login
                    }
                    isPrivate
                    pushedAt
                }
            }
        }
    }
`;

export const GET_REPO_DETAILS = `
    query ($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
            name
            description
            url
            stargazerCount
            forkCount
            updatedAt
            isPrivate
            homepageUrl
            owner {
                login
                url
            }
            languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                nodes {
                    name
                    color
                }
            }
        }
    }
`;
