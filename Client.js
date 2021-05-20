const puppeteer = require('puppeteer');
const urls      = require('./urls')

class Client {

    constructor (credentials) {
        if(!credentials || !credentials.user || !credentials.pass)
            throw Error("Check your credentials.")
            
        this.credentials = credentials
        this.headless    = false
    }
    
    async login () {
        this.browser = await puppeteer.launch({headless:this.headless});
        this.page = await this.browser.newPage()
        await this.page.goto(urls.login, { waitUntil: 'networkidle0' })

        // this.page.on('console', consoleObj => console.log(consoleObj.text()));

        await this.page.$eval('input[name="user.login"]', (el, credentials) => el.value = credentials.user, this.credentials)
        await this.page.$eval('input[name="user.senha"]', (el, credentials) => el.value = credentials.pass, this.credentials)

        this.page.keyboard.press('Enter');

        console.log('logando..');
        await this.page.waitForNavigation();
        console.log('logado.');

        // Create verification if is in the main page.
    }

    async getUserData () {
        await this.login()

        this.userData = {}
        this.userData.nome = await this.page.evaluate(() => document.querySelectorAll('.usuario')[0].innerText)
        this.userData.unidade = await this.page.evaluate(() => document.querySelectorAll('.unidade')[0].innerText)
        this.userData.foto = await this.page.evaluate(() => document.getElementsByClassName('foto')[0].querySelector('img').src)

        let dadosInstitucionais = await this.page.evaluate(() => {
            var tds = Array.from(document.querySelectorAll('table')[33].querySelectorAll('tr td'))            
            return {
                matricula : tds[1].innerText,
                curso     : tds[3].innerText,
                turno     : tds[5].innerText,
                nivel     : tds[7].innerText,
                status    : tds[9].innerText,
                email     : tds[11].innerText,
                entrada   : tds[13].innerText,
                ira       : tds[18].innerText,
            }
        })
        // This disciplinas varible will be related to the current semester
        let disciplinas = await this.page.evaluate(()=> {
            let tds = Array.from(document.querySelectorAll('table')[35].querySelectorAll('tr td'))
            let disciplinas = []
            let pos = 0
            let cont = 0            
            for(var k in tds) {
                let e = tds[k]
                if(!isNaN(k)) {//is number
                    if(!disciplinas[pos]) disciplinas[pos] = {}

                    if(cont == 0)
                        disciplinas[pos].name = e.innerText
                    if(cont == 1)
                        disciplinas[pos].local = e.innerText
                    if(cont == 2)
                        disciplinas[pos].horario = e.innerText
                        
                    cont++
                    if(cont == 7) { cont=0; pos++ }
                }
            }
            return disciplinas
        })

        this.userData['dadosInstitucionais']     = dadosInstitucionais
        this.userData['disciplinas']             = disciplinas
        this.userData['quantidade_disciplinas']  = disciplinas.length

        console.log(this.userData);
        this.close()
    }

    close () {
        this.browser.close()
    }

}

module.exports = Client

