import { checkTokenGate } from "./api/tokenGate.js";
import { scrapeFreeMints } from "./api/freeMintScraper.js";
import { ALLOWED_WALLETS } from "./api/constants.js";

async function runPlatformLogic() {
  const walletAddress = ALLOWED_WALLETS[0];

  if (!walletAddress) {
    console.error("❌ No default wallet address available!");
    return; 
  }

  console.log("━━━ TASK 1: TOKEN GATE ━━━");
  const gateResult = await checkTokenGate(walletAddress);

  if (!gateResult.granted) {
    console.log("🛑 Cannot proceed to DBB Scraper without access.");
    return; 
  }

  console.log("━━━ TASK 2: MINT SCRAPER ━━━");
  const blockRange = 9;

  console.log(`🎫 Access verified! Starting free mint scan (${blockRange} blocks)...`);
  const freeMints = await scrapeFreeMints(blockRange);

  console.log("📊 SESSION SUMMARY");
  console.log(`Wallet: ${walletAddress}`);
  console.log(`DBB NFTs Held: ${gateResult.totalBalance}`);
  console.log(`Access: ${gateResult.granted ? "Granted" : "Denied"}`);
  console.log(`Free Mints Found: ${freeMints.length}`);
  console.log(`Blocks Scanned: ${blockRange} per network`);
}

// runPlatformLogic().catch(console.error);