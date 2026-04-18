export const ECOMMERCE_ABI = [
  "function registerCompany(string name, string taxId) external returns (uint256)",
  "function getCompany(uint256 companyId) external view returns (tuple(uint256 companyId, string name, address companyAddress, string taxId, bool isActive))",
  "function getAllCompanies() external view returns (tuple(uint256 companyId, string name, address companyAddress, string taxId, bool isActive)[])",
  
  "function addProduct(uint256 companyId, string name, string description, uint256 price, uint256 stock, string ipfsImageHash) external returns (uint256)",
  "function updateProduct(uint256 productId, uint256 newPrice, uint256 newStock) external",
  "function getAllProducts() external view returns (tuple(uint256 productId, uint256 companyId, string name, string description, uint256 price, uint256 stock, string ipfsImageHash, bool isActive)[])",

  "function getInvoice(uint256 invoiceId) external view returns (tuple(uint256 invoiceId, uint256 companyId, address customerAddress, uint256 totalAmount, uint256 timestamp, bool isPaid, bytes32 paymentTxHash))"
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS || "";
