const Client = require('./Client')
const credentials = JSON.parse(require('fs').readFileSync('credentials.json').toString())

const client = new Client(credentials).getUserData()