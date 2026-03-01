import chalk from "chalk";
import { checkTokenGate } from "./tokenGate.js";
import { scrapeFreeMints } from "./api/freeMintScraper.js";
import { ALLOWED_WALLETS } from "./api/constants.js";

async function main() {
 
  console.log(
    chalk.bold.magenta(
      "\n╔══════════════════════════════════════════════════════════╗\n" +
      "║            🩸 DEGENBYBLOOD (DBB) PLATFORM 🩸            ║\n" +
      "║            Token Gate + Free Mint Scraper v1.0         ║\n" +
      "╚══════════════════════════════════════════════════════════╝\n"
    )
  );

  
  const walletAddress = ALLOWED_WALLETS[0];

  if (!walletAddress) {
    console.log(chalk.red("❌ No default wallet address available!\n"));
    return; 
  }

  console.log(chalk.bold.cyan("━━━ TASK 1: TOKEN GATE ━━━"));

  const gateResult = await checkTokenGate(walletAddress);

  if (!gateResult.granted) {
    console.log(
      chalk.red("\n🛑 Cannot proceed to Food Item Scraper without access.\n")
    );
    return; 
  }

  console.log(chalk.bold.cyan("\n━━━ TASK 2: FOOD ITEM SCRAPER ━━━"));

  
  const blockRange = 9;

  console.log(
    chalk.green(
      `\n🎫 Access verified! Starting free mint scan (${blockRange} blocks)...\n`
    )
  );

  const freeMints = await scrapeFreeMints(blockRange);

  
  
  console.log(chalk.bold.magenta("\n" + "═".repeat(60)));
  console.log(chalk.bold.magenta("   📊 SESSION SUMMARY"));
  console.log(chalk.bold.magenta("═".repeat(60)));
  console.log(chalk.white(`   Wallet:           ${walletAddress}`));
  console.log(chalk.white(`   DBB NFTs Held:    ${gateResult.totalBalance}`));
  console.log(chalk.white(`   Access:           ${gateResult.granted ? "✅ Granted" : "❌ Denied"}`));
  console.log(chalk.white(`   Free Mints Found: ${freeMints.length}`));
  console.log(chalk.white(`   Blocks Scanned:   ${blockRange} per network`));
  console.log(chalk.bold.magenta("═".repeat(60) + "\n"));
}


main().catch((error) => {
  console.error(chalk.red(`\n💀 Fatal error: ${error.message}\n`));
  console.error(chalk.gray(error.stack));
});
