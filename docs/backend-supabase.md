# Backend Supabase

A base do vínculo real está dividida em três migrations na pasta `supabase/migrations/`, para facilitar a execução pelo SQL Editor:

Execute nesta ordem:

```text
0001_extensions_and_tables.sql
0002_pairing_functions.sql
0003_rls_and_realtime.sql
0004_activate_companion_device.sql
0005_email_invites.sql
0006_fix_pgcrypto_schema.sql
0007_device_status.sql
```

Cada arquivo é independente para colar no SQL Editor. Não pule a ordem.

## O que as migrations preparam

- famílias e participantes;
- aparelhos por participante;
- códigos de convite com hash e expiração de 15 minutos;
- solicitações de vínculo aguardando aceite;
- consentimentos separados para localização, alertas, áudio e histórico;
- pontos de localização com precisão e horário;
- alertas SOS/chegada/saída;
- RLS para impedir leitura entre famílias;
- tabelas principais disponíveis no Realtime.

O código bruto do convite não é armazenado no banco. A função `create_pairing_code` cria o código e salva somente o hash. `redeem_pairing_code` cria uma solicitação pendente; a vinculação só acontece quando o administrador aceitar.

## Configuração

1. Crie um projeto no Supabase.
2. No SQL Editor, execute a migration.
3. Copie `.env.example` para `.env.local`.
4. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Nunca use ou publique uma chave `service_role` no aplicativo.

```bash
cp .env.example .env.local
npm run dev
```

Para os APKs compilados pelo GitHub Actions, cadastre os mesmos valores como secrets do repositório:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

A tela de autenticação por e-mail e senha já está preparada. No Supabase, habilite o provedor Email antes de testar. Enquanto não houver URL e anon key configuradas, a tela de conexão informa que nenhum vínculo foi criado, em vez de simular sucesso.
