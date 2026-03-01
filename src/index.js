import chalk from "chalk";
import { checkTokenGate } from "./tokenGate.js";
import { scrapeFreeMints } from "./api/freeMintScraper.js";
import { ALLOWED_WALLETS } from "./api/constants.js";

async function main() {
  
  console.log(
    chalk.bold.magenta(
      "\n╔══════════════════════════════════════════════════════════╗\n" +
      "║          🩸 DEGENBYBLOOD (DBB) PLATFORM 🩸          ║\n" +
      "║          Token Gate + Free Mint Scraper v1.0         ║\n" +
      "╚══════════════════════════════════════════════════════════╝\n"
    )
  );

  
  const walletAddress = process.argv[2] || ALLOWED_WALLETS[0];

  if (!walletAddress) {
    console.log(chalk.red("❌ No wallet address provided and no default available!\n"));
    console.log(chalk.white("Usage:"));
    console.log(chalk.gray("  node src/index.js 0xYourWalletAddress"));
    console.log(chalk.gray("  OR set USER_WALLET_ADDRESSES in your .env file\n"));
    process.exit(1);
  }

  console.log(chalk.bold.cyan("━━━ TASK 1: TOKEN GATE ━━━"));

  const gateResult = await checkTokenGate(walletAddress);

  if (!gateResult.granted) {
    console.log(
      chalk.red("\n🛑 Cannot proceed to Food Item Scraper without access.\n")
    );
    process.exit(1);
  }

  console.log(chalk.bold.cyan("\n━━━ TASK 2: FOOD ITEM SCRAPER ━━━"));

  const blockRange = parseInt(process.argv[3]) || 9;

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
  process.exit(1);
});
