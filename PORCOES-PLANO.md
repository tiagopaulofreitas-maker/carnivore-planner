# Porções do plano — v8.8

Cada dia tem por omissão uma porção completa da receita base. Na ficha de um dia do plano é possível escolher de 1 a 6 porções, mediante confirmação. Não são recomendações nutricionais nem quantidades de sobras já cozinhadas.

A alteração atualiza os ingredientes planeados, o custo previsto, as compras, as reservas de stock das semanas futuras e os lotes. O modo Cozinhar e a confirmação de consumo usam essas quantidades. Selecionar porções não marca refeições como concluídas, não desconta stock nem cria ciclos.

A escala de consulta 0,5×/1×/2× continua a usar a receita base, independentemente das porções no plano. O cartão de porções mostra separadamente os ingredientes previstos para o dia. Os tempos não se multiplicam: usar equipamento com capacidade adequada ou cozinhar em várias levas.

Não se podem editar porções de dias passados, de refeições concluídas, com consumo registado ou com passos de confeção já avançados. Os marcadores e registos anteriores permanecem intactos. A biblioteca em modo de consulta não apresenta o editor do plano.

As porções são guardadas por dia em planPortions, apenas quando forem explicitamente definidas. Dados antigos sem esse campo mantêm uma porção e não recebem o campo automaticamente ao abrir. Importações validam dias 0–29 e contagens inteiras 1–6. A origem e a chave de armazenamento cp-v11 permanecem as mesmas.

Os testes de porções verificam independência da consulta, ovos inteiros no plano, lotes entre semanas, reservas de compras, bloqueios históricos e consumo único mediante confirmação. O teste móvel verifica cancelamento, gravação, reabertura e bloqueio após conclusão. Os testes de atualização usam dados fictícios e não constituem prova de preservação exata dos dados pessoais num Samsung físico.
