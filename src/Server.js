const Client = require('./Client')
const {Telegraf} = require('telegraf')
const nodeHtmlToImage = require('node-html-to-image')
const fs = require('fs')
const {MenuTemplate, MenuMiddleware, Extra} = require('telegraf-inline-menu')

class Server {

    constructor (params) {
        if(!params || !params.telegramApiKey)
            throw Error("Check yout telegramApiKey.")
            
        this.telegramApiKey = params.telegramApiKey
    }    

    initialize () {
        console.log('init', this.telegramApiKey);        
        
        const menuTemplate = new MenuTemplate(ctx => {
            return {
                text: `Olá ${ctx.from.first_name} Seja bem vindo ao *Brigaa*\n`,
                parse_mode: 'Markdown'
            }
        })

        menuTemplate.interact('Realizar Login', 'a', {
                do: async ctx => {
                    await ctx.replyWithHTML(
                        '<b>🔒 Realizar Login</b> \n\n Para realizar o login no sigaa: \n\n Digite:   /login <b>usuario</b> <b>senha</b> \n\n 👉 Exemplo: /login lauren10 senha1234'
                    )
                    return false
                }
            })
            menuTemplate.interact('Outros', 'b', {
                do: async ctx => {
                    await ctx.reply('Nada demais aqui..')
                    return false
                }
            })

        
        const menuMiddleware = new MenuMiddleware('/', menuTemplate)

        const bot = new Telegraf(this.telegramApiKey)
        bot.use(menuMiddleware)

        bot.command('start', ctx => menuMiddleware.replyToContext(ctx))
        
        bot.on('message', async ctx=>{
            
            if(ctx.update.message.text) {
                let msg = ctx.update.message.text
                let msgParts = msg.split(' ')

                if(msgParts[0] == '/comandos' && msgParts.length != 3)
                    return ctx.reply(`Desculpa mano, eu só sei fazer login por enquanto... :v`)

                if(msgParts[0] == '/login' && msgParts.length != 3)
                    return ctx.reply(`Opa, foi quase...\nVerifica se você digitou corretamente o comando... \nPara realizar o login digite:\n\n /login usuario senha `)
                
                // * LOGIN _ Store user data inside database and verify password sometimes, to validate if it stills right.
                if(msgParts[0] == '/login' && msgParts.length == 3) {
                    // return ctx.reply(`show ${msgParts[1]} ${msgParts[2]}`)
                    try {
                        const tempUserData = await new Client({user: msgParts[1], pass: msgParts[2]}).getUserData()
                        // console.log(tempUserData);
                        const img = await this.generateTable(tempUserData)
                        
                        return ctx.replyWithPhoto({ source: `./${tempUserData.dadosInstitucionais.matricula}.png` })

                        // return ctx.reply(tempUserData)
                    }catch(e) {
                        return ctx.reply(e.message)
                    }
                }
                
                
                return ctx.reply(`Comando ${msg} inválido. \nTenta aí: /comandos pra ver se tem na lista..`)
            }
        })

        bot.launch()
        
    }

