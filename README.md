# Tutorial Learning Center Scheduling App
## Overview
This repository contains the Software Engineering (CSCI 490 Colorado Mesa University) project designed to demonstrate what a scheduling application would look like for the Tutorial Services department. This WIP application's role in the tutorial services is to make the lives of Frond Desk Receptionist and management easier and more intutitive by making tutor data easily viewable and easier to sift through. The vision of this project is to provide tutor filtering mechanisms by the classes they tutor, their availability, and names.

## Contributions
- **Jack**: Linking backend service functions to front end, data aqquisition, testing, Cognito sign-in
- **Kyle**: Building service functions, designing and implementing the database, organizing
- **Quentin** All frontend features

## How AWS Services are used
**Identity and Access Management (IAM):** Used for creating project member AWS accounts and assigning privileges. More instruction for how to create and store access keys is provided later in the README. Created developer accounts for working on the project and accessing AWS resources.

**Appsync:** Stores the test and deployment environment APIs for their respective databases. This is where you can see the schema how it is laid out in DynamoDB language.

**DynamoDB:** Simply where the data is stored.

**Cognito:** Handles the test and deployment user pools. In each user pool, there are two user groups defined: Admin and FrontDesk.

**Amplify:** Deployment end of things. This is where the URL can be changed, secrets can be stored, deployment checkups, and overall deployment information can be found.

## Setting up an AWS Developer Account
### AWS IAM Side
Make sure you are in an Admin account associated with the project.

1. In the IAM service, under the Access Management section on the left side of the screen, go to [Users](https://us-east-1.console.aws.amazon.com/iam/home?region=us-west-1#/users). Click create user.
2. Enter an the new user's username, check "Provide user access to the AWS Management Console - optional". Select "I want to create an IAM user". Create a password for the onboarded developer, then check "Users must create a new password at next sign-in - Recommended", then click next. 
3. Then select "Add user to group" then add them to the DevelopementTeam group, then click next.
4. On the review and create page, double check the information, then select "Create user".
5. In Retrieve Password, you can decide how you want to send the password to the project member, it is recommended to email the sign-in instructions to them.


Now that you have an developer account for the project, you need to create an access key so you can connect to AWS services from your local machine. 

1. Go to the [Users](https://us-east-1.console.aws.amazon.com/iam/home?region=us-west-1#/users) again, click on your user. Then go to "Security credentials." This is where you will find the "create access key" button.
2. Select "Command Line Interface (CLI)", check the confirmation box, click next.
3. There is no description tag value needed, click "Create access key."
4. There will be two keys generated, the public and secret key. The public key you can always find on your user page in IAM. The secret key you need to copy into a secure place.

### Adding AWS Credentials Your Local Machine
Now that developer account has been added to the AWS side of things, the AWS credentials need to be stored on your local machine. This allows you to make/adjust your testing environment (the sandbox databases and user pools). 

1. First, install the aws-cli package:
```bash
$ sudo apt install awscli
```
2. Next, run the following command, it will ask for your public and secret access keys, as well as the region which should be set to us-west-1, and the default output format which should default to None after pressing enter.
```bash
$ aws configure
```
3. To test if the account is properly set up locally, run this command:
```bash
$ aws sts get-caller-identity
```
4. This will return the following output format if everything is correct:
```bash
{
  "Account": "123456789012", 
  "UserId": "AR#####:#####", 
  "Arn": "arn:aws:sts::123456789012:assumed-role/role-name/role-session-name"
}
```
5. If it does not output correctly, go back through the process and check that the right access keys were entered.

If everything works fine, continue to setting up your local environment below.

## Amplify Documentation
To find all the docs for the Amplify part of the project, go to the official [Amplify documentation](https://docs.amplify.aws/react/)

## Local Environment
### Setting up Local Environment
For detailed instructions on how to set up the local development environmewnt, refer to [Amplify docs](https://docs.amplify.aws/react/start/quickstart/#4-set-up-local-environment).

### Local Project Structure and Details
Tree generated using the command, ignored node modules since it has so many directories, added it later:
```bash
$ tree -d -I "node_modules"

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
**amplify:**
- **auth:** Authorization resources and configuration.
- **data:** Database schema and configuration, some authorization as well.
- **enums:** Tutor status enumerations for modularity and clean code.

**amplify-backup:** Back up configurations of authorization and database resources
**get-courses:** Holds the excel spreadsheet of all Colorado Mesa University's offered courses. Also holds the script to load courses into a specified DynamoDB course table.
**node_modules:** contains all the local (not global) node modules used in this project. This folder should never be touched as it will automatically populate as new modules are installed.
**public:** Holds static assets like icons and logos.
**src:** This is where most of the developing happens. Has all the tsx files used to serve html to the user as well as the css styling.
- **assets:** Contains the assets used in the program, images, icons, etc., as of now, there isn't much
- **components:** Created for modularity purposes, builds html components for easily displaying information from the database.
- **services:** Service functions for connecting the backend database to the front end. These functions also hold a lot of the logic used when creating/deleting/editing things in the database. Designed to make developing the front end easier.
- **tests:** Holds test functions.
- **utils:** Utiility functions that can be used in various ways, aren't specifically tied to a database model or object. Validators and normalizers are found here.

Important **root directory level** files
- **.env:** Will hold secret variables so that only developers are allowed access to certain information. See Bryce for more information.
- **amplify_outputs.json:** Should be in your directory after completing the local environment setup. After running the sandbox, this will contain important information about your test database and userpool. It'll show the endpoints for both of those and other configuratioms.
- **package.json** and **package-lock.json:** contain the modules and their versions. In package-lock, the modules will be locked at those versions even when updates are ran.

### Testing
The amplify local environment setup allows for all the testing to be done locally using a database and user pool tied to your aws account. This ensures that nothing on the deployment end is messed with while changes are being made.

Whenever there are changes made to the project configuration-- like a database schema change or user pool change-- the best practice is to run:
```
$ npx ampx sandbox
```
This command will update the test databases and userpools with their new structures. Also this should be running in the background whenever doing a test run of the web application. That command to run the local version of the web application is:
```
$ npm run dev
```

Make sure that any unit testing is done in the /src/tests directory.

## Deployment
Once a branch is merged with main and pushed to origin, Amplify automatically detects that the central repository has changed and starts a new deployment with the updates. This can be veiwed in the AWS Amplify dashboard and will take a couple minutes to deploy.

### Failed to Deploy?
If for some reason the deployment failed, do not worry because Amplify will keep web application in the state of the last successful deployment.

The most helpful thing the look are the build/deployment logs which are found in that Amplify's deployment branch. You can view them as is via the dropdown menu or you can download them to sift through them that way. If there are ANY warnings or errors in the code (red or yellow squiggly) the code will push but will fail to deploy on Amplify.

### Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
