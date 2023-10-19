"use strict";

const { readdirSync } = require("fs");
const carFiles = readdirSync("./src/cars").filter(file => file.endsWith(".json"));
const { InfoMessage, ErrorMessage } = require("../classes/classes.js");
const carNameGen = require("./carNameGen.js");
const filterCheck = require("./filterCheck.js");
const sortCars = require("./sortCars.js");

async function openPack(args) {
    const { message, currentPack, currentMessage, test } = args;
    const cardFilter = currentPack["filter"];
    let rand, check, rqStart, rqEnd, pulledCards = "";
    let currentCard = require(`../../cars/${carFiles[Math.floor(Math.random() * carFiles.length)]}`);
    let addedCars = [];

    for (let i = 0; i < currentPack["repetition"] * 5; i++) {
        rand = Math.floor(Math.random() * 1000) / 10;
        check = 0;
        for (let rarity of Object.keys(currentPack["packSequence"][Math.floor(i / currentPack["repetition"])])) {
            check += currentPack["packSequence"][Math.floor(i / currentPack["repetition"])][rarity];
            if (check > rand) {
                switch (rarity) {
                    case "common":
                        rqStart = 1;
                        rqEnd = 19;
                        break;
                    case "uncommon":
                        rqStart = 20;
                        rqEnd = 29;
                        break;
                    case "rare":
                        rqStart = 30;
                        rqEnd = 39;
                        break;
                    case "superRare":
                        rqStart = 40;
                        rqEnd = 49;
                        break;
                    case "ultraRare":
                        rqStart = 50;
                        rqEnd = 64;
                        break;
                    case "epic":
                        rqStart = 65;
                        rqEnd = 79;
                        break;
                    case "legendary":
                        rqStart = 80;
                        rqEnd = 999;
                        break;
                    default:
                        break;
                }
                break;
            }
        }

        let carFile = carFiles[Math.floor(Math.random() * carFiles.length)], timeoutCounter = 0;
        currentCard = require(`../../cars/${carFile}`);
        while ((currentCard["rq"] < rqStart || currentCard["rq"] > rqEnd || filterCard(carFile, cardFilter) === false) && timeoutCounter < 50000) {
            carFile = carFiles[Math.floor(Math.random() * carFiles.length)];
            currentCard = require(`../../cars/${carFile}`);
            timeoutCounter++;
        }

        if (timeoutCounter >= 50000) {
            const errorMessage = new ErrorMessage({
                channel: message.channel,
                title: "Error, pack generation timed out likely due to no cars in generation pool.",
                desc: "Don't worry, your money is refunded. (provided that you bought the pack)",
                author: message.author,
                footer: "Disclaimer: There is an *extremely* rare chance of this error to pop up even though nothing went wrong."
            });
            return errorMessage.sendMessage({ currentMessage });
        }
        addedCars.push({ carID: carFile.slice(0, 6), upgrade: "000"});
    }

    addedCars = sortCars(addedCars, "rq", "ascending");

    for (let i = 0; i < addedCars.length; i++) {
        let currentCar = require(`../../cars/${addedCars[i].carID}.json`);
        pulledCards += carNameGen({ currentCar, rarity: true });

        if ((i + 1) % 5 !== 0) {
            pulledCards += ` **[[Card]](${currentCar["racehud"]})**\n`;
        }
        else {
            const packScreen = new InfoMessage({
                channel: message.channel,
                title: `Opening ${currentPack["packName"]}...`,
                desc: "Click on the image to see the cards better.",
                author: message.author,
                image: currentCar["racehud"],
                thumbnail: currentPack["pack"],
                fields: [{ name: "Cards Pulled", value: pulledCards }],
                footer: test ? "This is a test pack, meaning that these cars won't be added into your garage and you won't be charged with money." : null
            });
            await packScreen.sendMessage({ currentMessage: i === 4 ? currentMessage : null, preserve: true });
            pulledCards = "";
        }
    }
    return addedCars;

    function filterCard(carFile, filter) {
        let currentCard = require(`../../cars/${carFile}`);
        if (currentCard["reference"] || currentCard["isPrize"] === true) return false;
        // return filterCheck({ car: carFile, filter });
        let passed = true;
        for (let criteria in filter) {
            if (filter[criteria] !== "None") {
                switch (criteria) {
                    case "make":
                    case "tags":
					case "creator":
                    case "bodyStyle":
                        if (Array.isArray(currentCard[criteria])) {
                            if (currentCard[criteria].some(m => m.toLowerCase() === filter[criteria].toLowerCase()) === false) passed = false;
                        }
                        else {
                            if (currentCard[criteria].toLowerCase() !== filter[criteria].toLowerCase()) passed = false;
                        }
                        break;
                    case "modelYear":
                    case "seatCount":
                        if (currentCard[criteria] < filter[criteria]["start"] || currentCard[criteria] > filter[criteria]["end"]) passed = false;
                        break;
default:
  if (
    typeof currentCard[criteria] === 'string' &&
    typeof filter[criteria] === 'string' &&
    currentCard[criteria].toLowerCase() !== filter[criteria].toLowerCase()
  ) {
    passed = false;
  }
  break;
                }
            }
        }
        return passed;
    }
}

module.exports = openPack;