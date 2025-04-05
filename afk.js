const mineflayer = require('mineflayer');
require('colors').enable();

const botUsername = 'FN_Glass';
const botPassword = 'fortune321';
const admin = 'Umid';
var playerList = [];
var mcData;

const botOption = {
    host: 'hypixel.uz',
    port: 25565,
    username: botUsername,
    password: botPassword,
    version: '1.18.1',
};

init();

function init() {
    var bot = mineflayer.createBot(botOption);

    bot.on("spawn", () => {
        mcData = require("minecraft-data")(bot.version);

        // AFK oldini olish uchun har 3 daqiqada bir sakrash
        setInterval(() => {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }, 3 * 60 * 1000);
    });

    bot.on("messagestr", (message) => {
        if (message.startsWith("Skyblock »")) return;
        console.log(message);

        // Server restart bo'lsa chiqish
        if (message === "Server: Serverni kunlik restartiga 30 sekund qoldi") {
            bot.quit("20min");
        }

        // Ro‘yxatdan o‘tish yoki login qilish
        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }
	if (message.includes("Вы успешно вошли в аккаунт")) {
            bot.chat(`/is warp afk`);
        }
    });

    // Admindan buyruqlarni bajarish
    bot.on("whisper", (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith("! ")) {
            const command = message.replace("! ", "");
            bot.chat(command);
        }
    });
}
