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

  slack_users: {
    uri: "https://slack.com/api/users.list",
    json: true,
    qs: {
      token: process.env.SLACK_API_TOKEN
    }
  },

  p_zero_check: {
    url: 'https://api.pagerduty.com/incidents',
    json: true,
    qs: {
      since: '',
      until: '',
      'team_ids%5B%5D': 'PT10OFI',
      'statuses%5B%5D': 'triggered',
      'statuses%5B%5D': 'acknowledged',
      'urgencies%5B%5D': 'high',
      time_zone: 'UTC'
    },
    headers: {
      Authorization: process.env.PAGER_DUTY_TOKEN
    }
  }
}
