const github = require('@actions/github')
const core = require('@actions/core')
const fs = require('fs').promises

const context = github.context

const token = core.getInput('token')
const octokit = github.getOctokit(token)

;(async function run() {
  //
})()
