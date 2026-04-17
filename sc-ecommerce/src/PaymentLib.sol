// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interfaz minimalista de nuestro EuroToken implementado como ERC20 estandar
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

library PaymentLib {
    function processTokenPayment(address _euroTokenAddress, address _customer, address _companyWallet, uint256 _amount) internal returns (bytes32) {
        require(_amount > 0, "PaymentLib: Amount must be > 0");
        IERC20 token = IERC20(_euroTokenAddress);
        
        // Ejecución segura exigiendo que el Frontend de Ecommerce haya hecho "approve"
        bool success = token.transferFrom(_customer, _companyWallet, _amount);
        require(success, "PaymentLib: Token transfer failed (Insufficient allowance or balance)");

        // Hash unico para este pago a nivel local 
        return keccak256(abi.encodePacked(_customer, _companyWallet, _amount, block.timestamp));
    }
}
