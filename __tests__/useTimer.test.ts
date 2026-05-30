import { renderHook, act } from '@testing-library/react-native';
import { useTimer } from '../hooks/useTimer';

// mock do storage para não depender do AsyncStorage nos testes
jest.mock('../services/storage', () => ({
  salvarSessao: jest.fn().mockResolvedValue({}),
}));

describe('useTimer', () => {

  // teste 1: valor inicial
  it('deve iniciar com os segundos corretos', () => {
    const { result } = renderHook(() => useTimer(60));
    // renderHook: roda o hook fora de um componente, só para testar
    
    expect(result.current.seconds).toBe(60);
    expect(result.current.isRunning).toBe(false);
  });

  // teste 2: start e pause
  it('deve mudar isRunning ao iniciar e pausar', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);

    act(() => result.current.pause());
    expect(result.current.isRunning).toBe(false);
  });

  // teste 3: reset
  it('deve voltar ao valor inicial ao resetar', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => result.current.start());
    act(() => result.current.reset());

    expect(result.current.seconds).toBe(60);
    expect(result.current.isRunning).toBe(false);
  });

});