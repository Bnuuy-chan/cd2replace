"use strict";

const bot = require("../config/config.js");
const { readdirSync } = require("fs");
const packFiles = readdirSync("./src/packs").filter(file => file.endsWith('.json'));
const { InfoMessage } = require("../util/classes/classes.js");
const { moneyEmojiID } = require("../util/consts/consts.js");
const search = require("../util/functions/search.js");

module.exports = {
    name: "packinfo",
    aliases: ["pinfo"],
    usage: ["<pack name>", "-<pack id>"],
    args: 1,
    category: "Configuration",
    description: "Shows info about a specified card pack.",
    async execute(message, args) {
        let query = args.map(i => i.toLowerCase()), searchBy = "pack";
        if (args[0].toLowerCase() === "random") {
            return displayInfo(packFiles[Math.floor(Math.random() * packFiles.length)]);
        }
        else if (args[0].toLowerCase().startsWith("-p")) {
            query = [args[0].toLowerCase().slice(1)];
            searchBy = "id";
        }

        await new Promise(resolve => resolve(search(message, query, packFiles, searchBy)))
            .then(response => {
                if (!Array.isArray(response)) return;
                displayInfo(...response);
            })
            .catch(error => {
                throw error;
            });

        function displayInfo(pack, currentMessage) {
            const moneyEmoji = bot.emojis.cache.get(moneyEmojiID);
            let currentPack = require(`../packs/${pack}`);
            let infoMessage = new InfoMessage({
                channel: message.channel,
                title: currentPack["packName"],
                desc: `ID: \`${pack.slice(0, 6)}\``,
                author: message.author,
                image: currentPack["pack"],
                fields: [
                    { name: "Price", value: currentPack["price"] ? `${moneyEmoji}${currentPack["price"].toLocaleString("en")}` : "Not Purchasable" },
                    { name: "Description", value: currentPack["description"] }
                ]
            });

            const fields = [];
            for (let i = 0; i < currentPack["packSequence"].length; i++) {
                let dropRate = "`";
                for (let rarity of Object.keys(currentPack["packSequence"][i])) {
                    dropRate += `${rarity}: ${currentPack["packSequence"][i][rarity]}%\n`;
                }
                dropRate += "`";
				const cardRange = currentPack["repetition"] > 1 ? `${i * currentPack["repetition"] + 1}~${(i + 1) * currentPack["repetition"]}` : (i + 1);
				fields.push({
				name: `Card(s) ${cardRange} Drop Rate`,
				value: dropRate,
				inline: true
                });
            }
            infoMessage.editEmbed({ fields });
            return infoMessage.sendMessage({ currentMessage });
        }
    }
};