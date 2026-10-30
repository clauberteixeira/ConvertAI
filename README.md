# ConvertAÍ

Junte imagens **PNG, JPG e WEBP** num **PDF leve**, na ordem que quiser, direto no navegador.

👉 **Use agora:** https://clauberteixeira.github.io/ConvertAI/

🔒 **Privado:** a conversão acontece no seu computador ou celular. As imagens não são enviadas para
nenhum servidor.

## Como usar

1. Arraste as imagens para a página (ou toque para escolher).
2. Ajuste a ordem: arraste, use as setas ou "Ordenar por nome".
3. Escolha a qualidade e, se quiser, um tamanho máximo em MB.
4. Clique em **Gerar PDF** e baixe.

## Como funciona

- Cada imagem vira uma página. O lado maior da página tem o tamanho de uma folha A4 e o outro lado
  acompanha a proporção da imagem.
- As imagens são reduzidas e comprimidas em JPEG conforme a qualidade escolhida. Partes transparentes
  ficam brancas.
- Com tamanho máximo, o ConvertAÍ comprime mais a cada tentativa até caber. Se não couber, entrega o
  menor PDF possível e avisa.
- Até 100 imagens por PDF. O tipo do arquivo é conferido pelo conteúdo, não pela extensão.

## Rodar no seu computador

Não precisa instalar nada: é um site estático. Sirva a pasta com qualquer servidor local, por exemplo:

```bash
python -m http.server 8000
```

e abra http://localhost:8000. Para rodar os testes: `npm test` (Node 20 ou mais novo).

## Créditos

PDF gerado com [pdf-lib](https://github.com/Hopding/pdf-lib) (licença MIT, cópia em `vendor/`).

## Licença

[MIT](LICENSE)
