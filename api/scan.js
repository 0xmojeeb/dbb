import { scrapeFreeMints } from "./logic/freeMintScraper.js";
export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("🔄 [API] Starting automated scan...");
    
    const blockRange = process.env.BLOCK_RANGE || 9;
    const results = await scrapeFreeMints(blockRange);
    
    console.log(`✅ [API] Found ${results.length} active NFT items.`);
    
    
    return res.status(200).json({
      message: "Scan completed",
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error("❌ [API] Error during scan:", error);
    return res.status(500).json({ 
      message: "Internal server error during scan.",
      error: error.message 
    });
  }
}
