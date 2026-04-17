// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Product {
    uint256 productId;
    uint256 companyId;
    string name;
    string description;
    uint256 price;           // En centavos de euro (6 decimals igual que EURT)
    uint256 stock;
    string ipfsImageHash;
    bool isActive;
}

library ProductLib {
    struct State {
        mapping(uint256 => Product) products;
        uint256 nextProductId;
    }

    function addProduct(State storage self, uint256 _companyId, string memory _name, string memory _desc, uint256 _price, uint256 _stock, string memory _ipfs) internal returns (uint256) {
        uint256 id = self.nextProductId++;
        self.products[id] = Product(id, _companyId, _name, _desc, _price, _stock, _ipfs, true);
        return id;
    }

    function updateProduct(State storage self, uint256 _productId, uint256 _newPrice, uint256 _newStock) internal {
        require(self.products[_productId].isActive, "ProductLib: Product inactive");
        self.products[_productId].price = _newPrice;
        self.products[_productId].stock = _newStock;
    }

    function reduceStock(State storage self, uint256 _productId, uint256 _quantity) internal {
        require(self.products[_productId].stock >= _quantity, "ProductLib: Insufficient stock");
        self.products[_productId].stock -= _quantity;
    }

    function getProduct(State storage self, uint256 _productId) internal view returns (Product memory) {
        return self.products[_productId];
    }

    function getAllProducts(State storage self) internal view returns (Product[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < self.nextProductId; i++) {
            if (self.products[i].isActive) activeCount++;
        }
        
        Product[] memory activeProducts = new Product[](activeCount);
        uint256 idx = 0;
        
        for (uint256 i = 0; i < self.nextProductId; i++) {
            if (self.products[i].isActive) {
                activeProducts[idx] = self.products[i];
                idx++;
            }
        }
        return activeProducts;
    }
}
