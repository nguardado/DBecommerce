// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Ecommerce} from "../src/Ecommerce.sol";

contract DeployEcommerce is Script {
    function run() external {
        // En Anvil, el deployer base default suele ser la cuenta 0 (Anvil private key 0)
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // El constructor the Ecommerce recibe the address of the EuroToken!
        address euroTokenAddress = vm.envAddress("EUROTOKEN_ADDRESS");
        require(euroTokenAddress != address(0), "No EuroToken address config");

        vm.startBroadcast(deployerPrivateKey);

        // Desplegar el Contrato Central!
        Ecommerce ecommerce = new Ecommerce(euroTokenAddress);

        console.log("Ecommerce desplegado satisfactoriamente en:", address(ecommerce));

        vm.stopBroadcast();
    }
}
