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
  await page.pdf({ path: 'hn.pdf', format: 'a4' });
  console.log('logado.');

    //* Get name
    const nameContent = await page.evaluate(() => document.querySelector('[class="usuario"]').nameContent);
    const nome = nameContent.replace(/\n/g,"").replace(/\t/g,"")

    //* Get unity
    const unityContent = await page.evaluate(() => document.querySelector('[class="unidade"]').unityContent);
    const unidade = unityContent.replace(/\n/g,"").replace(/\t/g,"")    

    var userData = {nome, unidade}

    console.log(userData);
})();