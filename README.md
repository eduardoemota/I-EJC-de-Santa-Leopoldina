# Projeto dos 15 Terços

## Arquivos
- `index.html` – o site que a pessoa vê ao escanear (`?id=1` … `?id=15`)
- `messages.js` – as 15 mensagens (é o único arquivo que você precisa trocar para atualizar textos)
- `admin.html` – editor das mensagens + gerador de QR Codes e etiquetas
- `style.css`, `app.js`, `art.js`, `qr.js`, `assets/rosa.png` – visual e funcionamento

## Publicar no GitHub Pages
1. Crie um repositório público e envie todos estes arquivos para a raiz.
2. Em Settings → Pages, escolha Branch `main` e pasta `/ (root)`.
3. O endereço será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

## Fluxo de uso
1. Abra `admin.html` (no endereço publicado), edite as mensagens e clique em **Baixar messages.js**.
2. Substitua `messages.js` no GitHub. Os QR Codes não mudam.
3. Na aba **QR Codes e etiquetas**, confira o endereço do site e clique em **Imprimir etiquetas** (A4, 100%).
4. Teste cada QR Code com o celular antes do evento.

Observação: as mensagens ficam em um arquivo público do site; não inclua informações sensíveis.
