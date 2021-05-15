const puppeteer = require('puppeteer');

(async () => {

  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  
  await page.goto('https://sigaa.ufpi.br/sigaa/verTelaLogin.do', { waitUntil: 'networkidle0' })

  await page.$eval('input[name="user.login"]', el => el.value = '');
  await page.$eval('input[name="user.senha"]', el => el.value = '');
  
  page.keyboard.press('Enter');

  console.log('logando..');
  await page.waitForNavigation();
  console.log('logado.');
  
  const nome = await page.evaluate(() => document.querySelectorAll('.usuario')[0].innerText)
  const unidade = await page.evaluate(() => document.querySelectorAll('.unidade')[0].innerText)

    var userData = {nome, unidade}

    console.log(userData);
})();