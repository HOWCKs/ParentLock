# Backend Supabase

A base do vínculo real fica em `supabase/migrations/0001_parentlock_core.sql`.

## O que a migration prepara

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

A autenticação do administrador ainda está deliberadamente reservada para a próxima etapa, conforme o plano atual. Enquanto não houver URL e anon key configuradas, a tela de conexão informa que nenhum vínculo foi criado, em vez de simular sucesso.
