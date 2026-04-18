#!/bin/bash

echo "🚀 Iniciando Secuencia de Despliegue Automatizado DBecommerce..."

# 1. Detener aplicaciones anteriores
echo "🛑 Deteniendo procesos Anvil y Node.js previos para evitar colisiones de puerto..."
# Utilizamos Taskkill en windows para tumbar forzosamente cualquier residuo
taskkill //F //IM node.exe //T 2>/dev/null
taskkill //F //IM anvil.exe //T 2>/dev/null
sleep 2

# 2. Iniciar Anvil (blockchain local)
echo "⛓️  Iniciando Anvil en background..."
anvil > anvil_logs.txt 2>&1 &
sleep 4 # Darle tiempo a Anvil para encender el localhost:8545

echo "✅ Anvil iniciado en http://localhost:8545"

# 3. Deploy EuroToken
echo "🪙  Desplegando EuroToken..."
cd stablecoin/sc
EURO_OUT=$(forge create --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/EuroToken.sol:EuroToken)
EURO_ADDRESS=$(echo "$EURO_OUT" | grep "Deployed to" | awk '{print $3}')
echo "✅ EuroToken desplegado en: $EURO_ADDRESS"
cd ../..

# 4. Deploy Ecommerce
echo "🛒 Desplegando Contrato Inteligente Ecommerce..."
cd sc-ecommerce
ECO_OUT=$(forge create --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --constructor-args $EURO_ADDRESS src/Ecommerce.sol:Ecommerce)
ECO_ADDRESS=$(echo "$ECO_OUT" | grep "Deployed to" | awk '{print $3}')
echo "✅ Ecommerce base desplegado en: $ECO_ADDRESS"
cd ..

# 5. Actualizar variables de entorno
echo "📝 Sobrescribiendo archivos .env.local general..."

cat <<EOF > stablecoin/compra-stableboin/.env.local
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EURO_ADDRESS
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_TU_SECRET_KEY
EOF

cat <<EOF > stablecoin/pasarela-de-pago/.env.local
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EURO_ADDRESS
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=$ECO_ADDRESS
EOF

cat <<EOF > web-admin/.env.local
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EURO_ADDRESS
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=$ECO_ADDRESS
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
EOF

cat <<EOF > web-customer/.env.local
NEXT_PUBLIC_EUROTOKEN_CONTRACT_ADDRESS=$EURO_ADDRESS
NEXT_PUBLIC_ECOMMERCE_CONTRACT_ADDRESS=$ECO_ADDRESS
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
EOF

echo "✅ Entornos enlazados con las nuevas Smart Contract Addresses perfectamente."

# 6. Iniciar todas las aplicaciones
echo "🌐 Iniciando clústers de Next.js (Espera un momento)..."

cd stablecoin/compra-stableboin && npm run dev > /dev/null 2>&1 &
cd ../..
cd stablecoin/pasarela-de-pago && npm run dev > /dev/null 2>&1 &
cd ../..
cd web-admin && npm run dev > /dev/null 2>&1 &
cd ..
cd web-customer && npm run dev > /dev/null 2>&1 &
cd ..

echo " "
echo "=========================================================="
echo "🎉 ¡ECOSISTEMA DBECOMMERCE COMPLETAMENTE ONLINE! 🎉"
echo "=========================================================="
echo "🔌 Blockchain Principal:   http://localhost:8545"
echo "💳 Compra de Stablecoin:   http://localhost:6001 (Stripe)"
echo "💸 Pasarela de Pago B2B:   http://localhost:6002"
echo "🛠️  Panel Web Admin:       http://localhost:6003"
echo "🛍️  Tienda Web Customer:   http://localhost:6004"
echo "=========================================================="
echo "Tip: Presiona CTRL+C para detener esta consola, o ejecuta 'taskkill //F //IM node.exe //T' para colapsar y apagar las páginas en cualquier momento."
