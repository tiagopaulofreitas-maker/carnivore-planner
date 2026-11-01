# Verificação no Samsung — candidata v8.7

Estado: por executar num Samsung físico. A candidata encontra-se no PR #1 e não tem ainda um endereço de teste independente utilizável pelo telemóvel. Não instalar a v8.6 de produção e apresentá-la como teste da v8.7.

Antes de testar, preparar um endereço HTTPS isolado da candidata, com âmbito e armazenamento distintos da produção. Fazer uma cópia dos dados em Ajustes > Descarregar cópia na aplicação atual e guardá-la em local seguro. Um endereço diferente tem armazenamento próprio: confirmar que não contém o plano real antes de importar uma cópia de teste.

1. No Chrome do Samsung, abrir o endereço isolado e confirmar que o cabeçalho indica v8.7. Instalar pelo menu do Chrome, caso ofereça a opção, e abrir pelo ícone criado. Registar nome do navegador, versão Android, modelo e data.
2. Confirmar abertura em janela autónoma, pesquisa por lagartos, consulta de uma receita, troca de um dia e manutenção da alteração após fechar e reabrir. Usar dados de teste.
3. Em Ajustes, executar Verificar e Testar fotografias; copiar o relatório para análise. As imagens não vistas podem depender da rede.
4. Após carregar a aplicação, ativar modo de avião, fechar e reabrir a app instalada. Verificar plano, receitas e compras, e voltar a ligar a rede. Confirmar se os dados de teste permanecem.
5. Verificar botões, zoom, rotação, leitor de ecrã e comando Voltar. Confirmar que os campos não ficam tapados pelo teclado nem pela navegação do sistema.
6. Para testar uma atualização real, é necessária uma instalação isolada da v8.6 no mesmo endereço de teste, seguida da disponibilização controlada da v8.7 nesse mesmo endereço. Registar dados fictícios antes e comparar depois, incluindo reabertura offline. A execução em Chromium no CI já cobriu este cenário, mas não comprova o comportamento do Samsung.

Não apagar dados da aplicação instalada nem desinstalar a versão pessoal durante o ensaio. Não publicar, fazer merge ou alterar o endereço de produção como parte desta lista.
