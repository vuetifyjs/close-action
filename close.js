const github = require('@actions/github')
const core = require('@actions/core')

const context = github.context

const token = core.getInput('token')
const octokit = github.getOctokit(token)

const closeRegexp = /(?:(?:close|resolve)[ds]?|fix(?:e[ds])?) #(\d+)/gi

;(async function run() {
  if (context.eventName === 'push') {
    const issues = Array.from(new Set(
      (await Promise.all(
        context.payload.commits.map(async commit => {
          if (!commit.distinct) return

          return [...commit.message.matchAll(closeRegexp)].map(match => +match[1])
        })
      )).flat().filter(v => v != null)
    ))

    if (!issues.length) return

    core.notice(`Closing issue${issues.length > 1 ? 's' : ''} ${issues.map(v => `#${v}`).join(', ')}`)

    await Promise.all(
      issues.map(async issueNumber => {
        return octokit.rest.issues.update({
          ...context.repo,
          issue_number: issueNumber,
          state: 'closed',
        })
      })
    )
  }
})()
