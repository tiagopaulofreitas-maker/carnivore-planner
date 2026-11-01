/* Carnivore Planner v7.6: one cooking guide for all 33 recipes.
   The library and the live cooking view share the same instructions. */
(function(){
'use strict';
const GUIDE=[
/* 00 */{type:'beef',prep:'Seca bem o entrecôte alto e salga de ambos os lados. Deixa o grelhador ou a frigideira aquecer antes de começar.',side:'Faz os três ovos à parte e deixa o queijo curado para juntar no final. Usa a manteiga fora do lume muito forte para não queimar.',finish:'Deixa o entrecôte repousar 3–5 minutos antes de cortar; serve os ovos de imediato.',time:[20,40]},
/* 01 */{type:'beef',prep:'Corta a picanha em bifes grossos, perpendicularmente às fibras. Conserva a capa de gordura e salga antes de cozinhar.',side:'Doura primeiro a gordura da picanha. Bate os ovos e prepara uma omelete macia com o queijo, em lume mais baixo.',finish:'Deixa repousar a picanha e serve em fatias finas, com a omelete acabada de fazer.',time:[25,40]},
/* 02 */{type:'fish',prep:'Seca o salmão com papel. Descarta cabeças/cascas do camarão conforme preferires; seca o miolo para não cozer na própria água.',side:'Cozinha o salmão primeiro e junta o camarão apenas nos últimos minutos. Prepara os ovos em separado.',finish:'Retira o camarão assim que esteja opaco e firme, sem prolongar a cozedura. Finaliza com a manteiga.',time:[20,35]},
/* 03 */{type:'pork',prep:'Retira o excesso de humidade dos secretos e coloca-os abertos, sem sobrepor. Tempera apenas com sal.',side:'Trabalha em pequenas quantidades para que os secretos fiquem dourados em vez de cozidos. Faz os ovos à parte.',finish:'Deixa repousar brevemente antes de cortar; junta o queijo sem o deixar secar.',time:[20,35]},
/* 04 */{type:'beef',prep:'Corta o lombo de novilho em medalhões semelhantes e seca-os bem. Salga só antes de cozinhar.',side:'Para manter o centro suculento, evita lume baixo prolongado. Cozinha os ovos e derrete o queijo num recipiente à parte.',finish:'Descansa os medalhões 3–5 minutos antes de os servir com os ovos.',time:[20,35]},
/* 05 */{type:'mixed',prep:'Seca a cavala e confirma que não há espinhas soltas. Corta o cachaço de porco sem osso em tiras largas de tamanho semelhante e tempera ambos com sal.',side:'Começa pelo porco e cozinha a cavala depois, para a servir acabada de preparar. Junta os ovos no fim.',finish:'Serve a cavala sem a deixar repousar demasiado; confirma a cozedura de ambos os ingredientes.',time:[25,45]},
/* 06 */{type:'minced',prep:'Molda a carne picada em hambúrgueres largos, sem a comprimir em excesso. Usa sal; não precisas de pão ou farinha.',side:'Deixa formar crosta antes de virar. Derrete o queijo sobre os hambúrgueres e prepara os ovos à parte.',finish:'Serve logo que a carne esteja completamente cozinhada no centro, sem a deixar ressecar.',time:[20,35]},
/* 07 */{type:'beef',prep:'Seca a vazia e salga. Prepara uma panela pequena com água para escalfar os ovos.',side:'Enquanto a vazia repousa, escalfa os ovos em água a ferver suavemente. Junta o queijo depois.',finish:'Corta a vazia contra as fibras e serve com os ovos escalfados imediatamente.',time:[25,40]},
/* 08 */{type:'slow',prep:'Prepara a maminha inteira com sal. Confirma no plano a quantidade que vais efetivamente cozinhar e usa uma assadeira com tampa.',side:'Acrescenta um pouco de água ou caldo animal ao fundo para criar vapor. Mantém tapado na maior parte da cozedura.',finish:'Serve a dose do dia. Se preparaste doses futuras, separa-as em caixas rasas e conserva-as com o molho para reaquecer.',time:[170,250]},
/* 09 */{type:'leftover',prep:'Retira apenas a porção de maminha assada para hoje. Se congelada, descongela no frigorífico, não na bancada.',side:'Desfia a maminha com dois garfos e aquece com um pouco do molho reservado. Faz os ovos frescos e junta o queijo no fim.',finish:'Serve a carne quente e suculenta; não voltes a aquecer a porção que fica guardada.',time:[15,25]},
/* 10 */{type:'fish',prep:'Seca o salmão, coloca-o numa travessa sem sobrepor e tempera com sal. Prepara os ovos e o queijo para terminar.',side:'No forno, usa cerca de 190 °C e verifica a partir dos 12 minutos; junta o queijo apenas no fim. Faz os ovos numa frigideira separada.',finish:'Retira o salmão quando estiver cozinhado, mas ainda húmido; evita mantê-lo no forno desligado.',time:[20,35]},
/* 11 */{type:'mixed',prep:'Seca o entrecôte e o camarão separadamente. Salga a carne e limpa o camarão antes de aquecer o equipamento.',side:'Cozinha o entrecôte primeiro; enquanto repousa, salteia ou grelha o camarão rapidamente. Faz os ovos à parte.',finish:'Junta o camarão apenas no momento de servir, para não ficar duro.',time:[25,40]},
/* 12 */{type:'pork',prep:'Seca os lagartos de porco preto; deixa os pedaços alongados para grelhar ou corta em bocados grandes para a frigideira.',side:'Doura sem sobrepor nem mexer constantemente. Prepara os ovos separadamente e junta o queijo no final.',finish:'Deixa repousar alguns minutos antes de servir, para manter a carne suculenta.',time:[20,35]},
/* 13 */{type:'mixed',prep:'Limpa as sardinhas e seca-as sem retirar toda a pele. Seca a alcatra, tempera ambos com sal.',side:'Começa pela alcatra e deixa-a repousar enquanto grelhas ou assas as sardinhas. Faz os ovos à parte.',finish:'Serve as sardinhas acabadas de cozinhar, com cuidado ao retirar as espinhas.',time:[30,45]},
/* 14 */{type:'slow',prep:'Tempera o acém e prepara uma panela grande com tampa. Confirma no plano quantas doses vais efetivamente cozinhar.',side:'Doura o acém antes de juntar caldo animal ou água até cerca de um terço da altura. Mantém tapado em cozedura lenta.',finish:'Quando desfizer com um garfo, serve a dose de hoje. Conserva separadamente apenas as doses futuras que efetivamente preparaste.',time:[190,300]},
/* 15 */{type:'leftover',prep:'Retira uma só porção de acém já cozinhado. Se estiver congelada, passa-a antes pelo frigorífico.',side:'Desfia e reaquece numa panela com o próprio molho, mexendo. Prepara os ovos e o queijo no momento.',finish:'Serve logo, sem deixar o acém a secar no fundo da panela.',time:[15,25]},
/* 16 */{type:'leftover',prep:'Se confirmaste que existe uma porção de acém cozinhado, separa-a e desfia em fibras curtas.',side:'Reaquece o acém com um pouco de molho; cobre com queijo e gratina brevemente, ou derrete o queijo na panela tapada.',finish:'Faz os ovos à parte e serve quando o queijo estiver fundido. Não reaproveites sobras já reaquecidas.',time:[20,30]},
/* 17 */{type:'beef',prep:'Corta a picanha em bifes grossos com a gordura intacta. Reserva o bacon em tiras para dourar separadamente.',side:'Doura primeiro o bacon e escorre um pouco da gordura, se necessário. Grelha a picanha e prepara os ovos em lume médio.',finish:'Deixa a picanha repousar e junta o bacon crocante apenas ao servir.',time:[25,40]},
/* 18 */{type:'mixed',prep:'Seca o atum e os secretos. Separa-os em recipientes diferentes e tempera com sal.',side:'Começa pelos secretos, que demoram mais; cozinha o atum apenas no final para evitar que fique seco. Prepara os ovos à parte.',finish:'Corta os secretos depois de repousarem e serve o atum logo após a cozedura.',time:[25,40]},
/* 19 */{type:'fish',prep:'Seca o salmão e salga. Bate os ovos com o queijo para uma omelete espessa.',side:'Cozinha primeiro o salmão e mantém-no quente por pouco tempo. Faz a omelete em lume médio-baixo para ficar macia.',finish:'Serve o salmão com a omelete acabada de fazer, sem deixar secar nenhum dos dois.',time:[20,35]},
/* 20 */{type:'slow',prep:'Tempera a costela bovina sem osso com sal e coloca numa travessa funda. Confirma no plano a quantidade que vais cozinhar.',side:'Junta um pouco de caldo animal ou água; tapa bem e cozinha lentamente até a carne quase se desfazer.',finish:'Se preparaste uma dose futura, separa-a em recipiente raso e conserva-a adequadamente.',time:[180,300]},
/* 21 */{type:'leftover',prep:'Retira do frigorífico uma única porção da costela previamente cozinhada. Guarda as restantes bem fechadas.',side:'Desfia, junta um pouco de molho e aquece suavemente numa panela tapada. Faz os ovos à parte.',finish:'Envolve o queijo no fim e serve sem secar a carne.',time:[15,30]},
/* 22 */{type:'beef',prep:'Corta a alcatra em tiras grossas e seca-as. Separa os ovos e o queijo para o acabamento.',side:'Doura a alcatra em lume forte, em pequenas porções. Junta o queijo e tapa brevemente para derreter.',finish:'Faz os ovos à parte e serve a carne enquanto ainda está suculenta.',time:[25,40]},
/* 23 */{type:'mixed',prep:'Seca as plumas de porco e prepara as sardinhas limpas. Salga ambos pouco antes de cozinhar.',side:'Grelha primeiro as plumas; aproveita o repouso para preparar as sardinhas e os ovos.',finish:'Serve as sardinhas acabadas de fazer e corta as plumas contra as fibras.',time:[25,45]},
/* 24 */{type:'slow',prep:'Tempera o chambão com sal. Reserva uma panela funda e água ou caldo animal puro.',side:'Doura a carne primeiro e junta o caldo. Mantém um fervilhar muito suave e a panela tapada até o colagénio amaciar.',finish:'Serve parte do caldo com a carne e os ovos. Se guardares sobras, arrefece-as depressa.',time:[210,330]},
/* 25 */{type:'minced',prep:'Molda hambúrgueres com a carne picada e prepara o fígado em tiras finas. Mantém ambos refrigerados até cozinhar.',side:'Cozinha primeiro o hambúrguer completamente; salteia depois o fígado em pequenas quantidades. Faz os ovos separados.',finish:'Adiciona o queijo no final e serve o fígado de imediato, para não perder textura.',time:[25,40]},
/* 26 */{type:'chicken',prep:'Seca muito bem as coxas de frango sem osso, especialmente a pele. Tempera com sal e deixa espaço entre as peças.',side:'Começa com a pele voltada para cima no forno ou air fryer; vira apenas quando necessário para dourar uniformemente.',finish:'Deixa repousar cerca de 5 minutos e serve com ovos e queijo. Não coloques frango cozinhado no prato da carne crua.',time:[35,55]},
/* 27 */{type:'pork',prep:'Seca a barriga de porco e faz cortes superficiais na pele sem atingir a carne. Salga a pele e a parte inferior.',side:'Assa em temperatura moderada até ficar tenra; aumenta o calor apenas no fim, vigiando a pele para dourar.',finish:'Deixa repousar e corta em fatias. Prepara os ovos e o queijo à parte.',time:[90,160]},
/* 28 */{type:'mixed',prep:'Seca o entrecôte e o salmão separadamente e tempera com sal. Prepara duas zonas de calor ou dois momentos de cozedura.',side:'Cozinha primeiro o entrecôte e deixa repousar. Prepara o salmão por último para preservar a humidade.',finish:'Serve os dois enquanto quentes, com os ovos acabados de preparar.',time:[25,40]},
/* 29 */{type:'mixed',prep:'Seca os medalhões de lombo e limpa o camarão. Salga pouco antes de cozinhar.',side:'Cozinha primeiro o lombo e deixa-o repousar; salteia o camarão rapidamente e faz os ovos.',finish:'Adiciona o queijo sem ferver e serve logo para manter o camarão macio.',time:[25,40]},
/* 30 */{type:'pork',prep:'Separa os lagartos de porco preto e seca muito bem. Mantém os pedaços alongados para o grelhador.',side:'Aquece bem o grelhador e coloca os lagartos sem os amontoar. Vira só quando ganharem cor. Faz os ovos separadamente.',finish:'Deixa a carne repousar alguns minutos antes de servir.',time:[20,35]},
/* 31 */{type:'pork',prep:'Corta os lagartos em pedaços grandes e semelhantes; seca-os bem e salga-os. Aquece uma frigideira larga.',side:'Doura em duas ou três levas, sem sobrepor. Só junta a manteiga quando baixares o lume; faz os ovos à parte.',finish:'Retira assim que estiverem cozinhados e dourados, para evitar perder suculência.',time:[20,35]},
/* 32 */{type:'pork',prep:'Corta os lagartos em bocados de tamanho semelhante. Aquece o forno e distribui-os numa travessa sem sobrepor.',side:'Assa a cerca de 190 °C e começa a verificar aos 12–18 minutos, consoante a espessura. Junta o queijo só no fim e faz os ovos separados.',finish:'Deixa repousar brevemente antes de servir, sem os deixar no forno quente.',time:[25,40]}
];
function cookTechnique(type,eq,meal){
 if(type==='slow'){
  if(eq==='panela')return 'Na panela com tampa, mantém um fervilhar baixo com um pouco de água ou caldo animal, verificando a maciez a partir das 3 horas; acrescenta líquido quente se secar.';
  if(eq==='forno')return 'No forno a 145–155 °C, cozinha a peça tapada com um pouco de água ou caldo animal. Verifica após 3 horas; pode precisar de mais tempo até ficar tenra.';
  return 'Para amaciar esta peça de cozedura lenta, começa numa panela tapada ou forno baixo (145–155 °C) durante várias horas. Usa '+eq+' apenas para dourar brevemente no fim.';
 }
 if(type==='leftover'){
  if(eq==='air fryer')return 'Reaquece a dose tapada ou num recipiente adequado à air fryer, com um pouco de molho, sem a secar. Aquece bem até ao centro.';
  if(eq==='forno')return 'Reaquece a porção num recipiente pequeno tapado, a cerca de 160–170 °C, com um pouco de molho; termina só quando estiver quente até ao centro.';
  if(eq==='grelhador')return 'Reaquece primeiro a carne numa panela tapada com um pouco de molho. Se quiseres, passa-a brevemente no grelhador para criar crosta.';
  return 'Reaquece apenas a tua porção na '+(eq==='frigideira'?'frigideira':'panela')+' com tampa e um pouco do molho, mexendo para não secar.';
 }
 if(type==='chicken'){
  if(eq==='air fryer')return 'Na air fryer a cerca de 190 °C, dispõe o frango sem sobrepor. Começa a verificar por volta dos 25 minutos e ajusta à espessura.';
  if(eq==='forno')return 'No forno a 200 °C, assa o frango com espaço entre as peças e verifica a partir dos 30 minutos.';
  if(eq==='panela')return 'Na panela larga, doura as peças de frango e termina tapado em lume moderado, virando, até estarem completamente cozinhadas.';
  return 'No '+eq+', cozinha em lume médio, virando para dourar sem queimar a pele, até ficar bem cozinhado por dentro.';
 }
 if(type==='minced'){
  if(eq==='air fryer')return 'Na air fryer a 190 °C, coloca os hambúrgueres sem sobrepor e começa a verificar após 10–15 minutos, ajustando à espessura.';
  if(eq==='forno')return 'No forno a 200 °C, coloca os hambúrgueres num tabuleiro e verifica a partir dos 15 minutos, ajustando à espessura.';
  if(eq==='grelhador')return 'No grelhador bem quente, doura os dois lados dos hambúrgueres e termina em calor moderado para cozinhar bem o centro.';
  return 'Na '+(eq==='panela'?'panela larga':'frigideira')+', deixa ganhar crosta de ambos os lados e termina em lume médio para cozinhar o centro.';
 }
 if(eq==='grelhador')return 'No grelhador pré-aquecido, doura os pedaços sem os amontoar. Vira quando ganharem crosta; adapta o tempo à espessura.';
 if(eq==='frigideira')return 'Na frigideira pesada bem quente, sela a carne ou o peixe em pequenas quantidades. Reduz o lume se o exterior dourar demasiado depressa.';
 if(eq==='air fryer')return 'Na air fryer a 180–190 °C, dispõe os pedaços numa só camada. Começa a verificar após 8–12 minutos para peixe e 10–15 minutos para carne, ajustando à espessura.';
 if(eq==='forno')return 'No forno a cerca de 190 °C, dispõe os pedaços sem sobrepor e começa a verificar após 12–20 minutos, conforme a espessura.';
 return 'Numa panela larga de fundo pesado, doura primeiro em lume médio-alto e termina tapado em lume mais suave, conforme a espessura.';
}
function safety(type,meal){
 const ingredients=Object.keys(meal.items||{});
 if(type==='leftover')return 'Segurança: reaquece as sobras a 74 °C no centro; aquece só a porção que vais comer e guarda o restante refrigerado.';
 if(type==='chicken')return 'Segurança: o frango deve atingir 74 °C no centro. Evita contaminação entre a carne crua e o prato pronto.';
 if(type==='minced')return 'Segurança: a carne picada deve atingir 71 °C. Se incluíres fígado bovino, cozinha-o bem (referência 71 °C).';
 if(type==='fish'||type==='mixed'&&ingredients.some(x=>['salmao','sardinha','cavala','atum','camarao'].includes(x)))
  return 'Segurança: peixe e marisco devem atingir 63 °C; os camarões ficam opacos. Para peças inteiras de carne, considera 63 °C e 3 minutos de repouso.';
 if(type==='pork')return 'Segurança: para cortes inteiros de porco, utiliza como referência 63 °C no centro e repouso de 3 minutos.';
 if(type==='slow')return 'Segurança: as porções para os próximos dias devem ir para recipientes baixos e ser refrigeradas até 2 horas após a confeção; usa em 3–4 dias ou congela.';
 return 'Segurança: para cortes inteiros de bovino, a referência é 63 °C no centro e 3 minutos de repouso. Ajusta a confeção à espessura.';
}
function stepsFor(meal,index,equipment){
 const id=Number.isInteger(index)&&index>=0&&index<GUIDE.length?index:-1;
 const g=GUIDE[id]||{type:meal.method==='leftover'?'leftover':'beef',prep:'Seca e prepara os ingredientes, temperando com sal.',side:'Cozinha cada componente separadamente para respeitar os tempos diferentes.',finish:'Deixa repousar e serve imediatamente.'};
 const equip=equipment|| (typeof recommendedEquipment==='function'?recommendedEquipment(meal):'frigideira');
 let main=cookTechnique(g.type,equip,meal);
 if(id===10&&equip==='forno')main='Coloca o salmão numa travessa, com a pele voltada para baixo, e assa a cerca de 190 °C. Verifica a cozedura a partir dos 12 minutos para não o deixar seco.';
 if(id===24&&equip==='panela')main='Depois de dourares o chambão, tapa e mantém o caldo num fervilhar muito suave durante 3h30–5h, até o colagénio amaciar e a carne se soltar facilmente.';
 if(id===27&&equip==='forno')main='No forno a 160–170 °C, assa a barriga até ficar tenra (pode demorar 1h30–2h30). Aumenta para 220 °C apenas no final, vigiando a pele para ficar crocante.';
 let side=g.side;
 if(id===10&&equip==='forno')side='Acrescenta o queijo só nos últimos instantes, se quiseres gratinar. Cozinha os ovos numa frigideira à parte.';
 if(id===24&&equip==='panela')side='Mantém caldo suficiente para não secar; acrescenta água quente aos poucos e verifica a maciez, sem ferver agressivamente.';
 const prep=g.type==='leftover'?'Confirma que tens uma porção já cozinhada e bem conservada. O plano e o stock não confirmam a sua disponibilidade. '+g.prep:g.prep;
 return [prep,main,side,g.finish,safety(g.type,meal)];
}
window.cpGuideSteps=stepsFor;
window.cpGuideTime=(meal,index)=>{
 const g=GUIDE[index];return g&&g.time?g.time:null;
};
window.cpGuideTip=(meal,index)=>{
 const g=GUIDE[index];if(!g)return '';
 if(g.type==='slow')return 'Prepara com antecedência apenas a quantidade que confirmares; reserva doses futuras só se as cozinhares.';
 if(g.type==='leftover')return 'Só usa esta receita se confirmares que tens carne já cozinhada e bem conservada; o plano não comprova sobras disponíveis.';
 if(g.type==='mixed')return 'Cozinha primeiro o ingrediente que demora mais e deixa o peixe ou camarão para o fim.';
 return 'Seca bem os ingredientes e evita amontoar a carne para conseguir uma boa crosta.';
};
if(typeof detailedSteps==='function'){
 detailedSteps=function(day){
  const meal=mealAt(day);
  return stepsFor(meal,chosen(day),typeof methodForDay==='function'?methodForDay(day):null);
 };
}
// Existing open recipe or cook screens also get the improved guide.
requestAnimationFrame(()=>{
 try{
  if(typeof state!=='undefined'&&['recipe','cook'].includes(state.currentTab)&&typeof render2==='function')render2();
 }catch(error){console.warn('Não foi possível atualizar os passos da receita:',error)}
});
})();