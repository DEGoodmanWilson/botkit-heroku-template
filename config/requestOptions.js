module.exports = {
  on_call: {
    url: "https://api.pagerduty.com/oncalls?time_zone=UTC&escalation_policy_ids%5B%5D=P67HF4O",
    json: true,
    headers: {
      Authorization: process.env.PAGER_DUTY_TOKEN,
      Accept: "application/vnd.pagerduty+json;version=2"
    }
  },

  escalation: {
    url: "https://api.pagerduty.com/oncalls?time_zone=UTC&escalation_policy_ids%5B%5D=P67HF4O",
    json: true,
    headers: {
      Authorization: process.env.PAGER_DUTY_TOKEN,
      Accept: "application/vnd.pagerduty+json;version=2"
    }
  },

  invite: {
    url: "https://slack.com/api/groups.invite",
    json: true,
    qs: {
      method: "POST",
      token: process.env.SLACK_API_TOKEN,
      channel: "GC3CCDP1D"
    }
  },

  kick: {
    url: "https://slack.com/api/channels.kick",
    json: true,
    qs: {
      token: process.env.SLACK_API_TOKEN
    }
  },

  slack_users: {
    uri: "https://slack.com/api/users.list",
    json: true,
    qs: {
      token: process.env.SLACK_API_TOKEN
    }
  },
  
  user_info: {
    uri: "https://slack.com/api/users.info",
    json: true,
    qs: {
      token: process.env.SLACK_API_TOKEN
    }
  }
}
