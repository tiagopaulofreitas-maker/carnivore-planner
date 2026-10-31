# Carnivore Planner — audit técnico (31/10/2026)

## Correções efetuadas
- Separador **Receitas**: evento de clique tratado ao nível do documento, antes das funções de navegação antigas. Abre a biblioteca com pesquisa, filtros, favoritos e escolha do dia. Se a biblioteca falhar, apresenta um erro visível em vez de manter o ecrã anterior sem explicação.
- Removido do carregamento o controlador `library-nav.js` que competia com a navegação. O histórico de commits mantém o ficheiro para análise, mas não é executado na PWA.
- **Orçamento**: `total()` utiliza exclusivamente os 30 pratos do calendário e as suas substituições, não a totalidade das receitas da biblioteca.
- **Pesquisa**: considera nomes dos ingredientes e ignora acentos (ex.: `salmao` encontra `Salmão`).
- **Importação de backups**: normaliza estruturas de dados em falta e apresenta o interface atual, em vez de chamar `draw()` legado. O registo de peso e a limpeza de compras também deixam de chamar a vista antiga.
- **Service worker**: o registo volta a ter o mesmo número de build que os ficheiros offline.
- Mantida a chave de armazenamento `cp-v11`, sem reinstalação nem limpeza de dados.

## Verificações efetuadas por análise estática
- 30 refeições de base e 26 produtos registados.
- Nenhum ingrediente ou quantidade inválida nas 30 refeições de base.
- Orçamento-base de referência: 366,67 € em matérias-primas, sujeito aos preços alterados pelo utilizador.
- Scripts JS verificados sintaticamente; versões e referências de ficheiros cotejadas.
- A disposição dos cinco equipamentos fica isolada em `selector.js`, preservada.

## Testes automatizados disponíveis
- `tests/smoke.mjs`: cinco separadores, biblioteca, pesquisa de lagartos, favoritos, seleção de prato, equipamento, acesso à biblioteca a partir do modo Cozinhar, persistência de dados, orçamento dos 30 dias e overflow.
- `.github/workflows/ui-audit.yml`: configuração para correr os testes em Chromium móvel no GitHub Actions ao publicar alterações.

**Limite importante:** verificação sintática e estática não equivale a confirmar que os testes de navegador passaram. O resultado de execução de GitHub Actions não ficou acessível nesta sessão; a validação visual no Samsung ainda é necessária.

## Dívida técnica identificada
- `app.js` mantém múltiplas versões de renderização (`render2`) acumuladas. Para reduzir regressões futuras deve ser dividido em estado, receitas, compras, navegação e interface, com testes antes da substituição.
- A escala de porções da receita não deve ser interpretada automaticamente como alteração da lista de compras sem uma decisão funcional explícita.
- Notificações autónomas requerem suporte adicional; os lembretes via calendário continuam a alternativa atual.

## Atualização v7.3 — reparação da biblioteca
- O erro visível na v7.2 confirmou que o `libUI()` legado falhava durante a construção da biblioteca. A biblioteca anterior deixou de ser utilizada.
- Novo `recipe-library.js` cria autonomamente os filtros, pesquisa, cartões, favoritos, pré-visualização sem modificar o calendário e escolha da refeição.
- A navegação para Receitas é intercetada antes das ações antigas. O `render2()` de biblioteca apresenta apenas um estado de carregamento até o módulo independente desenhar o ecrã.
- O novo módulo é precacheado pela PWA; o botão de atualização confirma a existência do ficheiro antes de recarregar.
- O teste de navegador foi atualizado para os novos seletores. Continua a faltar confirmação da execução efetiva do Chromium no GitHub Actions e do resultado no Samsung.

## v7.5 — consulta completa sem alterar o plano
- `recipe-library.js` agora apresenta duração aproximada, custo, método recomendado, lista de ingredientes e passos de confeção durante `Ver receita`, sem modificar o calendário.
- A biblioteca permite ordenar por ordem original, nome, preço crescente ou duração aproximada. O campo do dia continua reservado à ação explícita `Adicionar ao plano`.
- Ajustadas recomendações do equipamento para lagartos de porco preto (grelhador/frigideira/forno conforme a variante), pratos de forno e sardinhas.
- Testes de navegador preparados para validar pré-visualização e ordenação, mas **a execução em Chromium não está confirmada** nesta sessão.

## v7.6 — instruções culinárias partilhadas
- Novo `cooking-guide.js`, com guias específicos para as 30 refeições do calendário-base e três variantes adicionais de lagartos de porco preto.
- Para cada receita existem cinco passos coerentes: preparação, técnica adaptada ao equipamento, componentes adicionais, finalização e segurança alimentar.
- A biblioteca e o Modo Cozinhar passam a consultar o mesmo guia; a barra de progresso e o botão «Concluir» foram sincronizados com a contagem real.
- Tempos aproximados específicos por prato aparecem tanto na biblioteca como nos detalhes do dia. Técnicas pouco adequadas para estufados indicam explicitamente a necessidade de panela/forno para amaciar a carne.
- Testes determinísticos `tests/cooking-guide.mjs` cobrem 33 receitas × 5 métodos, integridade dos passos, segurança e ficheiros offline. Configurados no workflow.
- Verificações lógicas e sintáticas locais efetuadas; não equivale a uma execução completa do website no Samsung nem a testes de navegador confirmados.

## v7.7 — gestão semanal de compras e stock
- Adicionados `shopping-math.js` e `shopping-stock.js` para substituir a apresentação antiga das compras com uma vista independente.
- Quantidades por semana calculadas a partir dos 30 dias do calendário e de quaisquer receitas substituídas. Ovos são contados por unidade, restantes ingredientes em gramas.
- A vista **Lista de compras** separa valor bruto, valor já coberto pelo inventário e custo estimado do que falta comprar; a lista exclui produtos totalmente cobertos.
- A vista **Stock em casa** permite consultar e atualizar os 26 ingredientes, com pesquisa por nome.
- O stock atual só pode ser reservado uma vez, começando pela semana atual. Sem aplicar stock de hoje retroativamente a semanas passadas, nem pressupor que compras futuras foram realizadas.
- Marcar compras feitas não modifica automaticamente o inventário; para manter a fiabilidade, as quantidades reais são registadas na vista Stock.
- Copiar a lista exclui produtos já assinalados. Mantido o registo de despesas e a chave de dados `cp-v11`.
- Adicionados testes determinísticos `tests/shopping-math.mjs`, cobrindo stock, unidades, troca de pratos, semanas futuras, histórico e preços; integrados no GitHub Actions. O teste móvel `tests/smoke.mjs` passou a incluir navegação de compras e edição de inventário.
- Verificação lógica do cálculo efetuada para oito casos de referência. Sem confirmação nesta sessão de execução completa dos testes em Chromium/Android.
