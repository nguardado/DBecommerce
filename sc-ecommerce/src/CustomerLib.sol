// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct Customer {
    address wallet;
    bool isRegistered;
}

library CustomerLib {
    struct State {
        mapping(address => Customer) customers;
    }

    function register(State storage self, address _wallet) internal {
        if (!self.customers[_wallet].isRegistered) {
            self.customers[_wallet] = Customer(_wallet, true);
        }
    }
}
