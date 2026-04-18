# Reporte de Pruebas: Ecosistema DBecommerce (E2E)

> **Evaluador:** [TU NOMBRE AQUÍ]
> **Fecha:** [FECHA AQUÍ]
> **Descripción:** Bitácora oficial de validación de sistema descentralizado (Smart Contracts + Stablecoin + UI Web3).

---

## 1. Setup e Infraestructura Inicial
El entorno ha sido levantado utilizando la herramienta de automatización `restart-all.sh`.

- [ ] **Anvil Blockchain** corriendo operativamente en `localhost:8545`.
- [ ] **Address de EuroToken (SC):** `0x________________________________________` 
- [ ] **Address de Ecommerce (SC):** `0x________________________________________`

---

## 2. Pruebas de Flujo Óptimo (The Golden Path)

| Caso de Prueba | Instrucciones | Hash de Transacción (MetaMask) | Resultado | ScreenShot |
| :--- | :--- | :--- | :--- | :--- |
| **Fondeo de Stablecoin** | Acceder a `localhost:6001` y usar la TDC de prueba de Stripe para mintear 1,000 EURT. | `0x...` | [ PASA / FALLA ] | [Enlace o captura] |
| **Registro B2B** | Acceder a `localhost:6003`, conectar wallet Creadora y registrar un local ("Mi Tienda"). | `0x...` | [ PASA / FALLA ] | ... |
| **Inyección Catálogo** | En el admin panel, crear Producto A (€10/ 100 stock) y Producto B (€25/ 50 stock). | `0x...` | [ PASA / FALLA ] | ... |
| **Exploración B2C** | Acceder a `localhost:6004` (usar otra account) y ver reflejado los productos cargados. | N/A (Vista Lectura) | [ PASA / FALLA ] | ... |
| **Llenar Carrito On-chain** | Añadir cantidad X del producto A y B. Verificar que requiere firma descentralizada. | `0x...` | [ PASA / FALLA ] | ... |
| **Crear Factura (Invoice)** | Dar a Checkout en `localhost:6004/cart`. Redirigirse exitosamente. | `0x...` | [ PASA / FALLA ] | ... |
| **Liquidación en Pasarela** | Pagar Factura cargada en `localhost:6002`, aprobar gasto de Token y ejecutar `processPayment`. | `0x...` | [ PASA / FALLA ] | ... |
| **Confirmación de Orden** | Volver al Historial de Usuario, validar que aparezca estado "PAGADA" verde. | N/A (Vista Lectura) | [ PASA / FALLA ] | ... |

---

## 3. Pruebas Edge (Gestión de Errores e Integridad)

Demostrar la solidez de los contratos inteligentes probando su sistema de denegación nativa `reverts`.

- [ ] **Error: Pagar sin saldo.**
  - **Acción:** Tratar de pagar una factura desde la pasarela con una cuenta recién creada sin EURT reales.
  - **Resultado Esperado:** Transacción rechazada por carencia del token por el ERC-20 `transferFrom`.
  - **Evidencia:** 

- [ ] **Error: Añadir a carrito con MetaMask bloqueada/desconectada.**
  - **Acción:** Dar click rápido a Add to Cart sin conectar.
  - **Resultado Esperado:** La web no crashea, y en su lugar invoca el modal para solicitar login.
  - **Evidencia:** 

- [ ] **Error: Comprar producto agotado (Underflow).**
  - **Acción:** Poner a 0 el inventario predeterminado o comprar 50 de stock si solo hay 10.
  - **Resultado Esperado:** El SC se revierte previniendo una compra fantasma.
  - **Evidencia:** 

- [ ] **Edge Case: Cancelar desde Gateway Stripe.**
  - **Acción:** Rechazar manualmente la solicitud dentro de MetaMask estando en la pasarela.
  - **Resultado Esperado:** Factura se mantiene bloqueada como 'PENDIENTE' para siempre.
  - **Evidencia:** 

---
*Fin del Reporte Oficial DBecommerce.*
