
import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { scrapeFreeMints } from './freeMintScraper.js';

const app = express();
const PORT = 3001;


app.use(cors()); 
app.use(express.json());


let latestResults = [];
let isScanning = false;


async function runScraper() {
    if (isScanning) return;
    isScanning = true;

    try {
        console.log(chalk.blue("\n🔄 [Server] Running automated scan..."));
        
       
        latestResults = await scrapeFreeMints(9);
        
        console.log(chalk.green(`✅ [Server] Updated with ${latestResults.length} active NFT items.`));
    } catch (error) {
        console.error(chalk.red("❌ [Server] Error during scan:", error));
    } finally {
        isScanning = false;
    }
}




app.get('/api/free-mints', (req, res) => {
    res.json(latestResults);
});


app.post('/api/scan', async (req, res) => {
    await runScraper();
    res.json({ message: "Scan completed", count: latestResults.length });
});


app.listen(PORT, () => {
    console.log(chalk.bold.green(`🚀 Backend API running on http://localhost:${PORT}`));
    
    
    runScraper();
    
   
    setInterval(runScraper, 60000);
});