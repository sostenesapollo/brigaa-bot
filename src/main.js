const Server = require('./Server')
const Client = require('./Client')
const { user, pass, telegramApiKey } = JSON.parse(require('fs').readFileSync('credentials.json').toString())

const main = async () => {
    // * Will get a user text data/compare with last one and send to telegram if was not sent yet
    // try {
    //     const tempUserData = await new Client({user, pass}).getUserData()
    //     console.log(tempUserData);
    // }catch(e) {
    //     console.log('error to get userData: ', e.message);
    // }
    // * Server
    const server = new Server({telegramApiKey}).initialize()
}

main()