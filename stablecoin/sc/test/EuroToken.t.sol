// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {EuroToken} from "../src/EuroToken.sol";

contract EuroTokenTest is Test {
    EuroToken public euroToken;
    address public owner = address(this);
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    // Redefiniendo el evento para vm.expectEmit
    event TokensMinted(address indexed to, uint256 amount);

    function setUp() public {
        euroToken = new EuroToken();
    }

    /// @notice Testeamos el despliegue correcto y estado inicial
    function test_DeployAndInitialState() public {
        assertEq(euroToken.name(), "EuroToken");
        assertEq(euroToken.symbol(), "EURT");
        assertEq(euroToken.decimals(), 6);
        assertEq(euroToken.owner(), owner);
    }

    /// @notice Testeamos la función mint ejecutada por el owner
    function test_MintByOwner() public {
        uint256 mintAmount = 1000 * 10**6; // 1,000 unidades con 6 decimales
        
        // Esperamos que se emita el evento especifico
        vm.expectEmit(true, false, false, true);
        emit TokensMinted(user1, mintAmount);
        
        euroToken.mint(user1, mintAmount);
        
        assertEq(euroToken.balanceOf(user1), mintAmount);
        assertEq(euroToken.totalSupply(), mintAmount);
    }

    /// @notice Testeamos que falle el mint ejecutado por un no-owner
    function test_RevertMintByNonOwner() public {
        uint256 mintAmount = 1000 * 10**6;
        
        vm.prank(user1);
        vm.expectRevert(); // Captura cualquier revert (ej. Custom Error de Ownable en OZ ^5.0)
        euroToken.mint(user1, mintAmount);
    }

    /// @notice Testeamos una transferencia básica entre dos cuentas
    function test_TransferBetweenAccounts() public {
        uint256 mintAmount = 1000 * 10**6;
        euroToken.mint(user1, mintAmount);

        uint256 transferAmount = 250 * 10**6;
        
        vm.prank(user1);
        euroToken.transfer(user2, transferAmount);

        assertEq(euroToken.balanceOf(user1), mintAmount - transferAmount);
        assertEq(euroToken.balanceOf(user2), transferAmount);
    }
}
