# Cozinhados e sobras — v8.9

Registo explícito de alimentos efetivamente cozinhados e pesados. Na ficha de um dia, indicar peso total em gramas, data da preparação e local de conservação. Uma nova preparação cria um lote independente; não altera compras, stock de ingredientes, porções planeadas ou conclusões.

O nome e os ingredientes-base da receita são guardados como referência imutável. O peso registado é de alimento cozinhado; não é uma conversão do peso cru. Alterações posteriores ao prato do plano não modificam o lote.

Na ficha e no Plano pode consultar-se o saldo e o histórico de cada lote. Cada saída requer peso, motivo (consumo, descarte ou correção) e confirmação. Não se permite saldo negativo. Lotes esgotados mantêm-se no histórico. Não se apagam registos nem se aplicam saídas automaticamente ao concluir receitas.

O registo não comprova conservação adequada nem presume que uma receita futura de sobras tem alimento disponível. Não há substituição automática de ingredientes crus por cozinhados nas compras: têm unidades e rendimentos diferentes. Não misturar os dois inventários sem uma futura alocação explícita.

Persistência opcional em cookedLots na mesma chave cp-v11. Dados antigos sem o campo não são alterados para o acrescentar ao abrir. Importações validam estrutura, datas, pesos, motivos, IDs duplicados e saldo. Uma falha de gravação mantém o estado anterior. IDs de operação protegem contra repetição da mesma confirmação; uma nova preparação intencional é um lote novo.

Testes: operações puras, preservação de ingredientes de origem, saldo, duplicados, importação, quota e reabertura; fluxo móvel de cancelamento, registo, saída e persistência; conjunto de regressão offline e atualização com dados fictícios. Não equivale a teste físico no Samsung.
