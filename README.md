## Overview

This template equips you with a foundational React application integrated with AWS Amplify, streamlined for scalability and performance. It is ideal for developers looking to jumpstart their project with pre-configured AWS services like Cognito, AppSync, and DynamoDB.

## Features
- **Authentication**: Setup with Amazon Cognito for secure user authentication.
- **API**: Ready-to-use GraphQL endpoint with AWS AppSync.
- **Database**: Real-time database powered by Amazon DynamoDB.

## How AWS Services are used
### Creating a developer AWS account for this project.
**Identity and Access Management (IAM)**

### Deployment setup
**Appsync:**

**DynamoDB:**

**Cognito:**

**Amplify:**

## Amplify Documentation
To find all the docs for the Amplify part of the project, go to the official [Amplify documentation](https://docs.amplify.aws/react/)

## Local Environment
### Setting up Local Environment
For detailed instructions on how to set up the local development environmewnt, refer to [amplify docs](https://docs.amplify.aws/react/start/quickstart/#4-set-up-local-environment).

### Local Project Structure and Details
Tree generated using the command, ignored node modules since it has so many directories, added it later:
```bash
tree -d -I "node_modules"

.
├── amplify
│   ├── auth
│   ├── data
│   └── enums
├── amplify-backup
│   ├── auth
│   └── data
├── get-courses
├── node_modules
├── public
└── src
    ├── assets
    ├── components
    ├── services
    ├── tests
    └── utils
```
amplify
- auth: Authorization resources and configuration.
- data: Database schema and configuration, some authorization as well.
- enums: Tutor status enumerations for modularity and clean code.

amplify-backup: Back up configurations of authorization and database resources
get-courses: Holds the excel spreadsheet of all Colorado Mesa University's offered courses. Also holds the script to load courses into a specified DynamoDB course table.
node_modules: contains all the local (not global) node modules used in this project. This folder should never be touched as it will automatically populate as new modules are installed.
public: Holds static assets like icons and logos.
src: This is where most of the developing happens. Has all the tsx files used to serve html to the user as well as the css styling.
- assets: Contains the assets used in the program, images, icons, etc., as of now, there isn't much
- components: Created for modularity purposes, builds html components for easily displaying information from the database.
- services: Service functions for connecting the backend database to the front end. These functions also hold a lot of the logic used when creating/deleting/editing things in the database. Designed to make developing the front end easier.
- tests: Holds test functions.
- utils: Utiility functions that can be used in various ways, aren't specifically tied to a database model or object. Validators and normalizers are found here.

Important root directory level files
- .env: Will hold secret variables so that only developers are allowed access to certain information. See Bryce for more information.
- amplify_outputs.json: Should be in your directory after completing the local environment setup. After running the sandbox, this will contain important information about your test database and userpool. It'll show the endpoints for both of those and other configuratioms.
- package.json and package-lock.json: contain the modules and their versions. In package-lock, the modules will be locked at those versions even when updates are ran.

### Testing

## Deployment
For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of our documentation.

### Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
