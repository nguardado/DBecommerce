Parte 8: Testing del Sistema Completo

Escenario de Prueba Completo



Setup Inicial

# Iniciar todo el sistema
./restart-all.sh

# Obtener addresses de los contratos desplegados
# (se muestran al final del script)




Comprar Tokens

Ir a http://localhost:6001

Conectar MetaMask
Comprar 1000 EURT con tarjeta de prueba
Verificar balance en MetaMask



Registrar Empresa (Admin)

Ir a http://localhost:6003

Conectar con cuenta de empresa
Registrar empresa "Mi Tienda"
Agregar productos:

Producto A: €10, Stock: 100
Producto B: €25, Stock: 50





Comprar Productos (Customer)

Ir a http://localhost:6004

Ver catálogo de productos
Conectar wallet de cliente
Agregar Producto A (qty: 2) al carrito
Agregar Producto B (qty: 1) al carrito
Ir a carrito
Hacer checkout → crea invoice
Redirige a pasarela de pago



Pagar en Pasarela

Ver detalles del pago (€45)
Conectar MetaMask (cuenta cliente)
Verificar saldo suficiente
Confirmar pago
Aprobar gasto de tokens
Confirmar transacción processPayment
Ver confirmación de pago exitoso



Verificar Invoice

Redirige a http://localhost:6004/orders

Ver invoice marcada como "Paid"
Ver detalles de la compra



Verificar Empresa (Admin)

Volver a http://localhost:6003

Ver invoice en panel de empresa
Verificar balance de tokens recibidos
Ver stock actualizado:

Producto A: 98
Producto B: 49





Tareas del Estudiante



Documentar Pruebas

Crear documento con capturas de pantalla
Documentar cada paso del flujo
Anotar hashes de transacciones
Verificar estados en blockchain



Testing de Errores

Intentar pagar sin saldo
Intentar agregar producto sin wallet
Intentar modificar producto de otra empresa
Producto sin stock



Testing de Edge Cases

Múltiples productos de diferentes empresas
Cancelar pago en pasarela
Cambiar de cuenta en MetaMask
Recarga de página durante proceso