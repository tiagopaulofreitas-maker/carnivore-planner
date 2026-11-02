# Ensaio no Samsung — candidata v8.7

Estado em 02/11/2026: ensaio físico da cópia privada, versão de teste 6, baseada no PR #1 (`69cf07d`). O utilizador confirmou instalação, abertura pelo ícone, reabertura em modo de voo, consulta de ingredientes/passos de uma receita offline e reabertura após recuperar a ligação. As confirmações são relatos do utilizador no Samsung, não observação remota nem comparação dos seus dados.

| Verificação | Evidência | Estado |
| --- | --- | --- |
| ERR_FAILED e HTML redirecionado na cache | Capturas Samsung e reprodução Chromium antes da correção | Reproduzida e corrigida |
| Instalação Carnivore TESTE Samsung | Captura do pedido com nome/origem corretos e confirmação do utilizador | Passou no dispositivo |
| Abertura pelo ícone e permanência | Confirmação do utilizador | Passou no dispositivo |
| Reabertura em modo de voo | Confirmação do utilizador após instrução para desligar também Wi-Fi | Passou no dispositivo |
| Ingredientes e passos de uma receita offline | Confirmação do utilizador | Passou no dispositivo |
| Reabertura após recuperar Internet | Confirmação do utilizador | Passou no dispositivo |
| Quota, Cache API, fotos, atualização v8.6 → v8.7 e dados byte a byte | CI em Chromium com dados fictícios e falhas controladas | Passou em automação |
| TalkBack, escalas e modo Cozinhar no Samsung | Sem confirmação física | Não testado no dispositivo |
| Todas as fotografias offline, atualização v8.6 → v8.7 e dados exatos no Samsung | Sem confirmação física | Não testado no dispositivo |

CI da candidata: [41501326124](https://github.com/tiagopaulofreitas-maker/carnivore-planner/actions/runs/41501326124), commit `69cf07d06a02635c172a0d67ba7743534bc6c5bd`. O utilizador encerrou o ensaio manual; não se atribui aprovação a funcionalidades não exercitadas.

A falha ocorria quando o alojamento redirecionava index.html para a pasta e o service worker devolvia diretamente essa resposta guardada para uma navegação. O worker agora reconstrói apenas a resposta redirecionada, mantendo conteúdo e cabeçalhos; não apaga dados nem exige limpar caches. Um ponto de recuperação e os testes anteriores foram preservados.

## Pré-requisito: endereço de ensaio

É necessário um endereço HTTPS acessível no Samsung e com **origem diferente da aplicação pessoal**: esquema, domínio ou porta diferente. Um caminho diferente no mesmo domínio não isola o localStorage. O manifesto da candidata usa o caminho absoluto `/carnivore-planner/` para `id`, `scope` e `start_url`: servir a cópia nesse caminho na origem de teste e confirmar que instalação e abertura autónoma permanecem nessa origem. Não copiar dados pessoais nem importar cópias reais para a instância de teste. Confirmar que a origem de teste não é a de produção antes de alterar qualquer dado.

O Site de teste independente está ativo, com acesso apenas à conta do proprietário:
https://carnivore-samsung-test-8a264af.tiagopaulofreitas.chatgpt.site/carnivore-planner/

O nome da instalação nessa cópia é **Carnivore TESTE**. A página /inspecao/ permite atualizar os workers de teste sem apagar caches ou dados. A página /diagnostico/ é apenas um ensaio instrumental e não deve ser instalada nem usada como prova de instalação da candidata. Não substituir produção nem fazer merge como parte destes testes.

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

## Preparação de publicação autorizada em 02/11/2026

O utilizador autorizou o merge e publicação após a revisão final. Destino existente confirmado por HTTPS: https://tiagopaulofreitas-maker.github.io/carnivore-planner/ (release 8.6 antes da publicação). Preservar essa origem e o caminho do manifesto; não transferir dados da cópia privada.

Ponto de recuperação remoto: branch `recovery/production-v86-before-v87`, commit `92192bc62cf5ca10d249570c86d370b5cc39df64`. Este ponto guarda código, não dados pessoais do navegador; não foi recolhida uma cópia desses dados. A candidata mantém a chave `cp-v11` e os testes de atualização verificam os bytes de dados fictícios.

Se surgir regressão em produção, preservar os dados e recuperar por um novo commit revisto, sem force-push, limpeza de armazenamento ou desinstalação. Para clientes já controlados pelo worker v87, não basta repor ficheiros v86: preparar um novo identificador de shell e registo de worker, testar a atualização inversa em origem isolada e só depois publicar a recuperação. Não marcar a recuperação como testada antes desse ensaio.
