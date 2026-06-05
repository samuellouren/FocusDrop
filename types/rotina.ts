import { Tecnica } from './session';

export type Atividade = {
  id: string;
  titulo: string;
  descricao?: string;
  temTimer: boolean;
  duracao?: number;
  tecnica?: Tecnica;
  concluida: boolean;
  data: string;
  ordem: number;
  ehModelo?: boolean;
  etapas?: Etapa[];
};
export type Humor = {
  id: string;
  emoji: string;
  label: string;
  data: string; // YYYY-MM-DD
  criadoEm: string;
};
export type Etapa = {
  id: string;
  titulo: string;
  temTimer: boolean;
  duracao?: number;
  concluida: boolean;
  ordem: number;
};