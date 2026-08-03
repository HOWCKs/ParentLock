# ParentLock

Experiência mobile-first para proteção familiar clara, segura e com consentimento.

## Dois aplicativos

A próxima compilação gera dois APKs com o mesmo núcleo visual, mas com experiências separadas:

- **ParentLock Admin:** painel da família, mapa e rotas, alertas, conexão por código, check-in de áudio e privacidade.
- **ParentLock Companion:** tela principal focada em calculadora e quiz matemático. Não exibe o painel, o histórico ou os alertas do administrador. A área **Proteção familiar** permanece identificada e visível para mostrar o vínculo, o consentimento, o status de localização e o SOS.

A ferramenta não disfarça coleta de localização ou áudio como calculadora. Se a pessoa não quiser compartilhar dados, ela pode pausar ou desativar as permissões na área de privacidade; um aplicativo realmente independente de matemática também pode ser compilado sem nenhuma permissão sensível.

## Direção visual atual

- O **mapa real** é a tela principal do administrador, usando tiles do OpenStreetMap, rota destacada e marcador ao vivo.
- A navegação principal fica em um card flutuante arredondado sobre o mapa.
- Os detalhes aparecem em uma bottom sheet com alça em formato de cápsula; ela pode ser tocada ou arrastada para expandir e recolher.
- O tema **AMOLED** pode ser alternado pelo botão de tema, com fundo preto verdadeiro e contraste reduzido para telas OLED.

Nesta versão:

- o mapa, a localização, o SOS e o áudio usam dados simulados;
- o áudio é somente um pedido de check-in com aceite explícito;
- não existe escuta oculta ou contínua;
- nenhuma localização, gravação ou dado pessoal real é coletado.

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
npm run check             # valida o JavaScript
npm run build:admin      # bundle do administrador
npm run build:companion  # bundle do acompanhado
npm run preview           # serve a compilação localmente
```

## Gerar os APKs

A interface foi empacotada com **Capacitor** e o Android usa variantes de produto para gerar os dois aplicativos:

```bash
npm ci
npm run apk:debug
```

Os APKs locais ficam em caminhos semelhantes a:

```text
android/app/build/outputs/apk/admin/debug/app-admin-debug.apk
android/app/build/outputs/apk/companion/debug/app-companion-debug.apk
```

No Termux, recomendamos a compilação na nuvem porque o Android SDK e o Java ocupam bastante espaço.

## Compilação na nuvem pelo GitHub Actions

Os modelos de workflow ficam em `docs/workflows/`. Eles podem ser ativados no GitHub depois que o token usado para o push tiver a permissão `workflow`.

Se os workflows ainda não estiverem no branch, execute:

```bash
mkdir -p .github/workflows
cp docs/workflows/ci.yml.example .github/workflows/ci.yml
cp docs/workflows/android-apk.yml.example .github/workflows/android-apk.yml
git add .github/workflows
git commit -m "ci: ativar compilacao e apk android"
git push origin arena/019fbfa8-parentlock
```

Depois, abra **Actions → Gerar APK de teste → Run workflow**. O artefato `parentlock-interface-debug` conterá os dois APKs.

Para acompanhar e baixar automaticamente no Termux:

```bash
git pull --ff-only origin arena/019fbfa8-parentlock
bash scripts/termux-apk.sh
```

Para abrir um perfil específico depois do download:

```bash
bash scripts/termux-apk.sh admin
bash scripts/termux-apk.sh companion
```

Depois do feedback visual, a próxima etapa será substituir os dados simulados por autenticação, backend, permissões nativas explícitas e mapa real.
