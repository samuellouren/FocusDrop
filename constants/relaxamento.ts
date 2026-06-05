export type SugestaoRelaxamento = {
  titulo: string;
  descricao: string;
  duracao: string;
  emoji: string;
};

export const SUGESTOES_RELAXAMENTO: SugestaoRelaxamento[] = [
  { titulo: 'Respiração profunda',  descricao: 'Inspire por 4s, segure por 4s, expire por 4s.',     duracao: '5 min',  emoji: '🌬️' },
  { titulo: 'Meditação guiada',     descricao: 'Feche os olhos e foque apenas na sua respiração.',  duracao: '10 min', emoji: '🧘' },
  { titulo: 'Alongamento leve',     descricao: 'Estique o pescoço, ombros e costas devagar.',       duracao: '5 min',  emoji: '🤸' },
  { titulo: 'Hidratação',           descricao: 'Levante, beba água e dê uma volta curta.',          duracao: '3 min',  emoji: '💧' },
  { titulo: 'Gratidão',             descricao: 'Pense em 3 coisas boas que aconteceram hoje.',      duracao: '3 min',  emoji: '🙏' },
  { titulo: 'Vista o horizonte',    descricao: 'Olhe para longe por alguns minutos. Descanse os olhos.', duracao: '2 min', emoji: '🌅' },
  { titulo: 'Música relaxante',     descricao: 'Ouça uma música calma com os olhos fechados.',      duracao: '5 min',  emoji: '🎵' },
  { titulo: 'Anote seus pensamentos', descricao: 'Escreva o que está na sua cabeça agora.',         duracao: '5 min',  emoji: '📝' },
];

export const MENSAGENS_MOTIVACIONAIS = [
  'Cada passo conta. Você está indo bem! 💪',
  'Consistência é mais poderosa que perfeição.',
  'Você completou mais uma etapa. Orgulhe-se disso.',
  'Descanse com intenção. A próxima atividade te espera.',
  'Pequenas vitórias constroem grandes conquistas.',
  'Seu cérebro precisa de pausa para performar melhor.',
  'Você está construindo hábitos que vão durar.',
  'Foco, pausa, foco. Esse é o ritmo da produtividade.',
];