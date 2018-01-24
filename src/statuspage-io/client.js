const fetch = require('node-fetch')

const client = mozaik => {
  return {
    incident({ pageId }) {
      return fetch(`https://${pageId}.statuspage.io/api/v2/incidents.json`).then(res => res.json())
        .then(({ incidents, page }) => Object.assign({ page }, incidents[0]))
    }
  }
}

module.exports = client;