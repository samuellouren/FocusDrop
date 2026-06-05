import AsyncStorage from '@react-native-async-storage/async-storage';
import { Atividade } from '../types/rotina';

const CHAVE_ATIVIDADES = 'atividades';


export async function aplicarModelosNoDia(data: string): Promise<void> {
  const todas = await buscarAtividades();
  const modelos = todas.filter(a => a.ehModelo);
  const jaExistem = todas.filter(a => a.data === data);

  if (jaExistem.length > 0) return;
  if (modelos.length === 0) return;

  const novas = modelos.map((m, i) => ({
    ...m,
    id: `${Date.now()}_${i}`,
    concluida: false,
    data,
    ehModelo: false,
  }));

  const atualizadas = [...todas, ...novas];
  await AsyncStorage.setItem(CHAVE_ATIVIDADES, JSON.stringify(atualizadas));
}

export type Humor = {
  id: string;
  emoji: string;
  label: string;
  data: string; // YYYY-MM-DD
  criadoEm: string;
};

// retorna todas as atividades
export async function buscarAtividades(): Promise<Atividade[]> {
  const dados = await AsyncStorage.getItem(CHAVE_ATIVIDADES);
  if (!dados) return [];
  return JSON.parse(dados);
}

// retorna atividades de uma data específica ordenadas
export async function buscarAtividadesDoDia(data: string): Promise<Atividade[]> {
  const todas = await buscarAtividades();
  return todas
    .filter(a => a.data === data)
    .sort((a, b) => a.ordem - b.ordem);
}

// salva uma nova atividade
export async function salvarAtividade(atividade: Atividade): Promise<void> {
  const todas = await buscarAtividades();
  const atualizadas = [...todas, atividade];
  await AsyncStorage.setItem(CHAVE_ATIVIDADES, JSON.stringify(atualizadas));
}

// atualiza uma atividade existente
export async function atualizarAtividade(id: string, dados: Partial<Atividade>): Promise<void> {
  const todas = await buscarAtividades();
  const atualizadas = todas.map(a => a.id === id ? { ...a, ...dados } : a);
  await AsyncStorage.setItem(CHAVE_ATIVIDADES, JSON.stringify(atualizadas));
}

// deleta uma atividade
export async function deletarAtividade(id: string): Promise<void> {
  const todas = await buscarAtividades();
  const atualizadas = todas.filter(a => a.id !== id);
  await AsyncStorage.setItem(CHAVE_ATIVIDADES, JSON.stringify(atualizadas));
}

// formata Date para YYYY-MM-DD
export function formatarData(data: Date): string {
  return data.toISOString().split('T')[0];
}

// retorna os dias da semana atual
export function diasDaSemana(): { data: string; label: string; diaSemana: string }[] {
  const hoje = new Date();
  const dias = [];
  const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  for (let i = 0; i < 7; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - hoje.getDay() + i);
    dias.push({
      data: formatarData(data),
      label: String(data.getDate()).padStart(2, '0'),
      diaSemana: nomesDias[data.getDay()],
    });
  }

  

  return dias;
}