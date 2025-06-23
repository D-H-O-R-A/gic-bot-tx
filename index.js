import figlet from "figlet";
import gradient from "gradient-string"; // Substitui `chalk` para melhor compatibilidade com ESM
import cliInitial from "./interface/command.js";
import startV2 from "./interface/commandV2.js";
import dotenv from "dotenv";

dotenv.config();

function start() {
    // Texto grande
    figlet.text("Bot Massive Tx", { font: "Big" }, (err, data) => {
        if (err) {
            console.error("Erro ao gerar ASCII.");
            return;
        }
        console.log(gradient(['green','blue'])(data)); // Usa um gradiente verde

        // Texto pequeno
        console.log(gradient(['green','blue'])("Create By Diego H. O. R. Antunes"));
        if(process.env.VERSION === 'v2') {
            startV2();
        }else{
            cliInitial();
        }
    });
}

start()