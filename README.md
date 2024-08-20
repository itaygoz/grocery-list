# Grocery List Management App

This project is a full-stack grocery list management application that learns from past user lists to predict future items. The backend is built using NestJS with MongoDB and Redis, and the frontend will be developed using React.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [CI/CD](#cicd)
- [Environment Variables](#environment-variables)
- [Architecture Overview](#architecture-overview)
- [Future Enhancements](#future-enhancements)

## Project Structure

This project is organized as a monorepo managed by Lerna. The following are the main packages:

- **Backend**: NestJS-based backend service with MongoDB and Redis integration.
- **Frontend**: (To be implemented) React-based frontend service.

```plaintext
root
├── packages
│   ├── backend
│   │   ├── src
│   │   ├── test
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   └── ...
│   └── frontend
│       ├── src
│       ├── public
│       ├── Dockerfile
│       └── ...
├── lerna.json
├── package.json
└── README.md
```

## Prerequisites

- **Node.js**: v20.x or later
- **Npm**: v11.5.x or later (for package management)
- **Docker**: v26.x or later (for containerization)
- **MongoDB**: v6.x or later (installed on docker)
- **Redis**: v7.x or later (installed on docker)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/itaygoz/grocery-list.git
    ```

2. Navigate to the project directory:

    ```bash
    cd grocery-list
    ```

3. Install dependencies using Lerna:

    ```bash
    npm install
    ```

4. Set up environment variables (see [Environment Variables](#environment-variables) section, you can use the .env file in each project).

## Usage

### Starting the Development Server

To start the development server:

```bash
lerna run start:dev
```

This will start the backend service. The frontend service is yet to be implemented.

### Running Tests

To run all tests:

```bash
lerna run start test
```

To run unit tests:

```bash
lerna run start test:unit
```

To run end-to-end tests:

```bash
lerna run start test:e2e
```

## Scripts

The following are the important scripts you can use:

- **`lerna start`**: Starts the application.
- **`lerna run start:dev`**: Starts the development server with live reload.
- **`lerna run start test`**: Runs all tests.
- **`lerna run start test:e2e`**: Runs end-to-end tests.
- **`lerna run start test:unit`**: Runs unit tests.

## CI/CD

The CI/CD flow is implemented using GitHub Actions. We use Semantic Versioning (SemVer) and Semantic Release (`semrel`) to automate the creation of semantic versions and releases. This ensures that version numbers reflect the nature of the changes made (e.g., major, minor, patch).

### GitHub Actions

- **Semantic Versioning & Release**: A GitHub Action is set up to automatically determine the version bump (major, minor, patch) based on commit messages. The action also creates a new release with appropriate tags.
- **Testing**: Another GitHub Action runs the test suite, including unit and end-to-end tests. All tests must pass for a pull request to be merged.

### Lerna Versioning

We use `lerna version` to identify which packages have been modified. Lerna generates tags for the specific packages and updates the changelog to reflect the changes. This ensures that each package is independently versioned and only those with actual changes are updated.

## Environment Variables

You can set the `.env` file placed in each `packages/{project}`, there are default values there:

## Architecture Overview

### Backend

- **NestJS**: Framework for building efficient, reliable, and scalable server-side applications.
- **MongoDB**: NoSQL database for storing user data and lists.
- **Redis**: In-memory data store for session management and caching.

### Frontend

- **React**: (To be implemented) Frontend framework for building user interfaces.

## Future Enhancements

- **Frontend Implementation**: Develop a React-based frontend for the application.
- **Predictive Analytics**: Implement a machine learning model to predict future grocery list items based on past behavior.
- **User Authentication**: Add user authentication and authorization mechanisms.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request if you'd like to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
