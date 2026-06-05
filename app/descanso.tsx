import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SUGESTOES_RELAXAMENTO, MENSAGENS_MOTIVACIONAIS } from '../constants/relaxamento';

export default function TelaDescanso() {
  const [sugestao] = useState(() => {
    const idx = Math.floor(Math.random() * SUGESTOES_RELAXAMENTO.length);
    return SUGESTOES_RELAXAMENTO[idx];
  });

  const [mensagem] = useState(() => {
    const idx = Math.floor(Math.random() * MENSAGENS_MOTIVACIONAIS.length);
    return MENSAGENS_MOTIVACIONAIS[idx];
  });

  // converte "5 min" → 300 segundos
  const duracaoSegundos = parseInt(sugestao.duracao) * 60;

  const [segundos, setSegundos] = useState(duracaoSegundos);
  const [rodando, setRodando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  useEffect(() => {
    if (!rodando) return;
    if (segundos <= 0) {
      setRodando(false);
      setConcluido(true);
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

        {/* timer de descanso */}
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

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji:              { fontSize: 64, marginBottom: 24 },
  mensagem:           { fontSize: 18, fontWeight: '300', color: '#fff', textAlign: 'center', lineHeight: 28, marginBottom: 40 },
  sugestaoCard:       { backgroundColor: '#111', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#1a1a1a', width: '100%', marginBottom: 40 },
  sugestaoTitulo:     { fontSize: 18, color: '#fff', marginBottom: 8 },
  sugestaoDesc:       { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 16 },
  timerContainer:     { marginBottom: 12 },
  timerBarra:         { height: 3, backgroundColor: '#1a1a1a', borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
  timerProgresso:     { height: 3, backgroundColor: '#fff', borderRadius: 2 },
  timerDisplay:       { fontSize: 28, fontWeight: '200', color: '#fff', textAlign: 'center', letterSpacing: 2 },
  btnTimer:           { alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  btnTimerTexto:      { color: '#888', fontSize: 14 },
  concluidoTexto:     { color: '#fff', fontSize: 14, textAlign: 'center', marginTop: 8 },
  botoes:             { width: '100%', gap: 12 },
  botao:              { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  textoBotao:         { color: '#000', fontSize: 16 },
  botaoSecundario:    { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#222' },
  textoBotaoSecundario: { color: '#444', fontSize: 16 },
});