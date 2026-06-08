import { useState, useEffect } from 'react';
import { salvarSessao } from '../services/storage';
import { notificarSessaoCompleta } from '../services/notifications';

export function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);
  

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          salvarSessao(initialSeconds)
            .catch(err => console.error('erro ao salvar:', err));
          notificarSessaoCompleta(initialSeconds)
            .catch(err => console.error('erro na notificação:', err));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
  if (seconds === 0 && !isRunning) {
    const timeout = setTimeout(() => {
      setSeconds(initialSeconds);
    }, 2000);

    return () => clearTimeout(timeout);
  }
}, [seconds, isRunning]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = () => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  };

  return { seconds, isRunning, start, pause, reset };
}