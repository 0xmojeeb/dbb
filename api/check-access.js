
import { checkTokenGate } from "./logic/tokenGate.js";
export default async function handler(req, res) {
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  
  const { address } = req.query;

  
  try {
    const result = await checkTokenGate(address);
    
    
    return res.status(200).json(result);
  } catch (error) {
    console.error("Token Gate Error:", error);
    return res.status(500).json({ 
      granted: false, 
      message: "Internal server error during check." 
    });
  }
}
