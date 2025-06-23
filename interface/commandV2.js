import { config } from 'dotenv';
import waves from '@waves/waves-transactions';

config(); // Load .env

const NODE_URL = 'https://nodes.gscscan.com';
const CHAIN_ID = 'G'; // Custom chain ID
function getRandomNumber(number) {
    return Math.floor(Math.random() * number) + 1;
}

export async function startV2() {
  const seed = process.env.SEED_V2;
  const recipient = process.env.RECIPIENT_V2;
  const fee = Number(process.env.FEE_V2 || 100000);
  const txPerMin = Number(process.env.TX_PER_MIN_V2 || 60);

  if (!seed || !recipient) {
    console.error('SEED_V2 or RECIPIENT_V2 not found in .env');
    return;
  }

  const intervalMs = Math.floor(60000 / txPerMin); // intervalo entre transações

  console.log(`Starting transaction loop: ${txPerMin} tx/min (${intervalMs}ms interval)`);

  const loop = async () => {
    const amount = getRandomNumber(process.env.AMOUNT_V2 ? Number(process.env.AMOUNT_V2) : 100000000); // 1 GIC default
    const tx = waves.transfer(
      {
        amount, // 1 GIC
        recipient,
        chainId: CHAIN_ID,
        fee,
      },
      seed
    );

    try {
      const result = await waves.broadcast(tx, NODE_URL);
      console.log(`✅ TX sent with ${amount} GIC! ID: ${result.id}`);
    } catch (error) {
      console.error('❌ TX failed:', error.message);
    }
  };

  // Disparar transações com intervalo fixo
  setInterval(loop, intervalMs);
}

export default startV2;
