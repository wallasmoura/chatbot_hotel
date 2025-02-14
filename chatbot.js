const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');
const client = new Client();

// Objeto para controlar os usuários que já receberam a mensagem de boas-vindas
const activeConversations = {};

// Variável para armazenar o número do bot
const botNumber = '5579988224788@c.us'; // Substitua pelo número do seu bot

// Tempo de inatividade em milissegundos (10 minutos)
const INACTIVITY_TIMEOUT = 1 * 60 * 1000;

// Serviço de leitura do QR code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Após isso ele diz que foi tudo certo
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Inicializando o bot
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

// Função para verificar a inatividade
const checkInactivity = async () => {
    const currentTime = Date.now();
    
    for (let user in activeConversations) {
        const lastInteraction = activeConversations[user].lastInteraction;
        
        if (currentTime - lastInteraction > INACTIVITY_TIMEOUT) {
            // Se a inatividade for maior que o limite, encerra a conversa
            await client.sendMessage(user, 'Você foi desconectado por inatividade. Até mais! 👋');
            delete activeConversations[user]; // Marca a conversa como inativada
            console.log(`Conversa com ${user} inativada por inatividade.`);
        }
    }
};

// Intervalo para verificar a inatividade (a cada 1 minuto)
setInterval(checkInactivity, 50 * 1000);

client.on('message', async msg => {


    // Verifica se já existe uma conversa ativa com esse usuário
    if (activeConversations[msg.from]) {
        // Atualiza o tempo da última interação
        activeConversations[msg.from].lastInteraction = Date.now();
        return; // Não responde mais se já está ativo
    }

    let name;

    // Menu inicial
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); // Delay de 1 segundo
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(1000); // Delay de 1 segundo
        const contact = await msg.getContact(); // Pegando o contato
        const name = contact.pushname; // Pegando o nome do contato
        await client.sendMessage(msg.from, 'Olá, ' + name.split(" ")[0] + ' \n\nObrigado por entrar em contato com o Palace Green Hotel! \nVisite nosso site www.palacegreenhotel.com.br  e confira todas as opções de acomodações.'); // Primeira mensagem de texto
        await delay(2000); // Delay de 2 segundos
        await client.sendMessage(msg.from, 'Como podemos ajudar você hoje? 😊'); // Segunda mensagem de texto

        // Marca a conversa como ativa, para não responder novamente
        activeConversations[msg.from] = { lastInteraction: Date.now() };

        console.log(`Conversa com ${msg.from} iniciada.`);
    }
});
