'use strict'

module.exports = (Mozaik, configFile, config) => {
    Mozaik.registerApi('github', require('@mozaik/ext-github/client'))
    Mozaik.registerApi('nlbw', require('./nlbw/client'))
    Mozaik.registerApi('statuspage-io', require('./statuspage-io/client'))
}
