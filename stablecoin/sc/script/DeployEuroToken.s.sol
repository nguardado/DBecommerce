// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {EuroToken} from "../src/EuroToken.sol";

contract DeployEuroToken is Script {
    function run() external returns (EuroToken) {
        // Usa una clave privada por defecto de Anvil si no está seteada la variable de entorno
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address deployerAddress = vm.addr(deployerPrivateKey);

        console.log("Desplegando con la cuenta:", deployerAddress);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Desplegamos el token
        EuroToken euroToken = new EuroToken();
        console.log("EuroToken desplegado en:", address(euroToken));
        
        // 2. Hacemos mint inicial de 1,000,000 de tokens (recordar los 6 decimales)
        uint256 initialMint = 1_000_000 * 10**6;
        euroToken.mint(deployerAddress, initialMint);
        console.log("Mint inicial completado de:", initialMint);

        vm.stopBroadcast();

        return euroToken;
    }
}
