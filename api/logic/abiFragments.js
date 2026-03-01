export const ERC721_BALANCE_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
];


export const COMMON_MINT_ABIS = [
  
  "function mint() payable",
  "function mint(uint256 quantity) payable",
  "function mint(address to) payable",
  "function mint(address to, uint256 quantity) payable",
  "function publicMint() payable",
  "function publicMint(uint256 quantity) payable",
  "function freeMint() payable",
  "function freeMint(uint256 quantity) payable",
  "function claim() payable",
  "function claim(uint256 quantity) payable",
  "function safeMint(address to) payable",
];


export const MINT_SELECTORS = {
  "0x1249c58b": "mint()",
  "0xa0712d68": "mint(uint256)",
  "0x6a627842": "mint(address)",
  "0x40c10f19": "mint(address,uint256)",
  "0x26092b83": "publicMint()",
  "0xb9e5e203": "publicMint(uint256)",
  "0x5b70ea9f": "freeMint()",
  "0x2db11544": "freeMint(uint256)",
  "0x4e71d92d": "claim()",
  "0xaad3ec96": "claim(uint256)",
  "0x40d097c3": "safeMint(address)",
};


export const EXCLUSION_SELECTORS = {
  "0x7cb64759": "setMerkleRoot(bytes32)",           
  "0x2eb4a7ab": "merkleRoot()",                      
  "0xb429afeb": "isWhitelisted(address)",            
  "0x9b19251a": "whitelist(address)",                
  "0xe985e9c5": "isApprovedForAll(address,address)", 
};


export const INSPECTION_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function mintPrice() view returns (uint256)",
  "function price() view returns (uint256)",
  "function cost() view returns (uint256)",
  "function PRICE() view returns (uint256)",
  "function saleIsActive() view returns (bool)",
  "function isPublicSaleActive() view returns (bool)",
  "function publicSaleActive() view returns (bool)",
  "function paused() view returns (bool)",
  "function merkleRoot() view returns (bytes32)",
];