# Instruções para Popular o Banco de Dados

## Aplicar Migration de Seed

Para popular o banco de dados com dados de exemplo de psicólogos, você precisa aplicar a migration `002_psychologists_seed.sql`.

### Opção 1: Usando Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Navegue para **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase/migrations/002_psychologists_seed.sql`
6. Clique em **Run** para executar a migration
7. Verifique os resultados na parte inferior da tela

### Opção 2: Usando Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Aplicar migrations
supabase db push
```

### Opção 3: Usando psql (PostgreSQL CLI)

Se você tiver acesso direto ao banco:

```bash
psql "postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres" -f supabase/migrations/002_psychologists_seed.sql
```

## Verificar Dados

Após aplicar a migration, você pode verificar se os dados foram inseridos corretamente:

```sql
SELECT 
  p.full_name,
  pp.crp,
  pp.specialties,
  pp.price_per_session,
  pp.is_verified
FROM psychologist_profiles pp
JOIN profiles p ON pp.user_id = p.user_id
WHERE pp.is_verified = true
ORDER BY p.created_at DESC;
```

Você deve ver 6 psicólogos listados:
- Dra. Ana María Rojas
- Dr. Carlos Fuentes
- Dra. Sofia Vergara
- Dra. Isabella Gómez
- Dr. Juan David Pérez
- Dra. Valentina Ortiz

## Próximos Passos

Após popular o banco:

1. Reinicie o servidor de desenvolvimento (se necessário):
   ```bash
   npm run dev
   ```

2. Acesse as páginas para testar:
   - `/busca` - Lista de psicólogos
   - `/psicologo/[id]` - Perfil individual (use o `user_id` de um psicólogo)

3. Verifique que os dados reais aparecem ao invés dos mocks
