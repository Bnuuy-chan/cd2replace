"use strict";

const bot = require("../config/config.js");
const { SuccessMessage, ErrorMessage } = require("../util/classes/classes.js");
const { trophyEmojiID } = require("../util/consts/consts.js");
const searchUser = require("../util/functions/searchUser.js");
const botUserError = require("../util/commonerrors/botUserError.js");
const profileModel = require("../models/profileSchema.js");

module.exports = {
    name: "removetrophies",
    aliases: ["rmvtrophies"],
    usage: "<username> <amount here>",
    args: 2,
    category: "Admin",
    description: "Removes a certain amount of trophies from someone.",
    async execute(message, args) {
        if (message.mentions.users.first()) {
            if (!message.mentions.users.first().bot) {
                await removeTrophies(message.mentions.users.first());
            }
            else {
                return botUserError(message);
            }
        }
        else {
            await new Promise(resolve => resolve(searchUser(message, args[0].toLowerCase())))
                .then(async (response) => {
                    if (!Array.isArray(response)) return;
                    let [result, currentMessage] = response;
                    await removeTrophies(result.user, currentMessage);
                })
                .catch(error => {
                    throw error;
                });
        }

        async function removeTrophies(user, currentMessage) {
            const trophyEmoji = bot.emojis.cache.get(trophyEmojiID);
            const amount = Math.ceil(parseInt(args[1]));
            if (isNaN(amount) || parseInt(amount) < 1) {
                const errorMessage = new ErrorMessage({
                    channel: message.channel,
                    title: "Error, trophy amount provided is not a positive number.",
                    desc: "The amount of trophies you want to add should always be a positive number, i.e: `133`, `7`, etc.",
                    author: message.author
                }).displayClosest(amount);
                return errorMessage.sendMessage({ currentMessage });
            }

            const playerData = await profileModel.findOne({ userID: user.id });
            if (amount <= playerData.trophies) {
                const balance = playerData.trophies - amount;
                await profileModel.updateOne({ userID: user.id }, { trophies: balance });
                const successMessage = new SuccessMessage({
                    channel: message.channel,
                    title: `Successfully removed ${trophyEmoji}${amount.toLocaleString("en")} from ${user.username}'s trophy amount!`,
                    desc: `Current Trophy Amount: ${trophyEmoji}${balance.toLocaleString("en")}`,
                    author: message.author,
                    thumbnail: user.displayAvatarURL({ format: "png", dynamic: true })
                });
                return successMessage.sendMessage({ currentMessage });
            }
            else {
                const errorMessage = new ErrorMessage({
                    channel: message.channel,
                    title: "Error, a user's trophy amount cannot be in the negatives.",
                    desc: "The amount of trophies that can be taken away should not be bigger than the user's trophy amount.",
                    author: message.author,
                    thumbnail: user.displayAvatarURL({ format: "png", dynamic: true }),
                    fields: [
                        { name: `${user.username}'s Trophy Amount (${trophyEmoji})`, value: `\`${playerData.trophies.toLocaleString("en")}\``, inline: true }
                    ]
                }).displayClosest(amount);
                return errorMessage.sendMessage({ currentMessage });
            }
        }
    }
};