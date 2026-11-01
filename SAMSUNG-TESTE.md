# Ensaio no Samsung — candidata v8.7

Estado: **por executar no dispositivo físico**. A candidata é o commit `7f2a27f67e849a0955a0fa2332301aea50df05c5` do PR #1. Já foi verificada em Chromium automatizado e numa janela simulada de 320 píxeis; esses resultados não comprovam a instalação, o TalkBack ou o funcionamento offline no Samsung.

## Pré-requisito: endereço de ensaio

É necessário um endereço HTTPS acessível no Samsung e com **origem diferente da aplicação pessoal**: esquema, domínio ou porta diferente. Um caminho diferente no mesmo domínio não isola o localStorage. O manifesto da candidata usa o caminho absoluto `/carnivore-planner/` para `id`, `scope` e `start_url`: servir a cópia nesse caminho na origem de teste e confirmar que instalação e abertura autónoma permanecem nessa origem. Não copiar dados pessoais nem importar cópias reais para a instância de teste. Confirmar que a origem de teste não é a de produção antes de alterar qualquer dado.

Neste momento não foi disponibilizado um endereço de ensaio acessível ao telemóvel. A pré-visualização interna usada pela equipa não constitui um endereço utilizável no Samsung. Não substituir produção nem fazer merge para contornar esta limitação.

## Antes de começar

Na aplicação pessoal, em Ajustes > Dados e cópia de segurança, usar **Descarregar cópia**, se disponível, e guardar o ficheiro num local seguro. Não apagar dados nem desinstalar a aplicação pessoal. No ensaio, usar apenas dados fictícios e confirmar visualmente o endereço HTTPS isolado. Registar modelo, versão Android, navegador e data; não partilhar o ficheiro de cópia ou outros dados pessoais no relatório.

## 1. Abrir e instalar

1. No Chrome do Samsung, abrir o endereço HTTPS isolado. Confirmar o endereço e a indicação v8.7. Se aparecer um plano com dados pessoais, parar: a separação não está confirmada.
2. No menu ⋮, escolher a opção disponibilizada para instalar a aplicação ou adicioná-la ao ecrã principal. Os nomes podem variar. Se não surgir, registar exatamente o que aparece; um atalho não prova instalação PWA.
3. Abrir pelo novo ícone e confirmar se aparece numa janela autónoma, sem a barra normal do navegador. Registar eventuais mensagens e se o ícone pode ser distinguido do da aplicação pessoal.

## 2. Escalas e modo Cozinhar

1. Abrir o primeiro dia com **Entrecôte alto e ovos**, sem substituir a receita de ensaio. Na ficha, tocar 0,5×: verificar o destaque do botão, **247,5 g** de entrecôte e **1,5 ovos**, além do aviso sobre ovos fracionados. Se a receita ou quantidades-base forem diferentes, registar o que aparece em vez de assumir estes valores.
2. Tocar em 1× e 2×: para a receita-base acima, verificar respetivamente 495 g e 3 ovos, depois 990 g e 6 ovos. Confirmar que a escala selecionada é distinguível e que o aviso refere que plano, compras, lotes e stock usam 1×.
3. Com 0,5× selecionado, abrir **Cozinhar plano 1×**. Confirmar o aviso de ingredientes do plano, avançar e regressar um passo, e voltar à ficha. Não marcar uma refeição como concluída nem confirmar descontos de stock durante esta sequência.

## 3. TalkBack e navegação

1. Em Definições > Acessibilidade > TalkBack, ativar o TalkBack. O caminho pode variar com a versão do Android. Para voltar a desativar, regressar à mesma definição; usar o atalho de teclas de volume apenas se já estiver configurado.
2. No ensaio, deslizar para a direita/esquerda para percorrer controlos e tocar duas vezes para ativar o elemento focado. Confirmar que os nomes 0,5×, 1× e 2× e o estado selecionado são anunciados de forma compreensível.
3. Ativar uma escala, continuar a percorrer os controlos e testar Próximo e Anterior no modo Cozinhar. Registar se o foco se perde, salta ou anuncia incorretamente. Verificar também o comando Voltar do Android e a navegação inferior. Desativar TalkBack quando terminar, se desejado.

## 4. Offline

1. Com ligação ativa, abrir pelo menos a ficha, o plano e as compras para preparar o ensaio. No plano de teste, efetuar uma alteração fictícia e verificar que continua após fechar e voltar a abrir. Não confundir plano gerado automaticamente com dados pessoais.
2. Ativar modo de avião e abrir novamente a aplicação instalada. Verificar se abre e se a alteração fictícia, plano, receita e compras permanecem acessíveis. Fotografias externas não previamente guardadas podem não aparecer; registar o resultado em separado.
3. Reativar a ligação e confirmar novamente o mesmo dado de teste. Se falhar, registar a mensagem e a etapa, sem limpar armazenamento nem remover a aplicação pessoal.

## Resultados a enviar

Para cada etapa, indicar **passou**, **falhou** ou **não testado**; acrescentar a mensagem ou uma captura sem informação privada em caso de falha. A atualização real da v8.6 para a v8.7 exige uma instalação separada da v8.6 seguida de atualização controlada na **mesma origem de ensaio**; esta sequência não é validada pelo ensaio de instalação da v8.7. Não foi executada no Samsung.
