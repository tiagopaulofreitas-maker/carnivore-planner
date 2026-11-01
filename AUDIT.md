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

## v7.8 — stock por local e datas opcionais
- O ecrã `Stock em casa` permite registar o local de conservação (frigorífico, congelador ou despensa) e uma data opcional de referência por ingrediente, guardados em `state.stockMeta` sem substituir `state.stock`.
- Os campos só aparecem quando existe quantidade positiva; apagar a quantidade remove os metadados associados. Incluído filtro `Mostrar apenas o que tenho em casa`.
- São apresentados avisos para datas passadas ou nos próximos três dias. **Uma data de referência não substitui a verificação de segurança alimentar**, e os ingredientes continuam a contar no inventário até o utilizador os corrigir.
- Na vista semanal, um aviso pode abrir o stock com um toque; a cópia de compras é agrupada por talho, peixaria e outros produtos.
- Foram adicionados cenários de teste de navegação móvel para gravação de local, data e filtro. Sem confirmação de execução completa em dispositivo nesta sessão.

## v8.2 — sequência v7.9–v8.2
- Fotografias ilustrativas: thumbnails na biblioteca/calendário, imagem maior nos detalhes e no jantar. Módulo recipe-media.js com fallback visual e créditos de autores em IMAGE_CREDITS.md. Fotos vistas em cache limitada, as não visitadas podem não existir offline.
- Hoje e modo Cozinhar: atalho direto Cozinhar agora, Ver receita, lista de sábado, próximos três jantares, progresso e vista compacta opcional.
- Planeamento inteligente: modos usar stock, pouco tempo, gastar menos e variar, com rankings por quantidades, datas, preços e tempo. Trocas exigem confirmação; os modos nunca editam sozinhos.
- Compras: lista associável a Modelo, Madeira Cash ou Ambos, sem alegar comparação de preços. Marcas compradas podem ser adicionadas ao stock mediante confirmação; ingredientes consumidos podem ser descontados depois da refeição, também com confirmação e controlo contra repetição.
- Dados: mantida a chave localStorage cp-v11; sem migração ou limpeza. A cache PWA inclui os novos módulos e imagens externas anteriormente visitadas.
- Testes: media-flow.mjs, plan-intelligence.mjs e smoke.mjs foram alargados e integrados no GitHub Actions.
- Verificação: sintaxe, referências e testes lógicos; não houve confirmação de testes gráficos no Samsung nem de resultado de execução Chromium pelo GitHub Actions.

## v8.3 — correções e diagnósticos no telemóvel
- Corrigida a substituição de uma refeição já concluída através da biblioteca: a nova escolha não herda indevidamente o estado de «feita». O passo guiado desse dia é reposto.
- O modo «Gastar menos» ordena agora pelo **custo dos ingredientes que ainda faltam comprar**, e mostra custo total e custo adicional separadamente. «Pouco tempo» prioriza a duração estimada.
- Um ingrediente com data de referência ultrapassada não é presumido utilizável pelas sugestões: é sinalizado para revisão, sem apagar stock nem declarar automaticamente o alimento impróprio.
- Novo painel «Diagnóstico da aplicação» em Ajustes, com 10 verificações técnicas e relatório copiável sem quantidades, preços, receitas selecionadas ou dados de conta. Verifica a presença e coerência dos módulos, não todos os cliques nem a disponibilidade das fotos remotas.
- Testes atualizados de recomendações, ausência de mutações de estado, privacidade dos relatórios e interface Android. Os testes lógicos do diagnóstico foram executados com dados fictícios (10/10); não houve ensaio visual físico num Samsung nem confirmação do resultado do GitHub Actions.

## v8.4 — substituição da designação Duroc
- A receita e lista de compras passam a referir Cachaço de porco sem osso (porco normal), um corte identificável no talho, em vez da designação de raça «Duroc».
- Preço de referência alterado de 9,00 €/kg para 7,49 €/kg, baseado numa listagem de retalho de Portugal continental; pode variar na Madeira e continua ajustável em Ajustes.
- O identificador interno `duroc` mantém-se para preservar preços personalizados, stock e dados antigos em `cp-v11`.
- Instruções culinárias ajustadas. Testes de regressão adicionados para 30 pratos, 26 ingredientes, referência de preço, nomes e persistência. Verificação de código 14/14 passou; a execução completa do navegador Android permanece por confirmar.
