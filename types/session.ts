export type Tecnica = 'pomodoro' | 'foco';

export type Session = {
  id: string;
  duration: number;
  completedAt: string;
  tecnica: Tecnica;
};

export type Ciclo = 'foco' | 'pausa';

export type Estatisticas = {
  streak: number;
  metaMinutosDiarios: number;
  minutosHoje: number;
};