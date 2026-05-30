import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '../types/session';
import { CHAVE_SESSOES } from '../constants/keys';


export async function salvarSessao(duracao:number): Promise<Session> {
    const novaSessao: Session = {
        id: Date.now().toString(),
        duration: duracao,
        completedAt: new Date().toISOString(),
    };

    const existentes = await buscarSessoes();
    const atualizadas = [novaSessao, ...existentes]
    await AsyncStorage.setItem(CHAVE_SESSOES, JSON.stringify(atualizadas));

    return novaSessao;
}

export async function buscarSessoes(): Promise<Session[]> {
  const dados = await AsyncStorage.getItem(CHAVE_SESSOES);
  if (!dados) return [];
  return JSON.parse(dados);
}