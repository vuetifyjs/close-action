const github = require('@actions/github')
const core = require('@actions/core')

const context = github.context

const token = core.getInput('token')
const octokit = github.getOctokit(token)

const closeRegexp = /(?:(?:close|resolve)[ds]?|fix(?:e[ds])?) #(\d+)/gi

;(async function run() {
  if (github.context.eventName === 'push') {
    /** @type {import('@octokit/webhooks-definitions/schema').PushEvent} */
    const payload = github.context.payload

    for (const commit of payload.commits) {
      if (!commit.distinct) continue
      const taggedIssues = [...commit.message.matchAll(closeRegexp)].map(match => +match[1])
      for (const issueNumber of taggedIssues) {
        core.notice(`Closing issue #${issueNumber}`)
        await octokit.rest.issues.update({
          ...context.repo,
          issue_number: issueNumber,
          state: 'closed',
        }).catch(err => {
          core.warning(`Issue #${issueNumber} - ${err.message}`)
        })
        await octokit.rest.issues.addAssignees({
          ...context.repo,
          issue_number: issueNumber,
          assignees: [commit.author.username]
        }).catch(err => {
          core.warning(`Issue #${issueNumber} - ${err.message}`)
        })
      }
    }
  }
})()
