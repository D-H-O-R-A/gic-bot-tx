

import fs from "fs";

function saveEnvVariable(key, value) {
    const envFile = ".env";
    let envData = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
    
    const regex = new RegExp(`^${key}=.*`, "m");
    if (regex.test(envData)) {
        envData = envData.replace(regex, `${key}=${value}`);
    } else {
        envData += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envFile, envData.trim() + "\n");
    console.log(`${key} saved successfully!`);
}

function saveToConfig(key, data) {
    const configFile = "config.json";
    let config = {};

    // Load existing config if file exists
    if (fs.existsSync(configFile)) {
        const fileData = fs.readFileSync(configFile, "utf8");
        try {
            config = JSON.parse(fileData);
        } catch (error) {
            console.error("Error parsing config.json:", error);
        }
    }

    // Append or update the key with new data
    if (!config[key]) {
        config[key] = [];
    }
    config[key].push(data);

    // Save updated config
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    console.log(`Saved ${key} data to config.json`);
}

function deleteFromConfig(key) {
    const configFile = "config.json";
    let config = {};

    // Verifica se o arquivo existe antes de tentar ler
    if (fs.existsSync(configFile)) {
        const fileData = fs.readFileSync(configFile, "utf8");
        try {
            config = JSON.parse(fileData);
        } catch (error) {
            console.error("Erro ao analisar config.json:", error);
            return;
        }
    }

    // Verifica se a chave existe antes de deletar
    if (config[key]) {
        delete config[key];
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        console.log(`Removido ${key} do config.json`);
    } else {
        console.log(`Chave ${key} não encontrada no config.json`);
    }
}

function deleteSeedFromConfig(seedToDelete) {
    const configFile = "config.json";
    let config = {};

    if (fs.existsSync(configFile)) {
        const fileData = fs.readFileSync(configFile, "utf8");
        try {
            config = JSON.parse(fileData);
        } catch (error) {
            console.error("Erro ao analisar config.json:", error);
            return;
        }
    }

    if (config["generated_addresses"]) {
        const initialLength = config["generated_addresses"].length;
        config["generated_addresses"] = config["generated_addresses"].filter(entry => entry.seed !== seedToDelete);
        
        if (config["generated_addresses"].length < initialLength) {
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            console.log(`Removido seed ${seedToDelete} do config.json`);
        } else {
            console.log(`Seed ${seedToDelete} não encontrada no config.json`);
        }
    } else {
        console.log("Nenhum endereço gerado encontrado no config.json");
    }
}
export {saveEnvVariable,saveToConfig,deleteFromConfig,deleteSeedFromConfig}