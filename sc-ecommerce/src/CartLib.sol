// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct CartItem {
    uint256 productId;
    uint256 quantity;
}

library CartLib {
    struct State {
        // Carts por billetera de cliente
        mapping(address => CartItem[]) carts;
    }

    function addToCart(State storage self, address _customer, uint256 _productId, uint256 _quantity) internal {
        self.carts[_customer].push(CartItem(_productId, _quantity));
    }

    function getCart(State storage self, address _customer) internal view returns (CartItem[] memory) {
        return self.carts[_customer];
    }

    function clearCart(State storage self, address _customer) internal {
        delete self.carts[_customer];
    }
}
