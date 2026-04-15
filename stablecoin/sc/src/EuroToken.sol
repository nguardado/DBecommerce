// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

/// @title EuroToken
/// @notice Token ERC20 con funcionalidad de mint, que representa euros digitales (1 EURT = 1 EUR).
contract EuroToken is ERC20, Ownable {
    
    /// @notice Se emite cuando el owner mintea nuevos tokens
    event TokensMinted(address indexed to, uint256 amount);

    /// @dev Configura el nombre del token y el símbolo, y asigna el deployer como owner
    constructor() ERC20("EuroToken", "EURT") Ownable(msg.sender) {}

    /// @notice Función para crear nuevos tokens
    /// @dev Solo puede ser ejecutada por el owner del contrato (Ownable)
    /// @param to Dirección que recibirá los tokens
    /// @param amount Cantidad de tokens a mintear
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    /// @notice Sobrescribe la función decimals para usar 6 decimales
    /// @dev Esto permite representar centavos de euro y ahorra gas relativo a 18 decimales
    /// @return uint8 Retorna el número de decimales (6)
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
