#!/bin/bash

# Configuration
PROJECT_REF="pruxuxghfgwmclveofrt"
SUBJECT="Confirme seu cadastro"
CONTENT=$(cat supabase/templates/confirm_signup.html)

# Check for access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ Erro: SUPABASE_ACCESS_TOKEN não encontrada."
  echo "Por favor, execute: export SUPABASE_ACCESS_TOKEN=seu_token_aqui"
  echo "Você pode gerar um token em: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

echo "🚀 Atualizando template de e-mail no Supabase (Ref: $PROJECT_REF)..."

curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"mailer_subjects_confirmation\": \"$SUBJECT\",
    \"mailer_templates_confirmation_content\": $(echo "$CONTENT" | jq -aRs '.')
  }"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Template atualizado com sucesso!"
else
  echo ""
  echo "❌ Falha ao atualizar template."
fi
