const fmt = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0});

const QUESTIONS = [
  {id:"budget", t:"Seus ganhos cobrem seus gastos no mês?", o:[["falta","Não, falta dinheiro"],["raspa","Fecha raspando"],["sobra","Sim, e ainda sobra"]]},
  {id:"debt", t:"Você tem dívida com juros altos, como cartão rotativo ou cheque especial?", o:[["sim","Sim"],["naosei","Não tenho certeza"],["nao","Não"]]},
  {id:"reserve", t:"Quanto você tem guardado para emergências?", o:[["0","Nada"],["1","Menos de 3 meses de gastos"],["3","3 meses de gastos ou mais"]]},
  {id:"goal", t:"Para quando você pode precisar desse dinheiro?", o:[["curto","Em menos de 1 ano"],["medio","Entre 1 e 5 anos"],["longo","Daqui a mais de 5 anos"]]},
  {id:"exp", t:"Você já investiu antes?", o:[["nunca","Nunca"],["pouco","Só poupança"],["sim","Sim, invisto com frequência"]]}
];

const STAGES = [
  {name:"Organizar o básico", sub:"Saber para onde o dinheiro vai"},
  {name:"Sair das dívidas caras", sub:"Cartão e cheque especial primeiro"},
  {name:"Criar a reserva de emergência", sub:"3 a 6 meses de gastos essenciais"},
  {name:"Fazer o dinheiro render", sub:"Investir de acordo com o prazo"}
];

const CONTENT = [
  {lead:"Antes de qualquer investimento, o primeiro passo é enxergar suas entradas e saídas.",
   steps:["Anote tudo que entra e tudo que sai neste mês, mesmo os gastos pequenos.","Separe o que é essencial (moradia, comida, transporte) do que pode esperar.","Escolha um gasto para cortar ou reduzir ainda este mês."]},
  {lead:"Juros de cartão e cheque especial crescem mais rápido do que qualquer rendimento. Quitar essas dívidas é o melhor “investimento” agora.",
   steps:["Liste cada dívida com valor, taxa de juros e vencimento. Se não souber a taxa, pergunte ao banco.","Comece pela dívida com a maior taxa e pague o mínimo nas outras.","Procure renegociar: muitas vezes dá para trocar uma dívida cara por outra mais barata."]},
  {lead:"Sua dívida não é o problema agora. O que falta é uma proteção para imprevistos, para você não precisar se endividar de novo.",
   steps:["Calcule seus gastos essenciais de um mês e multiplique por 3. Essa é sua primeira meta.","Guarde um valor fixo assim que o dinheiro entrar, antes de gastar com outras coisas.","Deixe a reserva em um lugar seguro e com saque rápido, sem risco de perder valor."]},
  {lead:"Você já tem a base. Agora o que importa é combinar o investimento com o prazo do seu objetivo.",
   steps:null}
];

const GOAL_STEPS = {
  curto:["Seu prazo é curto: priorize segurança e acesso rápido ao dinheiro, mesmo que renda menos.","Evite produtos que oscilam, porque você pode precisar resgatar justamente quando estiverem em baixa.","Compare as opções de renda fixa com liquidez diária e veja o que cobram de taxa."],
  medio:["Com prazo médio, dá para olhar renda fixa com vencimento próximo da data que você precisa do dinheiro.","Veja se o vencimento do produto bate com o seu objetivo, para não precisar resgatar antes.","Compare taxas e o imposto de cada opção antes de decidir."],
  longo:["Com prazo longo, você pode aceitar mais oscilação em parte do dinheiro em troca de maior potencial.","Diversifique: não coloque tudo em um único tipo de investimento.","Invista todo mês, de forma constante, em vez de tentar acertar o melhor momento."]
};

const LESSONS = [
  ["O que são juros compostos?","São juros que rendem sobre os juros anteriores. Por isso, quanto mais tempo o dinheiro fica, mais rápido ele cresce. O mesmo vale para as dívidas, só que ao contrário."],
  ["O que é inflação?","É a alta geral dos preços. Se o seu dinheiro rende menos do que a inflação, ele compra menos coisas no futuro, mesmo que o saldo pareça crescer."],
  ["Risco e retorno","Em geral, quem busca ganhar mais precisa aceitar a chance de perder ou de ver o valor oscilar. Não existe investimento sem algum tipo de trade-off."],
  ["O que é liquidez?","É a facilidade de transformar o investimento em dinheiro. Liquidez diária significa poder sacar a qualquer momento. Quanto mais fácil o saque, menos costuma render."]
];


const TRAIL = [...LESSONS,
  ["Orçamento: para onde vai seu dinheiro","Anotar entradas e saídas por um mês já mostra onde estão os vazamentos. O objetivo não é cortar tudo, e sim decidir com consciência."],
  ["Reserva de emergência","Dinheiro separado para imprevistos, como perder o emprego ou ter um problema de saúde. A meta comum é de 3 a 6 meses de gastos essenciais, em um lugar seguro e de saque rápido."],
  ["Por que o cartão de crédito sai caro","No rotativo, os juros são cobrados todo mês sobre o saldo que sobrou, inclusive sobre juros anteriores. Pagar só o mínimo faz a dívida crescer muito rápido."],
  ["Renda fixa e renda variável","Na renda fixa, a regra de rendimento é conhecida de antemão. Na variável, como ações, o resultado não é previsível e o valor oscila. Cada uma serve a objetivos e prazos diferentes."],
  ["Diversificar","Distribuir o dinheiro em vários tipos de investimento reduz o impacto de um deles ir mal. Não elimina o risco, mas evita que tudo dependa de uma única aposta."],
  ["Golpes e cuidados","Desconfie de ganho garantido e alto, e de pressa para decidir. Nunca passe senhas ou códigos, nem para quem diz ser do banco."]
];
