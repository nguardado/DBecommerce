Parte 6: Web Customer (Tienda Online)

Objetivo

Tienda online donde clientes compran productos con EuroTokens.
Ubicación

web-customer/
Funcionalidades

1. Catálogo de Productos


Ver todos los productos disponibles
Filtrar por empresa
Ver precio y stock
Agregar al carrito

2. Carrito de Compras


Ver productos en carrito
Modificar cantidades
Ver total
Proceder al pago

3. Checkout


Crear invoice desde carrito
Redirigir a pasarela de pago
Limpiar carrito después de crear invoice

4. Mis Facturas


Ver historial de compras
Ver estado de pago
Ver detalles de cada factura

Flujo de Compra


1. Usuario navega productos
   ↓
2. Agrega productos al carrito
   ↓
3. Va a /cart y hace checkout
   ↓
4. Se crea Invoice en blockchain
   ↓
5. Carrito se limpia
   ↓
6. Redirige a pasarela de pago
   ↓
7. Usuario paga con tokens
   ↓
8. Regresa a /orders (invoices)
   ↓
9. Ve invoice marcada como "Paid"


Componentes Principales


// Lista de Productos
function ProductsPage() {
  // Cargar productos (sin necesidad de wallet)
  // Botón "Add to Cart" (requiere wallet)
}

// Carrito
function CartPage() {
  // Mostrar items del carrito
  // Calcular total
  // Botón "Checkout" → crear invoice
}

// Mis Facturas
function OrdersPage() {
  // Cargar facturas del cliente
  // Mostrar estado (Paid/Pending)
  // Ver detalles
}


Tareas del Estudiante



Implementar Catálogo

Cargar productos sin wallet (read-only)
Diseño de tarjetas de producto
Paginación o infinite scroll
Sistema de búsqueda/filtros



Implementar Carrito

Hook useCart para gestión de estado
Agregar/quitar/actualizar productos
Persistencia en blockchain
Calcular total



Implementar Checkout

Agrupar items por empresa
Crear invoice llamando al contrato
Esperar confirmación de transacción
Construir URL de pasarela de pago
Limpiar carrito
Redirigir a pasarela



Implementar Historial

Cargar invoices del usuario
Mostrar detalles de cada invoice
Indicador visual de estado (Paid/Pending)
Link a transacción en blockchain



Optimizaciones

Cache de productos
Optimistic updates en carrito
Loading skeletons
Error boundaries