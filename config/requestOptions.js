const keys = require('./keys');

module.exports = {
  onCall: {
    url: "https://api.pagerduty.com/oncalls?time_zone=UTC&escalation_policy_ids%5B%5D=P67HF4O",
    json: true,
    headers: {
      Authorization: keys.PagerDutyAuth,
      Accept: "application/vnd.pagerduty+json;version=2"
    }
  },

  escalation: {
    url: "https://api.pagerduty.com/oncalls?time_zone=UTC&escalation_policy_ids%5B%5D=P67HF4O",
    json: true,
    headers: {
      Authorization: keys.PagerDutyAuth,
      Accept: "application/vnd.pagerduty+json;version=2"
    }
  },

  slackUsers: {
    uri: "https://slack.com/api/users.list",
    json: true,
    qs: {
      token: keys.SlackToken
    }
  },

  PZeroCheck: {
    url: 'https://api.pagerduty.com/incidents?team_ids%5B%5D=PT10OFI&statuses%5B%5D=triggered&statuses%5B%5D=acknowledged',
    json: true,
    qs: {
      since: '',
      until: '',
      // team_ids%5B%5D: 'PT10OFI',
      // statuses%5B%5D: 'triggered',
      // statuses%5B%5D: 'acknowledged',
      urgencies: 'high',
      time_zone: 'UTC'
    },
    headers: {
      Authorization: keys.PagerDutyAuth
    }
  }
}
