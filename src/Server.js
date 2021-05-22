const Client = require('./Client')
const {Telegraf} = require('telegraf')
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

                if(msgParts[0] == '/login' && msgParts.length != 3)
                    return ctx.reply(`Opa, foi quase...\nVerifica se você digitou corretamente o comando... \nPara realizar o login digite:\n\n /login usuario senha `)
                
                // * LOGIN _ Store user data inside database and verify password sometimes, to validate if it stills right.
                if(msgParts[0] == '/login' && msgParts.length == 3) {
                    // return ctx.reply(`show ${msgParts[1]} ${msgParts[2]}`)
                    try {
                        const tempUserData = await new Client({user: msgParts[1], pass: msgParts[2]}).getUserData()
                        console.log(tempUserData);
                        return ctx.reply(tempUserData)
                    }catch(e) {
                        return ctx.reply(e.message)
                    }
                }
                
                
                return ctx.reply(`Comando ${msg} inválido. \nTenta aí: /comandos pra ver se tem na lista..`)
            }
        })

        bot.launch()
    }

}

module.exports = Server

