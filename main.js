const puppeteer = require('puppeteer');

(async () => {

  const fs = require('fs');
  const credentialsFileContent = await fs.readFileSync('credentials.json').toString()
  const credentials            = JSON.parse(credentialsFileContent)
  console.log(credentials);


  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();

  await page.goto('https://sigaa.ufpi.br/sigaa/verTelaLogin.do', { waitUntil: 'networkidle0' })

  page.on('console', consoleObj => console.log(consoleObj.text()));
  page.on('credentials', credObj => credentials);

  await page.$eval('input[name="user.login"]', (el, credentials) => el.value = credentials.user, credentials)
  await page.$eval('input[name="user.senha"]', (el, credentials) => el.value = credentials.pass, credentials)

  page.keyboard.press('Enter');

  console.log('logando..');
  await page.waitForNavigation();
  console.log('logado.');

  let userData = {}
  userData.nome = await page.evaluate(() => document.querySelectorAll('.usuario')[0].innerText)
  userData.unidade = await page.evaluate(() => document.querySelectorAll('.unidade')[0].innerText)
  userData.foto = await page.evaluate(() => document.getElementsByClassName('foto')[0].querySelector('img').src)
  
  let dadosInstitucionais = await page.evaluate(() => {

    var tds = Array.from(document.querySelectorAll('table')[33].querySelectorAll('tr td'))
    
    var dados = {
      matricula : tds[1].innerText,
      curso     : tds[3].innerText,
      turno     : tds[5].innerText,
      nivel     : tds[7].innerText,
      status    : tds[9].innerText,
      email     : tds[11].innerText,
      entrada   : tds[13].innerText,
      ira       : tds[18].innerText,
    }

    return dados
  })
  
  let disciplinas = await page.evaluate(function () {

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

  userData['dadosInstitucionais']     = dadosInstitucionais
  userData['disciplinas']             = disciplinas
  userData['quantidade_disciplinas']  = disciplinas

  console.log(userData);
  
})();