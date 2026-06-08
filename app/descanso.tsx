import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SUGESTOES_RELAXAMENTO, MENSAGENS_MOTIVACIONAIS } from '../constants/relaxamento';
import { notificarDescansoConcluido } from '../services/notifications';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../context/ThemeContext';

export default function TelaDescanso() {
  const { duracaoTrabalho } = useLocalSearchParams<{ duracaoTrabalho?: string }>();

  const [sugestao, setSugestao] = useState(SUGESTOES_RELAXAMENTO[0]);
  const [mensagem, setMensagem] = useState(MENSAGENS_MOTIVACIONAIS[0]);
  const [duracaoSegundos, setDuracaoSegundos] = useState(300);
  const [segundos, setSegundos] = useState(300);
  const [rodando, setRodando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useFocusEffect(
    useCallback(() => {
      const idx = Math.floor(Math.random() * SUGESTOES_RELAXAMENTO.length);
      const s = SUGESTOES_RELAXAMENTO[idx];
      const msgIdx = Math.floor(Math.random() * MENSAGENS_MOTIVACIONAIS.length);

      const trabalhoSeg = duracaoTrabalho ? parseInt(duracaoTrabalho) : 0;
      const d = trabalhoSeg > 0
        ? Math.min(600, Math.max(60, Math.round(trabalhoSeg / 5)))
        : parseInt(s.duracao) * 60;

      setSugestao(s);
      setMensagem(MENSAGENS_MOTIVACIONAIS[msgIdx]);
      setDuracaoSegundos(d);
      setSegundos(d);
      setRodando(false);
      setConcluido(false);
    }, [duracaoTrabalho])
  );

  useEffect(() => {
    if (!rodando) return;
    if (segundos <= 0) {
      setRodando(false);
      setConcluido(true);
      notificarDescansoConcluido().catch(console.error);
      return;
    }
    const interval = setInterval(() => {
      setSegundos(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [rodando, segundos]);

  const mins = Math.floor(segundos / 60);
  const segs = segundos % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  const progresso = 1 - (segundos / duracaoSegundos);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{sugestao.emoji}</Text>
      <Text style={styles.mensagem}>{mensagem}</Text>

      <View style={styles.sugestaoCard}>
        <Text style={styles.sugestaoTitulo}>{sugestao.titulo}</Text>
        <Text style={styles.sugestaoDesc}>{sugestao.descricao}</Text>

        <View style={styles.timerContainer}>
          <View style={styles.timerBarra}>
            <View style={[styles.timerProgresso, { width: `${progresso * 100}%` as any }]} />
          </View>
          <Text style={styles.timerDisplay}>{display}</Text>
        </View>

        {!concluido ? (
          <TouchableOpacity
            style={styles.btnTimer}
            onPress={() => setRodando(r => !r)}
          >
            <Text style={styles.btnTimerTexto}>
              {rodando ? '⏸ Pausar' : segundos < duracaoSegundos ? '▶ Continuar' : '▶ Iniciar descanso'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.concluidoTexto}>✓ Descanso concluído!</Text>
        )}
      </View>

      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.replace('/rotina')}
        >
          <Text style={styles.textoBotao}>Próxima atividade →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botao, styles.botaoSecundario]}
          onPress={() => router.replace('/rotina')}
        >
          <Text style={styles.textoBotaoSecundario}>Voltar para rotina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    container:            { flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
    emoji:                { fontSize: 64, marginBottom: 24 },
    mensagem:             { fontSize: 18, fontWeight: '300', color: t.textPrimary, textAlign: 'center', lineHeight: 28, marginBottom: 40 },
    sugestaoCard:         { backgroundColor: t.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: t.border, width: '100%', marginBottom: 40 },
    sugestaoTitulo:       { fontSize: 18, color: t.textPrimary, marginBottom: 8 },
    sugestaoDesc:         { fontSize: 14, color: t.textMuted, lineHeight: 22, marginBottom: 16 },
    timerContainer:       { marginBottom: 12 },
    timerBarra:           { height: 3, backgroundColor: t.border, borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
    timerProgresso:       { height: 3, backgroundColor: t.textPrimary, borderRadius: 2 },
    timerDisplay:         { fontSize: 28, fontWeight: '200', color: t.textPrimary, textAlign: 'center', letterSpacing: 2 },
    btnTimer:             { alignItems: 'center', paddingVertical: 10, marginTop: 4 },
    btnTimerTexto:        { color: t.textSecondary, fontSize: 14 },
    concluidoTexto:       { color: t.textPrimary, fontSize: 14, textAlign: 'center', marginTop: 8 },
    botoes:               { width: '100%', gap: 12 },
    botao:                { backgroundColor: t.btnPrimaryBg, padding: 16, borderRadius: 12, alignItems: 'center' },
    textoBotao:           { color: t.btnPrimaryText, fontSize: 16 },
    botaoSecundario:      { backgroundColor: 'transparent', borderWidth: 1, borderColor: t.borderAccent },
    textoBotaoSecundario: { color: t.textFaint, fontSize: 16 },
  });
}
