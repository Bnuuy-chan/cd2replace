"use strict";

const { readdirSync } = require("fs");
const carFiles = readdirSync("./src/cars").filter(file => file.endsWith(".json"));
const order = ["cr", "modelYear", "country", "enginePos", "driveType", "gc", "creator", "tyreType", "seatCount", "fuelType", "bodyStyle", "abs", "tcs", "tags", "collection", "isOwned", "isStock", "isMaxed", "isBM", "isPrize", "make", "search"];

function reqDisplay(reqs, filterLogic) {
    const action = {
        cr: arg => {
            let { start, end } = arg;
            if (start === end) return `CR${start} `;
            else return `CR${start} ~ ${end} `;
        },
        modelYear: arg => {
            let { start, end } = arg;
            if (start % 10 === 0 && end === start + 9) return `${start}s `;
            else if (start === end) return `${start} `;
            else return `${start} ~ ${end} `;
        },
        country: country => `${country.toUpperCase()} `,
        enginePos: enginePos => `${enginePos[0].toUpperCase() + enginePos.slice(1, enginePos.length)}-Engine `,
        driveType: drive => `${drive.toUpperCase()} `,
        gc: gc => `${gc[0].toUpperCase() + gc.slice(1, gc.length)}-GC `,
		creator: creator => `${creator} `,
        seatCount: arg => {
            let { start, end } = arg;
            if (start === end) return `${start}-Seat `;
            else return `${start} ~ ${end}-Seat `;
        },
        fuelType: fuel => `${fuel[0].toUpperCase() + fuel.slice(1, fuel.length)} `,
        bodyStyle: bodyTypes => `${bodyTypes.join(filterLogic ? " or " : " and ").split(" ").map(i => i[0].toUpperCase() + i.slice(1, i.length)).join(" ")} `,
        tyreType: tyreType => `${tyreType.split("-").map(i => i[0].toUpperCase() + i.slice(1, i.length)).join("-")}-Tyre `,
        abs: abs => abs ? "ABS-inclusive " : "ABS-less ",
        tcs: tcs => tcs ? "TCS-inclusive " : "TCS-less ",
        tags: tags => `${tags.join(filterLogic ? " or " : " and ").split(" ").map(i => i[0].toUpperCase() + i.slice(1, i.length)).join(" ")} `,
        collection: collection => `${collection.join(filterLogic ? " or " : " and ").split(" ").map(i => i[0].toUpperCase() + i.slice(1, i.length)).join(" ")} `,
        isPrize: isPrize => `${isPrize === false ? "Non-Prize" : "Prize"} `,
        isStock: isStock => `${isStock === false ? "Non-Stock" : "Stock"} `,
        isMaxed: isMaxed => `${isMaxed === false ? "Non-Maxed" : "Maxed"} `,
        isOwned: isOwned => `${isOwned === false ? "Unowned" : "Owned"} `,
        isBM: isBM => `${isBM === false ? "Non-BM" : "BM"} `,
        make: makes => {
            makes = makes.map(make => {
                let getExample = carFiles.find(carFile => {
                    let currentCar = require(`../../cars/${carFile}`);
                    if (Array.isArray(currentCar["make"])) {
                        return currentCar["make"].some(tag => tag.toLowerCase() === make.toLowerCase());
                    }
                    else {
                        return currentCar["make"].toLowerCase() === make.toLowerCase();
                    }
                });
                
                let car = require(`../../cars/${getExample}`);
                if (Array.isArray(car["make"])) {
                    return car["make"].find(i => i.toLowerCase() === make.toLowerCase());
                }
                else {
                    return car["make"];
                }
            });
            return `${makes.join(filterLogic ? " or " : " and ").split(" ").map(i => i[0].toUpperCase() + i.slice(1, i.length)).join(" ")} `;
        },
        search: keyword => `${keyword.split(" ").map(i => i[0].toUpperCase() + i.slice(1, i.length)).join(" ")} `
    }
    let str = "";
    for (let criteria of order) {
        if (reqs[criteria] !== undefined) {
            str += action[criteria](reqs[criteria]);
        }
    }
    if (Object.keys(reqs).length === 0) return "Open Match";
    else return str.slice(0, -1);
}

module.exports = reqDisplay;
