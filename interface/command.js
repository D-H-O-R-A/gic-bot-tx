import readline from "readline";
import dotenv from "dotenv";
import {saveEnvVariable} from "../tools/tools.js"
import {sendTransactionsLoopToMe, sendTransactionsLoopRandom} from "../tools/web3.js"

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function cliInitial() {
    console.log("Welcome to CLI! Available commands:");
    console.log("setseed - Define the seed to be used (saved in .env)");
    console.log("setwss - Define an RPC WSS (saved in .env)");
    console.log("setchainid - Define a Chain ID (saved in .env)");
    console.log("settxperhour - Set the number of TX per hour (limit of 100,000, saved in .env)");
    console.log("setlimitcost - cost limit in GIC for the entire operation")
    console.log("setgas - set gas to use in tx. Ex: 22000000147000")
    console.log("start - Starts only if seed, WSS, Chain ID, and TX per hour are set in .env");
    console.log("close - Closes the CLI");

    rl.setPrompt("Command> ");
    rl.prompt();

    rl.on("line", async (input) => {
        const args = input.trim().split(" ");
        const command = args[0].toLowerCase();
        const value = args.slice(1).join(" ");

        switch (command) {
            case "setseed":
                if (!value) {
                    console.log("Error: Please provide a seed.");
                } else {
                    saveEnvVariable("PK", value);
                }
                break;
            case "setlimitcost":
                if(!value){
                    console.log("Error: Please provide a limitcost. Ex: 50");
                }else{
                    saveEnvVariable("LIMIT_COST", value*(10**18));
                }
                break;
            case "setgas":
                if(!value){
                    console.log("Error: Please provide a limitcost. Ex: 22000000147000");
                }else{
                    saveEnvVariable("GAS", value);
                }
                break;
            case "setwss":
                if (!value) {
                    console.log("Error: Please provide an RPC WSS.");
                } else {
                    saveEnvVariable("WSS_URL", value);
                }
                break;
            case "setaddr":
                if (!value) {
                    console.log("Error: Please provide an RPC WSS.");
                } else {
                    saveEnvVariable("ADDRESS", value);
                }
                break;
            case "setchainid":
                if (!value) {
                    console.log("Error: Please provide a Chain ID.");
                } else {
                    saveEnvVariable("CHAIN_ID", value);
                }
                break;
            case "settxperhour":
                const txPerHour = parseInt(value, 10);
                if (isNaN(txPerHour) || txPerHour <= 0 || txPerHour > 100000) {
                    console.log("Error: Set a valid value between 1 and 100,000.");
                } else {
                    saveEnvVariable("TX_PER_HOUR", txPerHour);
                }
                break;
            case "start":
                if (!process.env.PK || !process.env.WSS_URL || !process.env.CHAIN_ID || !process.env.TX_PER_HOUR || !process.env.ADDRESS || !process.env.GAS || !process.env.LIMIT_COST) {
                    console.log(`Error: (seed: ${process.env.PK}, WSS: ${process.env.WSS_URL }, Chain ID: ${process.env.CHAIN_ID }, address: ${process.env.ADDRESS }, GAS: ${process.env.GAS!=null}, LIMIT COST: ${process.env.LIMIT_COST}  and TX per hour: ${process.env.TX_PER_HOUR }) must be set.`);
                } else {
                    console.log("Starting...");
                    let tasks = [];
                    tasks.push((async () => { await sendTransactionsLoopRandom()})())
                    tasks.push((async () => { await sendTransactionsLoopToMe()})())
                    await Promise.all(tasks);
                }
                break;
            case "close":
                console.log("Stopping CLI...");
                rl.close();
                return;
            default:
                console.log("Unrecognized command. Please enter one of the listed commands.");
        }

        rl.prompt();
    });

    rl.on("close", () => {
        console.log("CLI closed.");
        process.exit(0);
    });
}

export default cliInitial;