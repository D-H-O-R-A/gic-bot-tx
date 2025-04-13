import dotenv from "dotenv";
import Web3 from "web3";
import { saveToConfig, deleteSeedFromConfig } from "./tools.js";
import { randomUUID } from 'crypto';

dotenv.config();
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WSS_URL));
let limittotal = 0;
const MAX_TX_PER_HOUR = process.env.TX_PER_HOUR;
const INTERVAL = (3600 / MAX_TX_PER_HOUR) * 1000; // Tempo entre transações em ms

async function getGasPrice() {
    return await web3.eth.getGasPrice();
}

async function sendTransactionsLoopRandom() {
    console.log("Start: sendTransactionsLoopRandom")
    const uniqueKey = randomUUID();
    while (true) { // Loop infinito para manter a taxa de 100.000 tx/hora
        let txCount = 0;
        const startTime = Date.now();
        
        while (txCount < MAX_TX_PER_HOUR) {
            try {
                const address = generateRandomAddress(uniqueKey);
                console.log("Random Address:", address.address);
                
                if (limittotal >= process.env.LIMIT_COST) {
                    console.log("Limite de custo atingido");
                    return process.exit(1); // Close the application
                }

                const successTx1 = await transferFunds(
                    process.env.ADDRESS,
                    address.address,
                    "10000000000000000", // Valor em Wei
                    process.env.PK,
                    false
                );

                if (successTx1) {
                    const successTx2 = await transferFunds(
                        address.address,
                        process.env.ADDRESS,
                        "4500000000000000", // Valor em Wei
                        address.seed,
                        true
                    );

                    if (successTx2) {
                        const successTx3 = await transferFunds(
                            address.address,
                            process.env.ADDRESS,
                            "4500000000000000", // Valor em Wei
                            address.seed,
                            true
                        );
    
                        if (successTx3) {
                            deleteSeedFromConfig(address.seed,uniqueKey);
                        }else{
                            console.error("🚨 Second transaction failed! 🚨");
                            console.error("Seed:", address.seed);
                            console.error("Address:", address.address);
                            process.exit(1); // Close the application
                        }
                    }else{
                        console.error("🚨 Second transaction failed! 🚨");
                        console.error("Seed:", address.seed);
                        console.error("Address:", address.address);
                        process.exit(1); // Close the application
                    }
                }

                txCount++;
                await new Promise(resolve => setTimeout(resolve, INTERVAL)); // Controla a taxa de envio
            } catch (error) {
                console.error("Erro ao enviar transação:", error);
            }
        }

        // Aguarda o tempo restante até completar 1 hora antes de reiniciar
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 3600000 - elapsedTime;
        console.log(`🔄 Finalizou lote de transações

            Tipo: Random (eu para random, ramdom para eu)
            Foco: Gerar Volume de novos Address

            ⏳ Tempo decorrido: ${elapsedTime / 1000} segundos
            📌 Total de TX enviadas: ${txCount}
            💰 Valor gasto até o momento: ${limittotal}
            🎯 Limite de gasto: ${process.env.LIMIT_COST}
            `);
        if (remainingTime > 0) {
            console.log(`Aguardando ${remainingTime / 1000} segundos para reiniciar envio.`);

            await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
    }
}

async function sendTransactionsLoopToAnother(address) {
    console.log("Start: sendTransactionsLoopToAnother")
    while (true) {
        if (limittotal >= process.env.LIMIT_COST) {
            console.log("🔴 Limite de custo atingido");
            process.exit(1);
        }

        let txCount = 0;
        const startTime = Date.now();

        for (let i = 0; i < MAX_TX_PER_HOUR; i++) {
            try {
                await transferFunds(
                    process.env.ADDRESS,
                    address,
                    "10000000000000000",
                    process.env.PK,
                    false
                );
                txCount++;
            } catch (error) {
                console.error("❌ Erro ao processar transação:", error);
            }
            
            // Delay de 350ms entre cada transação
            await new Promise(resolve => setTimeout(resolve, 350));
        }

        const elapsedTime = Date.now() - startTime;
        console.log(`🔄 Finalizou lote de transações 
        
        Tipo: To Another Address (meu address para outro address)
        Foco: Gerar Volume de Tx

        ⏳ Tempo decorrido: ${elapsedTime / 1000} segundos
        📌 Total de TX enviadas: ${txCount}
        💰 Valor gasto até o momento: ${limittotal}
        🎯 Limite de gasto: ${process.env.LIMIT_COST}
        `);

        await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
}

async function sendTransactionsLoopToMe() {
    console.log("Start: sendTransactionsLoopToMe");
    while (true) {
        if (limittotal >= process.env.LIMIT_COST) {
            console.log("🔴 Limite de custo atingido");
            process.exit(1);
        }

        let txCount = 0;
        const startTime = Date.now();
        const address = process.env.ADDRESS;

        for (let i = 0; i < MAX_TX_PER_HOUR; i++) {
            try {
                await transferFunds(
                    address,
                    address,
                    "10000000000000000",
                    process.env.PK,
                    false
                );
                txCount++;
            } catch (error) {
                console.error("❌ Erro ao processar transação:", error);
            }
            
            // Delay de 350ms entre cada transação
            await new Promise(resolve => setTimeout(resolve, 350));
        }

        const elapsedTime = Date.now() - startTime;
        console.log(`🔄 Finalizou lote de transações 
        
        Tipo: To me (meu address para meu address)
        Foco: Gerar Volume de Tx

        ⏳ Tempo decorrido: ${elapsedTime / 1000} segundos
        📌 Total de TX enviadas: ${txCount}
        💰 Valor gasto até o momento: ${limittotal}
        🎯 Limite de gasto: ${process.env.LIMIT_COST}
        `);

        await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
}


// Transfer value to another address
async function transferFunds(from, to, amount, privateKey, israndom,retry = 0) {
    try {
        const nonce = await web3.eth.getTransactionCount(from, "pending");
        const gasPrice = await getGasPrice();
        const gas = parseInt(process.env.GAS);

        const tx = {
            from,
            to,
            value: process.env.MINIMUN_TRANSFER ? process.env.MINIMUN_TRANSFER : ( israndom ? parseInt(amount) - gas : amount), // Já está em Wei
            gas: 21000,
            gasPrice,
            nonce: Number(nonce)+retry,
            chainId: process.env.CHAIN_ID
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log("Transaction successful:", receipt.transactionHash);
        limittotal += gas;
        return receipt;
    } catch (error) {
        console.error("Transaction failed:", error);
        if (error.cause && error.cause.message.includes("replacement transaction underpriced")) {
            console.log("Resend Tx...");
            transferFunds(from, to, amount, privateKey,israndom, 1)
        }
        return null;
    }
}

// Generate random addresses and save them
function generateRandomAddress(uniqueKey) {
    const account = web3.eth.accounts.create();
    const newEntry = { seed: account.privateKey, address: account.address };
    saveToConfig("generated_addresses", newEntry,uniqueKey);
    console.log("Generated Address:", account.address);
    return newEntry;
}

export { sendTransactionsLoopToMe,sendTransactionsLoopRandom, getGasPrice, generateRandomAddress, transferFunds,sendTransactionsLoopToAnother };
