Parte 7: Integración Completa

Script de Deploy Automatizado

El archivo restart-all.sh automatiza todo el proceso:

#!/bin/bash

# 1. Detener aplicaciones anteriores
# 2. Iniciar Anvil (blockchain local)
# 3. Deploy EuroToken
# 4. Deploy Ecommerce
# 5. Actualizar variables de entorno
# 6. Iniciar todas las aplicaciones


Variables de Entorno por Aplicación

compra-stableboin


NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...


pasarela-de-pago


NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0x...


web-admin


NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...


web-customer


NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=0x...


Puertos de las Aplicaciones


Anvil: http://localhost:8545

Compra Stablecoin: http://localhost:6001

Pasarela de Pago: http://localhost:6002

Web Admin: http://localhost:6003

Web Customer: http://localhost:6004