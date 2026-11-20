# Site dos 15 terços — EJC

- `public/index.html`: site público responsivo.
- `public/messages.json`: 15 mensagens iniciais editáveis.
- `public/assets/`: ilustrações vetoriais de rosa e Nossa Senhora Aparecida.
- `admin/admin.html`: editor local e gerador de QR Codes. **Não publique a pasta admin.**

## Publicar no GitHub Pages
Envie o conteúdo de `public` para a raiz publicada do repositório. `index.html`, `messages.json` e `assets` devem ficar juntos. Em Settings > Pages, escolha Deploy from a branch, branch `main`, folder `/ (root)`.

## Editar mensagens
Abra `admin/admin.html` no navegador. Edite nomes, saudações, títulos, mensagens e versículos. Baixe `messages.json`, substitua o arquivo no repositório e faça commit. Os QR Codes permanecem iguais: `?id=01` até `?id=15`.

## QR Codes
Depois de publicar, cole a URL HTTPS do site no editor, com barra final, e clique em Gerar 15 QR Codes. Imprima pelo navegador e teste cada etiqueta em Android e iPhone.

A área administrativa é local e deve ficar fora do repositório público. As mensagens são exemplos editáveis. O site carrega `messages.json` pela internet e o gerador de QR Code usa uma biblioteca externa via CDN.
