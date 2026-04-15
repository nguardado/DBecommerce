# Reglas del Proyecto (E-Commerce con Blockchain y Stablecoins)

Este proyecto utilizará las siguientes tecnologías y herramientas. Todo el código desarrollado debe apegarse a estas tecnologías.

## Stack Principal

1. **Smart Contracts**: Solidity, utilizando Foundry/Forge para compilación y testing. 
2. **Blockchain Local**: Anvil.
3. **Interacción Web3**: Ethers.js v6. Es crucial NO utilizar versiones anteriores u otras librerías sin previo aviso.
4. **Desarrollo Web**: Next.js 15 (App Router).
5. **Lenguaje**: TypeScript obligatorio para todo el frontend.
6. **Estilos**: Tailwind CSS.
7. **Pagos**: Stripe (Fiat) y Tokens ERC20 (Crypto).
8. **Wallet**: MetaMask.

## Estructura del Proyecto

El código estará organizado de la siguiente manera:
```
30_eth_database_ecommerce/
├── stablecoin/
│   ├── sc/                          # Smart Contract EuroToken
│   ├── compra-stableboin/           # App para comprar tokens con Stripe
│   └── pasarela-de-pago/            # Pasarela de pagos con tokens
├── sc-ecommerce/                    # Smart Contract E-commerce
├── web-admin/                       # Panel de administración
├── web-customer/                    # Tienda online para clientes
└── restart-all.sh                   # Script de deploy completo
```

> **Nota**: Cualquier cambio en la arquitectura debe ser reflejado en este documento.

## ⚠️ Errores Comunes a Evitar
- ❌ Hardcodear claves privadas o URLs de RPC/Relayers en código público o commits.
- ❌ Subir carpetas como `lib/`, `cache/`, `out/`, o `node_modules/` a git (asegurar un buen `.gitignore`).
- ❌ No validar información en todos los niveles (Frontend, Relayer si aplica, y Smart Contract).
- ❌ Ignorar posible manejo de errores o fallos en la ejecución delegada de la meta-transacción (verificar que los reverts pasen correctamente al usuario).
- ❌ No probar casos límite (edge cases) y escenarios de delegación de votos en los tests.
- ❌ Crear una UI no responsiva (debe ser adaptable a móviles y PC).
- ❌ Hacer commits sin mensaje descriptivo.
- ❌ Dejar código no comentado; usar especialmente NatSpec para las funciones clave del Smart Contract.