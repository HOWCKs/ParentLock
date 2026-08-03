# Arquitetura do vínculo entre os dois aplicativos

## Decisão

O **ParentLock Admin gera o convite**. O **ParentLock Companion recebe e digita o código**. O vínculo só fica ativo depois de:

1. o administrador criar um convite autenticado;
2. o Companion enviar uma solicitação usando o código;
3. os dois lados visualizarem as permissões;
4. o administrador aceitar;
5. o Companion confirmar o compartilhamento.

O código tem validade curta, é usado uma vez e não é armazenado em texto puro.

## Dados que podem entrar no vínculo

Cada tipo de dado terá seu próprio consentimento:

- localização atual e rota;
- precisão e horário da posição;
- estado da bateria;
- passos/atividade, somente com permissão de saúde/atividade;
- SOS;
- alertas de chegada ou saída;
- check-in de áudio iniciado por pedido visível e aceite explícito.

## Limites de privacidade

O produto não terá escuta contínua, gravação escondida, leitura de tela, keylogging ou acesso a tudo o que acontece no aparelho. O áudio será um check-in curto, com indicador visível, possibilidade de recusar e encerramento claro.

Localização em segundo plano, bateria e passos exigem permissões Android próprias e devem aparecer no centro de privacidade. O Companion sempre poderá pausar o compartilhamento, e o Admin receberá o estado dessa pausa.

## Estado atual

A migration Supabase e a tela de conexão já estão preparadas. A geração real depende da próxima etapa: criar a conta do administrador e configurar autenticação. Sem essas variáveis, o app não simula convite ou vínculo.
