import AsyncStorage from '@react-native-async-storage/async-storage';
import { salvarSessao, buscarSessoes } from '../services/storage';

// mock do AsyncStorage — não queremos tocar no disco durante testes
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('storage', () => {

  beforeEach(async () => {
    await AsyncStorage.clear();
    // limpa o storage antes de cada teste para não vazar dados entre eles
  });

  // teste 1: salvar e buscar
  it('deve salvar e retornar a sessão', async () => {
    await salvarSessao(25 * 60);
    const sessoes = await buscarSessoes();

    expect(sessoes).toHaveLength(1);
    expect(sessoes[0].duration).toBe(25 * 60);
  });

  // teste 2: múltiplas sessões
  it('deve acumular sessões sem perder as anteriores', async () => {
    await salvarSessao(25 * 60);
    await salvarSessao(5 * 60);
    const sessoes = await buscarSessoes();

    expect(sessoes).toHaveLength(2);
  });

  // teste 3: lista vazia
  it('deve retornar array vazio se não houver sessões', async () => {
    const sessoes = await buscarSessoes();
    expect(sessoes).toEqual([]);
  });

});