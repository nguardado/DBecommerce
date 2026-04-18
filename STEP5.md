Parte 5: Web Admin (Panel de Administración)

Objetivo

Panel para que empresas gestionen productos, vean facturas y clientes.
Ubicación

web-admin/
Funcionalidades

1. Gestión de Empresas


Registrar nueva empresa
Ver lista de empresas
Editar información de empresa

2. Gestión de Productos


Agregar producto (nombre, precio, stock, imagen)
Editar producto
Activar/desactivar producto
Ver stock disponible

3. Gestión de Facturas


Ver todas las facturas de la empresa
Filtrar por estado (pagada/pendiente)
Ver detalles de cada factura
Ver transacción en blockchain

4. Clientes


Ver lista de clientes
Historial de compras por cliente

Componentes Principales


// Conexión de Wallet
function WalletConnect() {
  // Conectar MetaMask
  // Mostrar dirección y balance
}

// Registro de Empresa
function CompanyRegistration() {
  // Formulario para registrar empresa
  // Solo si wallet conectada no tiene empresa
}

// Lista de Productos
function ProductList({ companyId }) {
  // Cargar productos del contrato
  // Botones para editar/eliminar
}

// Formulario de Producto
function ProductForm({ companyId, productId? }) {
  // Agregar o editar producto
  // Upload de imagen a IPFS
}


Tareas del Estudiante



Setup del Proyecto

Configurar Next.js con TypeScript
Instalar Ethers.js y dependencias
Configurar Tailwind CSS
Setup de variables de entorno



Implementar Hooks


useWallet: Gestión de conexión MetaMask

useContract: Instanciar contratos

useCompany: Datos de empresa

useProducts: Lista de productos



Implementar Páginas


/: Dashboard principal

/companies: Lista y registro de empresas

/company/[id]: Detalle de empresa con tabs

/company/[id]/products: Gestión de productos

/company/[id]/invoices: Lista de facturas



Validaciones

Solo owner de empresa puede editar
Validar que wallet esté conectada
Validar red correcta (localhost/31337)
Manejo de errores de transacciones



UX/UI

Dark mode support
Responsive design
Loading states
Mensajes de éxito/error
Confirmaciones antes de transacciones