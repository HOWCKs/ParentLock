# Arquitetura do vínculo entre os dois aplicativos

## Decisão

A opção principal agora é o convite pelo **e-mail da conta**: o **ParentLock Admin informa o e-mail do Companion** e o Companion recebe o convite ao entrar com essa conta. O código continua como alternativa. O vínculo só fica ativo depois de:

1. o administrador criar um convite autenticado;
2. o Companion enviar uma solicitação usando o código;
3. os dois lados visualizarem as permissões;
4. o administrador aceitar;
5. o Companion confirmar o compartilhamento.

O convite por e-mail usa o hash do endereço e aparece somente para a conta autenticada correspondente. Ele não depende de SMTP para o primeiro teste; o envio de uma mensagem externa pode ser conectado depois. O código alternativo tem validade curta, é usado uma vez e não é armazenado em texto puro.

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

A migration Supabase, a tela de conexão e a tela de autenticação já estão preparadas. A geração real depende de criar o projeto Supabase, habilitar o provedor de e-mail e preencher as variáveis do aplicativo. Sem essas configurações, o app não simula convite ou vínculo.