    async generateTable (tempUserData) {        
        
        // const tempUserData = {
        //     nome: 'SOSTENES APOLLO M. M. DA SILVA',
        //     unidade: 'CENTRO DE TECNOLOGIA (11.00.28)',
        //     foto: 'https://sigaa.ufpi.br/sigaa/verFoto?idArquivo=3321727&key=fd02bd245b8cdb4651e82c8395533fe9',
        //     semestre: '2000.2',
        //     dadosInstitucionais: {
        //       matricula: '1234',
        //       curso: 'CT - ENGENHARIA ELÉTRICA - Presencial - Teresina',
        //       turno: 'Matutino, Vespertino e Noturno (MTN)',
        //       nivel: 'GRADUAÇÃO',
        //       status: 'ATIVO',
        //       email: 'sostenesapollo232@gm...',
        //       entrada: '2000.2',
        //       ira: 'asd'
        //     },
        //     disciplinas: [
        //       {
        //         name: 'CÁLCULO  IIII',
        //         local: 'Remoto',
        //         horario: '24M34'
        //       },
        //       { name: 'EMPRenna asasdsad asdasdsa', local: 'Remoto', horario: '24M56' },
        //       {
        //         name: 'ERGONOMIA E SEGURANÇA NO TRABALHO',
        //         local: 'Remoto',
        //         horario: '6T345'
        //       },
        //       { name: 'FÍSICA 9', local: 'Sala Remota', horario: '35M56' },
        //       { name: 'MECANICA GERAL.', local: 'Sala remota', horario: '35M34' }
        //     ],
        //     quantidade_disciplinas: 5
        // }            
        var colorArray = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D','#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC','#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399','#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933','#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

        let theads = '<th>🕒</th>'
        let weekDays = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

        for(var i in weekDays) { theads += `<th class="text-center">${weekDays[i]}</th>` }

        let horariosByDay = []

        for(var i in tempUserData.disciplinas) {

            let disc = tempUserData.disciplinas[i]
            
            if(disc.name)
                disc.name = disc.name.split(' ').map(e=> `${e.substring(0,4)}.`).join(' ')

            disc.color = colorArray[i]
            
            if(disc.horario.includes('M')) {
                var [dias, horarios] = disc.horario.split('M'); var splitHorario = 'm'
            } if(disc.horario.includes('T')) {
                var [dias, horarios] = disc.horario.split('T'); var splitHorario = 't'
            } if(disc.horario.includes('N')) {
                var [dias, horarios] = disc.horario.split('N'); var splitHorario = 'n'
            }
            
            for(var d in dias) {
                for(var h in horarios) {
                    // console.log(dias[d], horarios[h], disc.name);
                    var horarioNumb  = parseInt(horarios[h])
                    if(splitHorario == 't') horarioNumb += 6
                    if(splitHorario == 'n') horarioNumb += 12
                    if(!horariosByDay[horarioNumb])horariosByDay[horarioNumb] = {}                                    

                    horariosByDay[horarioNumb][parseInt(dias[d])] = {name: disc.name, color: disc.color}
                }
            }             
        }

        var horariosTrs = ''
        
        const currentTime = new Date();
        currentTime.setHours(7);

        for(var f = 2; f <= 12; f++) {
            var horarioTds = ''
            for(var l = 2; l <= 8; l++) {
                if(horariosByDay[f] && horariosByDay[f][l])
                    horarioTds += `<td class="text-center" style="background:${horariosByDay[f][l].color}">${horariosByDay[f][l].name}</td>`
                else
                    horarioTds += `<td class="text-center">---</td>`
            }
            horariosTrs += `<tr><td style="font-size:13px">${currentTime.getHours()}:00 </br> ${currentTime.getHours()+1}:00<td>${horarioTds}</tr>`                
            currentTime.setHours( currentTime.getHours() + 1 )
        }


        const tbody = `
            <thead>
                <tr style="font-size:14px">${theads}</tr>
            </thead>
            <tbody>
                ${horariosTrs}
            </tbody>
        `

        try {
            const uri = await this.createImage(tempUserData, tbody)
            return true
        }catch(e) {
            console.log('Error to generate image', e);
            return false
        }
        
    }

    createImage (tempUserData, tbody) {
        return new Promise((res, rej)=>{
            nodeHtmlToImage({
                output: `./${tempUserData.dadosInstitucionais.matricula}.png`,
                html: fs.readFileSync('./schedule.html')
                        .toString()
                        .replace('<periodo>', tempUserData.semestre)
                        .replace('<nome>', tempUserData.nome)
                        .replace('<unidade>', tempUserData.unidade)
                        .replace('<matricula>', tempUserData.dadosInstitucionais.matricula)
                        .replace('<curso>', tempUserData.dadosInstitucionais.curso)
                        .replace('<profilePic>', tempUserData.foto)
                        .replace('<TBODY>', tbody)
            })
            .then(() => {                
                res(true)
            })
            .catch((e) => {rej(e)})
        })
    }
}

module.exports = Server

