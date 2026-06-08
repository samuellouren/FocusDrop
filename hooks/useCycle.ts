import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Tecnica, Ciclo } from '../types/session';
import { salvarSessao } from '../services/storage';
import { notificarSessaoCompleta, notificarPausaConcluida } from '../services/notifications';
import {
  iniciarNotificacaoPersistente,
  atualizarNotificacaoPersistente,
  cancelarNotificacaoPersistente,
} from '../services/background';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export type ConfigCiclo = {
  tecnica: Tecnica;
  minutosFoco: number;
  minutosParao: number;
  horasFoco?: number;
  horasParusa?: number;
  segundosFoco?: number;
  segundosPausa?: number;
};

export const TECNICAS: Record<Tecnica, ConfigCiclo> = {
  'pomodoro': { tecnica: 'pomodoro', minutosFoco: 25, minutosParao: 5,  horasFoco: 0, horasParusa: 0, segundosFoco: 0, segundosPausa: 0 },
  'foco':     { tecnica: 'foco',     minutosFoco: 25, minutosParao: 0,  horasFoco: 0, horasParusa: 0, segundosFoco: 0, segundosPausa: 0 },
};

export function useCycle(config: ConfigCiclo) {
  const totalSegundosFoco  = ((config.horasFoco   || 0) * 3600) + (config.minutosFoco  * 60) + (config.segundosFoco  || 0);
  const totalSegundosPausa = ((config.horasParusa || 0) * 3600) + (config.minutosParao * 60) + (config.segundosPausa || 0);

  const [cicloAtual, setCicloAtual]   = useState<Ciclo>('foco');
  const [seconds, setSeconds]         = useState(totalSegundosFoco);
  const [isRunning, setIsRunning]     = useState(false);
  const [numeroCiclo, setNumeroCiclo] = useState(1);
  const notificacaoIdRef              = useRef<string | null>(null);

  useEffect(() => {
    setIsRunning(false);
    setCicloAtual('foco');
    setSeconds(totalSegundosFoco);
    setNumeroCiclo(1);
    cancelarNotificacaoPersistente().catch(console.error);
    notificacaoIdRef.current = null;
  }, [config.tecnica, config.minutosFoco, config.minutosParao, config.horasFoco, config.horasParusa, config.segundosFoco, config.segundosPausa]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          cancelarNotificacaoPersistente().catch(console.error);
          notificacaoIdRef.current = null;
          handleCicloCompleto();
          return 0;
        }
        if (prev % 5 === 0 && notificacaoIdRef.current) {
          atualizarNotificacaoPersistente(notificacaoIdRef.current, prev - 1, cicloAtual)
            .catch(console.error);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, cicloAtual]);

  useEffect(() => {
    if (seconds === 0 && !isRunning) {
      const timeout = setTimeout(() => {
        if (config.tecnica === 'pomodoro') {
          const proximoCiclo: Ciclo = cicloAtual === 'foco' ? 'pausa' : 'foco';
          setCicloAtual(proximoCiclo);
          setSeconds(proximoCiclo === 'foco' ? totalSegundosFoco : totalSegundosPausa);
        } else {
          setCicloAtual('foco');
          setSeconds(totalSegundosFoco);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [seconds, isRunning]);

  function handleCicloCompleto() {
    if (Platform.OS !== 'web') deactivateKeepAwake();
    if (cicloAtual === 'foco') {
      salvarSessao(totalSegundosFoco, config.tecnica).catch(console.error);
      notificarSessaoCompleta(totalSegundosFoco).catch(console.error);
      setNumeroCiclo(n => n + 1);
    } else {
      notificarPausaConcluida().catch(console.error);
    }
  }

  const start = async () => {
    setIsRunning(true);
    if (Platform.OS !== 'web') await activateKeepAwakeAsync();
    const id = await iniciarNotificacaoPersistente(seconds, cicloAtual);
    notificacaoIdRef.current = id;
  };

  const pause = async () => {
    setIsRunning(false);
    if (Platform.OS !== 'web') deactivateKeepAwake();
    await cancelarNotificacaoPersistente();
    notificacaoIdRef.current = null;
  };

  const reset = async () => {
    setIsRunning(false);
    setCicloAtual('foco');
    setSeconds(totalSegundosFoco);
    setNumeroCiclo(1);
    if (Platform.OS !== 'web') deactivateKeepAwake();
    await cancelarNotificacaoPersistente();
    notificacaoIdRef.current = null;
  };

  return { seconds, isRunning, cicloAtual, numeroCiclo, start, pause, reset };
}