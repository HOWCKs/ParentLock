# ParentLock

Experiência mobile-first para proteção familiar clara, segura e com consentimento.

## O que está nesta primeira entrega

A interface já apresenta os dois lados do produto em um único espaço de teste:

- **Administrador:** visão geral da família, localização/rota, alertas, conexão por código, check-in de áudio e central de privacidade.
- **Acompanhado:** botão SOS, localização compartilhada, rota do dia, explicação sobre áudio com aceite e calculadora.
- **Transparência:** o estado de compartilhamento é sempre visível; o fluxo de áudio é um pedido de check-in que depende de aceite explícito e não oferece escuta oculta ou contínua.
- **Dados simulados:** esta versão é para validar a experiência visual e os fluxos. Nenhuma localização, áudio ou dado pessoal real é coletado.

A base usa **Vite + JavaScript modular + CSS responsivo** para que a interface possa ser testada imediatamente no navegador do celular via Termux. Para a versão conectada, a evolução recomendada é levar os mesmos fluxos para **Expo/React Native**, com permissões nativas explícitas, autenticação, backend e mapa real.

## Executar no Termux

```bash
pkg update
pkg install nodejs-lts git
cd ParentLock
npm ci
npm run dev -- --host 0.0.0.0
```

Abra o endereço exibido pelo Vite no navegador. Para testar em outro aparelho na mesma rede, use o IP local do Termux e a porta indicada.

Comandos úteis:

```bash
npm run check   # valida o JavaScript
npm run build   # gera a compilação de produção
npm run preview # serve a compilação localmente
```

Os modelos de workflow ficam em `docs/workflows/`. Eles podem ser ativados no GitHub depois que o token usado para o push tiver a permissão `workflow`.

## Gerar o APK de interface

A interface foi empacotada com **Capacitor** para que o primeiro teste possa ser instalado no Android. O APK é de debug, não exige assinatura de produção e contém apenas os dados simulados da experiência.

Para ativar a compilação na nuvem no GitHub, copie o modelo `docs/workflows/android-apk.yml.example` para `.github/workflows/android-apk.yml` e faça um novo push com uma conta que tenha o escopo `workflow`:

```bash
mkdir -p .github/workflows
cp docs/workflows/ci.yml.example .github/workflows/ci.yml
cp docs/workflows/android-apk.yml.example .github/workflows/android-apk.yml
git add .github/workflows
git commit -m "ci: ativar compilacao e apk android"
git push origin arena/019fbfa8-parentlock
```

Depois, abra **Actions → Gerar APK de teste → Run workflow**. Aguarde a tarefa **Compilar ParentLock Android** terminar, baixe o artefato `parentlock-interface-debug` e abra o arquivo `app-debug.apk` no Android.

Para uma compilação local com Android SDK configurado:

```bash
npm ci
npm run apk:debug
```

O APK será gerado em `android/app/build/outputs/apk/debug/app-debug.apk`. No Termux, recomendamos usar o workflow em nuvem porque o Android SDK e o Java ocupam bastante espaço. A próxima etapa, depois do feedback visual, será substituir os dados simulados por autenticação, backend, permissões nativas e mapa real.
