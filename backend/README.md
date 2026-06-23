# Barback Documentation

This repository contains the backend service for the Barback application.

## Core Documents

- [Product Definition](./docs/ProductDefinition.md) - Details about users, value proposition and features
- [Development Roadmap](./docs/DevelopmentRoadmap.md) - Implementation steps and technical considerations
- [Coding Guidelines](./docs/CodingGuidelines.md) - Standards and best practices for code development

These documents should be consulted throughout the development process to maintain alignment with project goals.

## Technology Stack

This project is built with [NestJS](https://github.com/nestjs/nest), a progressive Node.js framework for building efficient and scalable server-side applications.

## Installation

```bash
npm install
```

## Running the dev server

The normal development setup uses the shared Atlas MongoDB database configured in
`.env.dev`, so you do **not** need to start the local Docker MongoDB replica set
for day-to-day development.

1. Create the dev environment file if it does not already exist:

    ```bash
    cp .env.example .env.dev
    ```

2. Ensure `.env.dev` contains the Atlas `MONGODB_URI` and the other required dev
   secrets.

3. Start the backend in watch mode:

    ```bash
    npm run start:dev
    ```

The API is served at:

```text
http://localhost:3000/api
```

### Optional local MongoDB

Only run this if you intentionally want to use the local Docker MongoDB replica
set instead of Atlas. In that case, first update `.env.dev` so `MONGODB_URI`
points at the local replica set, then run:

```bash
npm run start:db
npm run start:dev
```

## Running the app in other modes

```bash
# one-shot local start
npm run start

# production mode
npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
