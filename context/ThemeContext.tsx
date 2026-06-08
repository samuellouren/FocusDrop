import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHAVE_TEMA } from '../constants/keys';

export type Theme = {
  bg: string;
  card: string;
  border: string;
  borderAccent: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  textDimmer: string;
  activeBg: string;
  switchTrackOff: string;
  switchThumbActive: string;
  switchThumbInactive: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  timerTrack: string;
  isDark: boolean;
};

export const DARK: Theme = {
  bg:                  '#0f0f0f',
  card:                '#111111',
  border:              '#1a1a1a',
  borderAccent:        '#222222',
  borderStrong:        '#333333',
  textPrimary:         '#ffffff',
  textSecondary:       '#888888',
  textMuted:           '#555555',
  textFaint:           '#444444',
  textDimmer:          '#333333',
  activeBg:            '#1a1a1a',
  switchTrackOff:      '#1a1a1a',
  switchThumbActive:   '#000000',
  switchThumbInactive: '#333333',
  btnPrimaryBg:        '#ffffff',
  btnPrimaryText:      '#000000',
  timerTrack:          '#1a1a1a',
  isDark:              true,
};

export const LIGHT: Theme = {
  bg:                  '#f2f2f7',
  card:                '#ffffff',
  border:              '#e5e5ea',
  borderAccent:        '#d1d1d6',
  borderStrong:        '#c7c7cc',
  textPrimary:         '#000000',
  textSecondary:       '#636366',
  textMuted:           '#8e8e93',
  textFaint:           '#aeaeb2',
  textDimmer:          '#c7c7cc',
  activeBg:            '#e5e5ea',
  switchTrackOff:      '#e5e5ea',
  switchThumbActive:   '#ffffff',
  switchThumbInactive: '#c7c7cc',
  btnPrimaryBg:        '#000000',
  btnPrimaryText:      '#ffffff',
  timerTrack:          '#e5e5ea',
  isDark:              false,
};

type ThemeContextType = {
  theme: Theme;
  modoEscuro: boolean;
  toggleTema: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: DARK,
  modoEscuro: true,
  toggleTema: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [modoEscuro, setModoEscuro] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TEMA).then(valor => {
      if (valor !== null) setModoEscuro(valor === 'dark');
    });
  }, []);

  const toggleTema = useCallback(async () => {
    const novo = !modoEscuro;
    setModoEscuro(novo);
    await AsyncStorage.setItem(CHAVE_TEMA, novo ? 'dark' : 'light');
  }, [modoEscuro]);

  return (
    <ThemeContext.Provider value={{ theme: modoEscuro ? DARK : LIGHT, modoEscuro, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
