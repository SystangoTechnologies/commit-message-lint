# Commit Message Lint
Github app to validate commit message and pull request title on a pull request

## Description
This app runs a format check on commit messages and pull request title on the creation of a pull request.

For example, let's say you specify that a commit message should have a format `DDD:message`. Here D stand for numeric digit. The app checks if the commit message follows this format. If all the commit messages follow this format, the check returns successful, otherwise failure. The reviewer can then decide if they want to go ahead with the code merge.

### App URL
https://github.com/apps/commit-message-lint

## Installation

Use the Github's app section or above URL to install the app to your repository.

## Configuration

You would need to add a configuration folder named `.github` at the root of your repository. The folder should contain a file named `config.yml`. This file will serve as the configuration and the contents of that file will be:

```
PR_TITLE_REGEX: <PR Title Regex>
COMMIT_MESSAGE_REGEX: <Commit Message Regex>
```

## Usage
Go to the `checks` section on your PR to see the result of the check run performed by the app. It will show you the result as well as the commit messages which failed.

## Contributors
[Anshul Soni](https://www.linkedin.com/in/anshul-soni-3903a2101/)

[Sumit Singhal](https://www.linkedin.com/in/s-singhal)