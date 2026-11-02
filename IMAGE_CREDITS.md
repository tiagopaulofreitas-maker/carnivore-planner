# Créditos das fotografias — Carnivore Planner

As fotografias são **ilustrativas**, não reproduções exatas dos 33 pratos ou das respetivas porções. São partilhadas entre pratos semelhantes; o conteúdo das receitas e as quantidades são os dados efetivos do plano.

Fotografias de uso gratuito licenciadas ao abrigo da [Unsplash License](https://unsplash.com/license):

- **Bife de novilho:** Emerson Vieira — https://unsplash.com/photos/cooked-sliced-meat-cpkPJ-U9eUM
- **Porco preto e grelhados:** tommao wang — https://unsplash.com/photos/AS8eZ9iJYY4
- **Assados / carne em panela:** Kris Tian — https://unsplash.com/photos/sliced-smoked-brisket-on-pink-butcher-paper-APGihs2AsjQ
- **Salmão:** Farhad Ibrahimzade — https://unsplash.com/photos/isHUj3N0194
- **Peixes pequenos:** Yoav Hornung — https://unsplash.com/photos/8-IpqsggI1s
- **Hambúrguer de carne:** Joshua Kantarges — https://unsplash.com/photos/burger-patty-being-cooked-wO4CyWnIzz4
- **Frango assado:** Levi T. — https://unsplash.com/photos/CuhsuC_4vNU

As imagens são obtidas de `images.unsplash.com` com tamanhos adaptados para cartões e detalhes. A aplicação mantém um ícone/fundo de substituição quando uma imagem não carrega. A navegação e as receitas continuam disponíveis offline; **fotografias ainda não visitadas podem não estar disponíveis offline**.

Todas as URLs e os créditos encontram-se em `recipe-media.js`. Não são imagens feitas especificamente dos pratos do plano.

## Revisão de correspondência

As 33 receitas foram verificadas contra o seletor: 8 usam a fotografia de bife, 8 a de assado, 6 a de porco, 4 a de salmão, 4 a de peixe e 1 a de frango; 2 pratos de hambúrguer usam uma fotografia de hambúrgueres na grelha. As imagens restantes são genéricas e várias incluem acompanhamentos vegetais, ou mostram apenas um dos ingredientes de pratos mistos. A correspondência exata da apresentação ainda não está resolvida.

## Cache de fotografias

O service worker guarda respostas HTTP válidas com CORS anónimo, sem credenciais. Um erro HTTP temporário não é guardado como fotografia válida e permite nova tentativa. Fotografias antigas guardadas como respostas opacas são mantidas como recurso offline; não há limpeza ou migração global da cache.

O limite é de **26 URLs**, partilhado entre miniaturas e imagens grandes: os dois tamanhos da mesma fotografia contam como duas entradas. Entradas antigas podem ser removidas ao ultrapassar o limite; fotografias ainda não vistas ou já removidas usam o símbolo de substituição offline. Não se promete que todas as fotografias estejam disponíveis sem rede.

O ensaio `tests/photo-cache-browser.mjs` usa Chromium, service worker e Cache API reais, com um servidor externo de imagens simulado. Cobre os dois tamanhos, reabertura offline, imagens não vistas e removidas, erro HTTP seguido de recuperação, preenchimento concorrente e comparação exata dos dados fictícios guardados. Não equivale a um teste físico no Samsung.

## Falhas de armazenamento

Se a cache não puder ser aberta ou lida, o worker tenta a rede para páginas, recursos da aplicação e fotografias. Uma falha de escrita por quota não impede apresentar uma imagem recebida da rede, mas essa imagem pode não ficar disponível offline. Se a cache estiver ilegível e não houver rede, a abertura offline não pode ser garantida; a aplicação recupera quando a cache volta a estar acessível, sem limpar os dados do plano.

Os testes injetam erros na Cache API do worker, incluindo SecurityError e QuotaExceededError. Isso reproduz o tratamento das falhas sem encher realmente o disco nem alterar as permissões do dispositivo. O teste de atualização injeta também uma falha de quota durante a instalação da candidata e confirma que a versão anterior continua utilizável offline com os dados fictícios intactos.
