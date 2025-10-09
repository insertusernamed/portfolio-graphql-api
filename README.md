# Portfolio GraphQL API

## Project Overview

This is a backend service built with Node.js, Express, and GraphQL. Its use case is to fetch my repository data from GitHub and expose it through a streamlined GraphQL API. This service acts as the data source for my personal portfolio website, allowing for a dynamic and efficient display of my projects.

## Purpose and Motivation

This project was created for two main reasons:

1.  **Practical Application of Skills:** After completing a course on GraphQL, I wanted to apply the concepts to a real-world project. Building this API was a hands-on way to solidify my understanding of GraphQL schemas, queries, and resolvers.

2.  **Improving My Portfolio:** Previously, my portfolio's front end made direct calls to the GitHub REST API. By creating this dedicated backend, I now have a more efficient and flexible data layer. This approach allows me to tailor the data exactly to my front end's needs, reducing unnecessary data transfer and simplifying the client-side code.

## How It Works

The application is a server-side Express application. It uses the official GitHub GraphQL API to retrieve repository information, specifically my pinned and general projects. This data is then exposed through its own single GraphQL endpoint (`/graphql`).

My portfolio's front end sends queries to this endpoint to receive all the necessary project data in a single request. The entire application is containerized using Docker to ensure consistent behavior across different environments and to simplify deployment.

## Technology Stack

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **API Layer:** GraphQL (using `express-graphql`)
-   **Containerization:** Docker
