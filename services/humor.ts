import AsyncStorage from '@react-native-async-storage/async-storage';
import { Humor } from '../types/rotina';
import { CHAVE_HUMOR } from '../constants/keys';
import { formatarData } from './rotina';

export const OPCOES_HUMOR = [
  { emoji: '😔', label: 'Difícil' },
  { emoji: '😐', label: 'Neutro' },
  { emoji: '🙂', label: 'Bem' },
  { emoji: '😄', label: 'Ótimo' },
];

export async function buscarHumores(): Promise<Humor[]> {
  const dados = await AsyncStorage.getItem(CHAVE_HUMOR);
  if (!dados) return [];
  return JSON.parse(dados);
}

export async function salvarHumor(emoji: string, label: string): Promise<void> {
  const humores = await buscarHumores();
  const novo: Humor = {
    id: Date.now().toString(),
    emoji,
    label,
    data: formatarData(new Date()),
    criadoEm: new Date().toISOString(),
  };
  await AsyncStorage.setItem(CHAVE_HUMOR, JSON.stringify([novo, ...humores]));
}

export async function humorDeHoje(): Promise<Humor | null> {
  const humores = await buscarHumores();
  const hoje = formatarData(new Date());
  return humores.find(h => h.data === hoje) || null;
}

export async function humoresDaSemana(): Promise<Humor[]> {
  const humores = await buscarHumores();
  const hoje = new Date();
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  inicioSemana.setHours(0, 0, 0, 0);
  return humores.filter(h => new Date(h.criadoEm) >= inicioSemana);
}