# Ciclos explícitos — v8.10

No Plano, a secção Ciclos de 30 dias permite arquivar o ciclo terminado e iniciar o seguinte numa data escolhida. A ação só fica disponível após os 30 dias atuais, exige confirmação e não aceita sobreposição nem início no passado. Não existem reinícios automáticos.

O arquivo guarda uma cópia independente dos dados anteriores (sem arquivos recursivos), 30 receitas com quantidades e passos congelados, datas, porções, conclusões, consumo, notas, compras marcadas e despesas. A consulta do arquivo não carrega esses dados no plano ativo nem expõe ações de edição. As compras históricas mostram ingredientes planeados e registos antigos; não descontam o stock atual.

O novo ciclo começa com o plano base, sem trocas manuais, porções personalizadas, conclusões, consumo, compras marcadas, despesas ou passos em curso. Stock, metadados, cozinhados e seus históricos, preços, favoritos, peso, preferências e campos desconhecidos mantêm-se. Registos manuais antigos de lotes permanecem como inventário não alocado; não são convertidos em sobras disponíveis. O temporizador em execução é parado só após a gravação bem-sucedida.

A transição guarda primeiro os bytes anteriores em cp-v11-before-cycle e só depois escreve o novo estado. Se faltar espaço ou acesso, o plano anterior e o estado em memória mantêm-se. Não se cria um ciclo sobre dados cuja leitura esteja bloqueada. A exportação normal inclui os arquivos; as importações validam-nos. Estados antigos sem arquivos não recebem o campo automaticamente.

Testes incluem datas e fim de mês/ano, tentativas prematuras, cancelamento, arquivo imutável, preservação dos inventários, ciclos sucessivos, importações e falhas de quota. O navegador testa criação, reabertura e criação offline com comparação exata dos dados fictícios. Não é uma confirmação física no Samsung.
