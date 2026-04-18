// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CompanyLib.sol";
import "./ProductLib.sol";
import "./CustomerLib.sol";
import "./CartLib.sol";
import "./InvoiceLib.sol";
import "./PaymentLib.sol";

/// @title Contrato Principal de E-Commerce
/// @notice Integra todo el ecosistema de compras y manejo de fondos
contract Ecommerce {
    // Almacenamiento modular para cada libreria
    CompanyLib.State private companyState;
    ProductLib.State private productState;
    CustomerLib.State private customerState;
    CartLib.State private cartState;
    InvoiceLib.State private invoiceState;

    address public euroTokenAddress;
    address public owner;

    // --- EVENTOS DE AUDITORIA ---
    event CompanyRegistered(uint256 companyId, string name);
    event ProductAdded(uint256 productId, string name);
    event InvoiceCreated(uint256 invoiceId, address customer, uint256 totalAmount);
    event PaymentProcessed(uint256 invoiceId, address customer, uint256 amount);

    constructor(address _euroTokenAddress) {
        euroTokenAddress = _euroTokenAddress;
        owner = msg.sender;
    }

    // ==========================================
    // SECCION: COMPAÑIAS
    // ==========================================
    function registerCompany(string memory _name, string memory _taxId) external returns (uint256) {
        // En una app real de gobierno, se podria limitar que solo 'owner' registre companias
        uint256 id = CompanyLib.registerCompany(companyState, _name, msg.sender, _taxId);
        emit CompanyRegistered(id, _name);
        return id;
    }

    function getCompany(uint256 _companyId) external view returns (Company memory) {
        return CompanyLib.getCompany(companyState, _companyId);
    }
    
    function getAllCompanies() external view returns (Company[] memory) {
        return CompanyLib.getAllCompanies(companyState);
    }

    // ==========================================
    // SECCION: PRODUCTOS
    // ==========================================
    function addProduct(uint256 _companyId, string memory _name, string memory _description, uint256 _price, uint256 _stock, string memory _ipfsImageHash) external returns (uint256) {
        // Control de Acceso: Validar que el creador efectivamente sea el dueño de la compañia
        require(CompanyLib.getCompany(companyState, _companyId).companyAddress == msg.sender, "No eres el dueno de esta compania");
        
        uint256 id = ProductLib.addProduct(productState, _companyId, _name, _description, _price, _stock, _ipfsImageHash);
        emit ProductAdded(id, _name);
        return id;
    }

    function updateProduct(uint256 _productId, uint256 _newPrice, uint256 _newStock) external {
        // Control de Acceso para updates
        uint256 companyId = ProductLib.getProduct(productState, _productId).companyId;
        require(CompanyLib.getCompany(companyState, companyId).companyAddress == msg.sender, "Acceso denegado");
        
        ProductLib.updateProduct(productState, _productId, _newPrice, _newStock);
    }

    function getAllProducts() external view returns (Product[] memory) {
        return ProductLib.getAllProducts(productState);
    }

    // ==========================================
    // SECCION: CARRITO Y CUSTOMERS
    // ==========================================
    function addToCart(uint256 _productId, uint256 _quantity) external {
        CustomerLib.register(customerState, msg.sender);
        CartLib.addToCart(cartState, msg.sender, _productId, _quantity);
    }

    function getCart(address _customer) external view returns (CartItem[] memory) {
        return CartLib.getCart(cartState, _customer);
    }

    function clearCart(address _customer) external {
        CartLib.clearCart(cartState, _customer);
    }

    // ==========================================
    // SECCION: INVOICES (FACTURACION)
    // ==========================================
    function createInvoice(uint256 _companyId) external returns (uint256) {
        CartItem[] memory cart = CartLib.getCart(cartState, msg.sender);
        require(cart.length > 0, "Carrito vacio");

        uint256 totalAmount = 0;
        for (uint i = 0; i < cart.length; i++) {
            Product memory p = ProductLib.getProduct(productState, cart[i].productId);
            // Limitacion estructural: Facturas solo soportan productos de 1 empresa a la vez. (Marketplace multicarrito deberı́a crear 1 factura por compañia)
            require(p.companyId == _companyId, "Solo se permiten productos de una compania por factura");
            
            totalAmount += (p.price * cart[i].quantity);
            // Afectamos el stock de la tienda al cotizar -> "Apartado"
            ProductLib.reduceStock(productState, p.productId, cart[i].quantity);
        }

        uint256 invId = InvoiceLib.createInvoice(invoiceState, _companyId, msg.sender, totalAmount);
        emit InvoiceCreated(invId, msg.sender, totalAmount);
        
        // Vaciamos el carrito
        CartLib.clearCart(cartState, msg.sender);
        return invId;
    }

    function getInvoice(uint256 _invoiceId) external view returns (Invoice memory) {
        return InvoiceLib.getInvoice(invoiceState, _invoiceId);
    }

    function getInvoicesByCustomer(address _customer) external view returns (Invoice[] memory) {
        return InvoiceLib.getInvoicesByCustomer(invoiceState, _customer);
    }

    // ==========================================
    // SECCION: PAGOS ONCHAIN (PAYMENT LIBRARY)
    // ==========================================
    function processPayment(address _customer, uint256 _amount, uint256 _invoiceId) external {
        // En un entorno de pasarela P2P, el _customer es el msg.sender, sino solo fallaria el transferFrom
        require(_customer == msg.sender, "Invocacion invalida. Caller =! Customer");

        Invoice memory inv = InvoiceLib.getInvoice(invoiceState, _invoiceId);
        require(inv.customerAddress == _customer, "No eres el dueno de esta factura");
        require(inv.totalAmount == _amount, "El monto enviado no coincide con el total de la factura");

        Company memory comp = CompanyLib.getCompany(companyState, inv.companyId);

        // Disparamos la ejecucion contra el token, el SC debe tener "Allowance" desde el Wallet del cliente (aprobado en pasarela frontend UI)
        bytes32 paymentTxId = PaymentLib.processTokenPayment(euroTokenAddress, _customer, comp.companyAddress, _amount);

        // Cambiamos estado de la factura local a PAID
        InvoiceLib.markPaid(invoiceState, _invoiceId, paymentTxId);

        emit PaymentProcessed(_invoiceId, _customer, _amount);
    }
}
