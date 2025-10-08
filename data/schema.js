import { buildSchema } from "graphql";

const schema = buildSchema(`
    type Language {
        name: String
        color: String
    }

    type LanguageConnection {
        nodes: [Language]
    }

    type Repository {
        name: String
        description: String
        url: String
        stargazerCount: Int
        forkCount: Int
        updatedAt: String
        isPrivate: Boolean
        owner: Owner
        languages: LanguageConnection
        homepageUrl: String
    }

    type Owner {
        login: String
        url: String
    }

    type Query {
        pinnedRepos: [Repository]
        otherRepos: [Repository]
    }
`);

export default schema;