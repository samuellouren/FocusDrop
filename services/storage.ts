import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tecnica, Session } from '../types/session';
import { CHAVE_SESSOES,  CHAVE_META_DIARIA} from '../constants/keys';


export async function salvarSessao(duracao: number, tecnica: Tecnica = 'foco'): Promise<Session> {
  const novaSessao: Session = {
    id: Date.now().toString(),
    duration: duracao,
    completedAt: new Date().toISOString(),
    tecnica,
  };

  const existentes = await buscarSessoes();
  const atualizadas = [novaSessao, ...existentes];
  await AsyncStorage.setItem(CHAVE_SESSOES, JSON.stringify(atualizadas));
  return novaSessao;
}

export async function buscarSessoes(): Promise<Session[]> {
  const dados = await AsyncStorage.getItem(CHAVE_SESSOES);
  if (!dados) return [];
  return JSON.parse(dados);
}

export async function buscarMetaMinutos(): Promise<number> {
  const valor = await AsyncStorage.getItem(CHAVE_META_DIARIA);
  return valor ? Number(valor) : 120; // padrão: 2h
}

export async function salvarMetaMinutos(minutos: number): Promise<void> {
  await AsyncStorage.setItem(CHAVE_META_DIARIA, String(minutos));
}

export function minutosHoje(sessoes: Session[]): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return sessoes
    .filter(s => {
      const data = new Date(s.completedAt);
      data.setHours(0, 0, 0, 0);
      return data.getTime() === hoje.getTime();
    })
    .reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
}

export function calcularStreak(sessoes: Session[]): number {
  if (sessoes.length === 0) return 0;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let streak = 0;
  let diaVerificando = new Date(hoje);

  while (true) {
    // verifica se tem alguma sessão nesse dia
    const temSessao = sessoes.some(s => {
      const data = new Date(s.completedAt);
      data.setHours(0, 0, 0, 0);
      return data.getTime() === diaVerificando.getTime();
    });

    if (!temSessao) break;

    streak++;
    diaVerificando.setDate(diaVerificando.getDate() - 1);
  }

  return streak;
}

export function sessoesHoje(sessoes: Session[]): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return sessoes.filter(s => {
    const data = new Date(s.completedAt);
    data.setHours(0, 0, 0, 0);
    return data.getTime() === hoje.getTime();
  }).length;
}