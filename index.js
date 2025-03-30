require('./keep_alive'); // Keep-alive serverni ishga tushirish

const mineflayer = require('mineflayer');
require('colors').enable();

// Qolgan bot kodi shu yerda davom etadi...

const botUsername = 'FN_01';
const botPassword = 'fortune321';
const admin = 'Umid';
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
        console.log("Bot serverga kirdi!");

        // AFK oldini olish uchun har 3 daqiqada bir sakrash
        setInterval(() => {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }, 3 * 60 * 1000);

        // Serverga kirganda /is warp sell yozish
        bot.chat("/is warp sell");

        // Har 1 daqiqada bir honey olish
        setInterval(() => {
            withdrawHoney(bot, mcData);
        }, 60 * 1000);
    });

    bot.on("messagestr", (message) => {
        if (message.startsWith("Skyblock »")) return;
        console.log(message);

        if (message === "Server: Serverni kunlik restartiga 30 sekund qoldi") {
            bot.quit("20min");
        }

        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }
        if (message.includes("Вы успешно вошли в аккаунт")) {
            bot.chat(`/is warp sell`);
        }
    });

    bot.on("whisper", (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith("1 ")) {
            const command = message.replace("1 ", "");
            bot.chat(command);
        }
    });

    bot.on('windowOpen', async (window) => {
        setTimeout(() => {
            bot.closeWindow(window);
        }, 19000);

        if (window.title.includes('Island Shop | Food')) {
            let honeyCount = bot.inventory.slots.reduce((sum, slot) => {
                return slot?.name === 'honey_bottle' ? sum + slot.count : sum;
            }, 0);

            for (let i = 0; i < honeyCount; i++) {
                setTimeout(() => {
                    bot.simpleClick.rightMouse(21, 0, 0);
                }, 20);
            }

            setTimeout(async () => {
                await bot.closeWindow(window);
                bot.chat('/is warp sell');
                bot.chat('/is withdraw money 9999999999999')
                bot.chat('/bal');
            }, honeyCount * 20 + 100);
        }
    });
}

async function withdrawHoney(bot, mcData) {
    bot.chat('/is warp sell');
    setTimeout(async () => {
        var chestPosition = await bot.findBlock({
            matching: mcData.blocksByName.chest.id,
            maxDistance: 5,
        });
        if (!chestPosition) return;

        let attempts = 0;
        let chest = null;
        const maxAttempts = 3;

        while (!chest && attempts < maxAttempts) {
            try {
                chest = await bot.openChest(chestPosition);
            } catch (error) {
                console.log(`Error opening chest: ${error}. Retrying...`);
                attempts++;
                if (error.includes(`timeout of 20000ms`)) {
                    await bot.quit('reconnect');
                }
            }
        }

        if (!chest) {
            console.log("Failed to open chest after multiple attempts.");
            return;
        }

        function hasFreeSlot() {
            return bot.inventory.emptySlotCount() > 0;
        }

        for (let slot of chest.slots) {
            if (slot?.name === 'honey_bottle' && slot?.count > 0) {
                while (slot.count > 0 && hasFreeSlot()) {
                    let countToWithdraw = Math.min(slot.count, bot.inventory.itemLimit - slot.count);
                    try {
                        await chest.withdraw(slot.type, null, countToWithdraw);
                        slot.count -= countToWithdraw;
                    } catch (error) {
                        break;
                    }
                }
                if (!hasFreeSlot()) {
                    break;
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await chest.close();
        await new Promise(resolve => setTimeout(resolve, 1000));
        bot.chat('/is shop Food');
    }, 500);
}
