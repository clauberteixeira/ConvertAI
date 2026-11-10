<div align="center">

<img src="icon.svg" width="72" alt="">

# ConvertAÍ

**Suas imagens viram um PDF leve, direto no navegador.**

[![Usar agora, é grátis](https://img.shields.io/badge/Usar_agora-%C3%A9_gr%C3%A1tis-0f766e?style=for-the-badge)](https://clauberteixeira.github.io/ConvertAI/)
[![Baixar para usar sem internet](https://img.shields.io/badge/Baixar-usar_sem_internet-1e3a8a?style=for-the-badge)](https://clauberteixeira.github.io/ConvertAI/baixar/)

![Privado](https://img.shields.io/badge/privado-nada_vai_para_servidor-555?style=flat-square)
![Sem cadastro](https://img.shields.io/badge/sem-cadastro-555?style=flat-square)
![Formatos](https://img.shields.io/badge/aceita-PNG_%7C_JPG_%7C_WEBP-555?style=flat-square)
![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-555?style=flat-square)

<img src="docs/demo.gif" width="720" alt="Demonstração: três imagens são escolhidas, ordenadas por nome, a qualidade é ajustada e o PDF fica pronto para baixar">

</div>

## Como funciona

| Passo | O que você faz |
|:---:|---|
| **1** | Abra o [ConvertAÍ](https://clauberteixeira.github.io/ConvertAI/) e **arraste as imagens** para a página (ou toque para escolher). |
| **2** | **Organize a ordem**: arraste, use as setas ou clique em "Ordenar por nome". Cada imagem vira uma página. |
| **3** | **Escolha a qualidade**: alta, equilibrada ou arquivo menor. Se quiser, diga o **tamanho máximo** em MB. |
| **4** | Clique em **Gerar PDF** e depois em **Baixar PDF**. Pronto! |

Funciona no computador e no celular, sem instalar nada.

## 💾 Prefere usar sem internet? Baixe o arquivo

Se você não quer usar pelo link, pode ter o ConvertAÍ no seu computador. É **um arquivo só**: não tem
instalação, cadastro nem permissão especial.

| Passo | O que você faz |
|:---:|---|
| **1** | Clique em **[Baixar o ConvertAÍ](https://clauberteixeira.github.io/ConvertAI/baixar/)**. O arquivo vai para a sua pasta de Downloads. |
| **2** | Dê **dois cliques** no arquivo. Ele abre no seu navegador (Chrome, Edge, Firefox ou Safari). |
| **3** | Use do mesmo jeito que no site. Se quiser, **desligue a internet**: continua funcionando. |

Funciona igual no **Windows, Mac e Linux**. Dica: guarde o arquivo na Área de Trabalho para achar fácil.
Todas as versões ficam na página de [Releases](https://github.com/clauberteixeira/ConvertAI/releases).

## 🔒 Suas imagens ficam com você

A conversão acontece **no seu próprio aparelho**. As imagens não são enviadas para nenhum servidor,
então ninguém além de você tem acesso a elas.

## Detalhes

- Até **100 imagens** por PDF, nos formatos **PNG, JPG e WEBP**. O tipo é conferido pelo conteúdo do
  arquivo, não pelo nome.
- Cada página tem o lado maior do tamanho de uma folha **A4**, e o outro lado acompanha a proporção da
  imagem. Partes transparentes ficam brancas.
- Com **tamanho máximo**, o ConvertAÍ comprime um pouco mais a cada tentativa até caber. Se não der,
  entrega o menor PDF possível e avisa.
- Imagens quebradas ficam de fora, com um aviso dizendo quais foram.

## Para quem programa

É um site estático, sem etapa de build. Para rodar localmente:

```bash
python -m http.server 8000   # depois abra http://localhost:8000
npm test                     # testes (Node 20 ou mais novo)
npm run build                # gera dist/ConvertAI.html, a versão de arquivo único
```

Para publicar uma versão nova do arquivo para download, envie uma tag:

```bash
git tag v1.1.0
git push origin v1.1.0
```

O GitHub Actions roda os testes, gera o `ConvertAI.html` e cria a Release sozinho
([.github/workflows/release.yml](.github/workflows/release.yml)).

O PDF é montado com [pdf-lib](https://github.com/Hopding/pdf-lib) (licença MIT, cópia em `vendor/`).

## Licença

[MIT](LICENSE). Pode usar, copiar e modificar à vontade.
