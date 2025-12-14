#!/bin/bash

echo "🔍 Verificando configuração do .env.local..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ Arquivo .env.local não encontrado!${NC}"
    echo ""
    echo "Criando arquivo .env.local..."
    touch .env.local
    echo -e "${GREEN}✅ Arquivo .env.local criado!${NC}"
    echo ""
fi

# Função para verificar variável
check_var() {
    local var_name=$1
    if grep -q "^${var_name}=" .env.local 2>/dev/null; then
        local value=$(grep "^${var_name}=" .env.local | cut -d '=' -f 2-)
        if [ ! -z "$value" ] && [[ ! "$value" =~ (sua-|SUA-|aqui|AQUI|YOUR) ]]; then
            echo -e "${GREEN}✅ ${var_name}${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  ${var_name} (configurado mas parece ser um placeholder)${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ ${var_name}${NC}"
        return 1
    fi
}

echo "Verificando variáveis de ambiente:"
echo ""

# Verificar cada variável
check_var "NEXT_PUBLIC_SUPABASE_URL"
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_var "SUPABASE_SERVICE_ROLE_KEY"
check_var "DATABASE_URL"
check_var "NEXTAUTH_URL"
check_var "NEXTAUTH_SECRET"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Contar variáveis faltando
missing=0
grep -q "^DATABASE_URL=" .env.local && grep "^DATABASE_URL=" .env.local | grep -q '[SUA-SENHA\|YOUR-PASSWORD]' && ((missing++))
grep -q "^DATABASE_URL=" .env.local || ((missing++))
grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env.local || ((missing++))
grep -q "^NEXTAUTH_SECRET=" .env.local || ((missing++))

if [ $missing -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Você precisa configurar as variáveis faltantes!${NC}"
    echo ""
    echo "📖 Consulte o guia: CONFIGURE_ENV.md"
    echo ""
    echo "Principais passos:"
    echo "1. Acesse: https://app.supabase.com/project/kcelewgxwcdsbnvkhwjw/settings/database"
    echo "2. Copie a Connection String (URI)"
    echo "3. Substitua [YOUR-PASSWORD] pela sua senha"
    echo "4. Adicione DATABASE_URL ao .env.local"
    echo ""
    echo "Para gerar NEXTAUTH_SECRET:"
    echo "  openssl rand -base64 32"
    echo ""
else
    echo -e "${GREEN}✨ Todas as variáveis estão configuradas!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  npm run db:test      # Testar conexão"
    echo "  npm run db:push      # Criar tabelas no banco"
    echo "  npm run dev          # Iniciar aplicação"
fi

echo ""
