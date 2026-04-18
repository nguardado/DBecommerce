export const ECOMMERCE_ABI = [
  "function registerCompany(string name, string taxId) external returns (uint256)",
  "function getCompany(uint256 companyId) external view returns (tuple(uint256 companyId, string name, address companyAddress, string taxId, bool isActive))",
  "function getAllCompanies() external view returns (tuple(uint256 companyId, string name, address companyAddress, string taxId, bool isActive)[])",
  
  "function addProduct(uint256 companyId, string name, string description, uint256 price, uint256 stock, string ipfsImageHash) external returns (uint256)",
  "function updateProduct(uint256 productId, uint256 newPrice, uint256 newStock) external",
  "function getAllProducts() external view returns (tuple(uint256 productId, uint256 companyId, string name, string description, uint256 price, uint256 stock, string ipfsImageHash, bool isActive)[])",

  "function getInvoice(uint256 invoiceId) external view returns (tuple(uint256 invoiceId, uint256 companyId, address customerAddress, uint256 totalAmount, uint256 timestamp, bool isPaid, bytes32 paymentTxHash))",
  "function getInvoicesByCustomer(address _customer) external view returns (tuple(uint256 invoiceId, uint256 companyId, address customerAddress, uint256 totalAmount, uint256 timestamp, bool isPaid, bytes32 paymentTxHash)[])",
  
  "function addToCart(uint256 companyId, uint256 productId, uint256 quantity) external",
  "function removeCartItem(uint256 companyId, uint256 productId) external",
  "function clearCart(uint256 companyId) external",
  "function getCart(uint256 companyId, address customer) external view returns (tuple(uint256 companyId, address customerAddress, tuple(uint256 productId, uint256 quantity)[] items))",
  
  "function createInvoice(uint256 companyId) external returns (uint256)"
];

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS || "";
