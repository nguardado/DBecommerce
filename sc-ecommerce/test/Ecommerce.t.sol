// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Ecommerce} from "../src/Ecommerce.sol";
import {Company} from "../src/CompanyLib.sol";
import {Product} from "../src/ProductLib.sol";
import {CartItem} from "../src/CartLib.sol";
import {Invoice} from "../src/InvoiceLib.sol";

// Mock falso integrado para emular a EuroToken sin instalar modulos pesados de librerias ERC20
contract MockEuroToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    // Funciones vitales de interface IERC20
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        require(balanceOf[sender] >= amount, "MockEuro: Insufficient balance");
        require(allowance[sender][msg.sender] >= amount, "MockEuro: Insufficient allowance");
        
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        allowance[sender][msg.sender] -= amount;
        return true;
    }
}

contract EcommerceTest is Test {
    Ecommerce public ecommerce;
    MockEuroToken public token;

    address public admin = address(this);
    address public merchant = address(0x111);
    address public customer = address(0x222);

    function setUp() public {
        // Deploy de dependencias simuladas
        token = new MockEuroToken();
        ecommerce = new Ecommerce(address(token));

        // Regalamos saldo al cliente mockeado para pruebas
        token.mint(customer, 1000 * 10**6); // 1000.00 EURT
    }

    function test_RegisterCompany() public {
        vm.prank(merchant);
        uint256 companyId = ecommerce.registerCompany("Tech Store DApp", "TX-DAPP-123");
        
        Company memory comp = ecommerce.getCompany(companyId);
        assertEq(comp.name, "Tech Store DApp");
        assertEq(comp.companyAddress, merchant);
        assertTrue(comp.isActive);
    }

    function test_AddProductAndStock() public {
        // Setup empresa
        vm.prank(merchant);
        uint256 cId = ecommerce.registerCompany("Tech Store DApp", "TX-123");

        // Añadir producto
        vm.prank(merchant);
        ecommerce.addProduct(cId, "Laptop Web3", "Mejor laptop descentralizada", 1500 * 10**6, 10, "ipfs://QmbHash");

        // Comprobacion de cache
        Product[] memory allProducts = ecommerce.getAllProducts();
        assertEq(allProducts.length, 1);
        assertEq(allProducts[0].name, "Laptop Web3");
        assertEq(allProducts[0].stock, 10);
    }

    function test_FullEcommerceFlow() public {
        // --- 1. COMERCIANTE AGREGA MERCANCIA ---
        vm.startPrank(merchant);
        uint256 cId = ecommerce.registerCompany("Tech Store DApp", "TX-123");
        uint256 pId = ecommerce.addProduct(cId, "Laptop Web3", "Una bomba", 800 * 10**6, 5, "ipfs://hash");
        vm.stopPrank();

        // --- 2. CLIENTE AGREGA AL CARRITO ---
        vm.prank(customer);
        ecommerce.addToCart(pId, 1);

        CartItem[] memory cart = ecommerce.getCart(customer);
        assertEq(cart.length, 1);
        assertEq(cart[0].productId, pId);
        assertEq(cart[0].quantity, 1);

        // --- 3. CLIENTE PIDE FACTURACION (CREAR INVOICE) ---
        vm.prank(customer);
        uint256 invId = ecommerce.createInvoice(cId);

        Invoice memory inv = ecommerce.getInvoice(invId);
        assertEq(inv.customerAddress, customer);
        assertEq(inv.totalAmount, 800 * 10**6); // 1 laptop * 800 EURT
        assertFalse(inv.isPaid); // Aun no pagada

        // Verificamos que el stock fue apartado (+1 Venta)
        Product[] memory currentProds = ecommerce.getAllProducts();
        assertEq(currentProds[0].stock, 4);

        // Verificamos que el carrito se reseteo
        CartItem[] memory emptyCart = ecommerce.getCart(customer);
        assertEq(emptyCart.length, 0);

        // --- 4. CLIENTE PAGA SU INVOICE DESDE METAMASK (simulado) ---
        vm.startPrank(customer);
        // Primero la app le pide a EuroToken permiso para que ECommerce gaste
        token.approve(address(ecommerce), 800 * 10**6);
        // Luego la app le dice a Ecommerce que intente cobrar
        ecommerce.processPayment(customer, 800 * 10**6, invId);
        vm.stopPrank();

        // --- 5. COMPROBACIONES FINALES ---
        Invoice memory paidInv = ecommerce.getInvoice(invId);
        assertTrue(paidInv.isPaid);

        // Vemos si los balances son perfectos
        assertEq(token.balanceOf(customer), 200 * 10**6); // tenia 1000 - 800 EURT = 200 EURT sobrantes
        assertEq(token.balanceOf(merchant), 800 * 10**6); // el merchant gano 800 limpios
    }

    function test_RevertWhen_AddingProductToOtherCompany() public {
        vm.prank(merchant);
        uint256 cId = ecommerce.registerCompany("Tech Store DApp", "TX-123");

        // Hacker intenta agregar producto fantasma a otra store
        vm.prank(customer);
        vm.expectRevert("No eres el dueno de esta compania");
        ecommerce.addProduct(cId, "Hacked Item", "Malisimo", 1, 1000, "hash");
    }
}
