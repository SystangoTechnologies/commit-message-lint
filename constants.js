module.exports = {
  configFileName: process.env.REGEX_CONFIG_FILE_NAME,
  conclusion_status: {
    SUCCESS: 'success',
    FAILURE: 'failure',
    NEUTRAL: 'neutral',
    CANCELLED: 'cancelled',
    TIMED_OUT: 'timed_out',
    ACTION_REQUIRED: 'action_required'
  },
  messages: {
    valid_commit_message: 'Commit messages are valid',
    invalid_commit_message: 'Commit messages are invalid',
    valid_pull_request_message: 'Pull request title is valid',
    invalid_pull_request_message: 'Pull request title is invalid',
    multiple_other_invalid_message: 'other messages are invalid',
    single_other_invalid_message: 'other message is invalid',
    pr_configuration_not_set: 'Pull request title format is not configured',
    commit_message_configuration_not_set:
      'Commit message format is not configured',
    pr_and_commit_message_configuration_not_set:
      'Pull request title and commit message format are not configured',
    home_page_message: 'Commit Message Lint App'
  },
  CHECK_RUN_STATUS_COMPLETED: 'completed',
  CHECK_RUN_NAME: 'Commit Message Lint',
  output_title_success: 'Message validation passed!!!',
  output_title_fail: 'Message validation failed!!!',
  INVALID_COMMIT_LIMIT: 3,
  USER_AGENT: 'commit-message-lint-app',
  invalid_commit_list: {
    commit_id: 'sha:',
    commit_message: 'message:'
  },
  REGEX: {
    MERGE_COMMIT_REGEX: '/^(Merge pull request)/'
  },
  events: {
    PULL_REQUEST_OPEN: 'pull_request.opened',
    CHECK_RUN_REREQUESTED: 'check_run.rerequested',
    CHECK_SUITE_REREQUESTED: 'check_suite.rerequested',
    CHECK_SUITE_REQUESTED: 'check_suite.requested',
    MARKETPLACE_PURCHASE: 'marketplace_purchase',
    CHECK_SUITE: 'check_suite'
  },
  OAUTH_ENDPOINT: 'https://github.com/login/oauth',
  INSTALLATION_PATH: 'https://github.com/settings/installations'
};
