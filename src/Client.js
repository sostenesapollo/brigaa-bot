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
        try {
            this.browser = await puppeteer.launch({
                headless: this.headless === 'true',
                args: [
                    '--no-sandbox',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ]}
            );
            // this.page = await this.browser.newPage()
            this.page = (await this.browser.pages())[0];
                console.log(urls.login)
            await this.page.goto(urls.login, { waitUntil: 'networkidle0' })

            // this.page.on('console', consoleObj => console.log(consoleObj.text()));

            await this.page.$eval('input[name="user.login"]', (el, credentials) => el.value = credentials.user, this.credentials)
            await this.page.$eval('input[name="user.senha"]', (el, credentials) => el.value = credentials.pass, this.credentials)

            this.page.keyboard.press('Enter');

            await this.page.waitForNavigation();

            let invalidCredentials = await this.page.evaluate(() => document.querySelectorAll('center')[1].innerText)

            if(invalidCredentials == 'Usuário e/ou senha inválidos'){
                this.close()
                return {error: "💩 Usuário e/ou senha inválidos ..."}
            }

            return {logged: true}
        }catch(e) {
            throw new Error('Erro ao realizar login'+e.message)
        }

        // Create verification if is in the main page.
    }

    async getUserData () {
        const logged = await this.login()
        if(!logged.logged)
            throw new Error(logged.error);

        this.userData = {}
        this.userData.nome = await this.page.evaluate(() => document.querySelectorAll('.usuario')[0].innerText)
        this.userData.unidade = await this.page.evaluate(() => document.querySelectorAll('.unidade')[0].innerText)
        this.userData.foto = await this.page.evaluate(() => document.getElementsByClassName('foto')[0].querySelector('img').src)
        this.userData.semestre = await this.page.evaluate(() => document.getElementsByClassName('periodo-atual')[0].innerText.split(' ')[2])

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

        this.close()
        
        console.log(this.userData);
        return this.userData
    }

    close () {
        this.browser.close()
    }

}

module.exports = Client

