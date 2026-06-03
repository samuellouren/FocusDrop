import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { buscarSessoes, calcularStreak, sessoesHoje, buscarMetaDiaria, salvarMetaDiaria } from '../services/storage';
import { Session } from '../types/session';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const METAS = [2, 4, 6, 8];

export default function TelaEstatisticas() {
  const [sessoesPorDia, setSessoesPorDia] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [totalSemana, setTotalSemana] = useState(0);
  const [melhorDia, setMelhorDia] = useState(0);
  const [streak, setStreak] = useState(0);
  const [meta, setMeta] = useState(4);
  const [hoje, setHoje] = useState(0);

  useFocusEffect(
    useCallback(() => {
      Promise.all([buscarSessoes(), buscarMetaDiaria()]).then(([sessoes, metaSalva]) => {
        calcularTudo(sessoes, metaSalva);
      });
    }, [])
  );

  function calcularTudo(sessoes: Session[], metaSalva: number) {
    // estatísticas da semana
    const agora = new Date();
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - agora.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const sessoesSemana = sessoes.filter(s =>
      new Date(s.completedAt) >= inicioSemana
    );

    const contagem = [0, 0, 0, 0, 0, 0, 0];
    sessoesSemana.forEach(s => {
      const dia = new Date(s.completedAt).getDay();
      contagem[dia]++;
    });

    setSessoesPorDia(contagem);
    setTotalSemana(sessoesSemana.length);
    setMelhorDia(Math.max(...contagem));
    setStreak(calcularStreak(sessoes));
    setHoje(sessoesHoje(sessoes));
    setMeta(metaSalva);
  }

  async function alterarMeta(novaMeta: number) {
    setMeta(novaMeta);
    await salvarMetaDiaria(novaMeta);
  }

  // progresso da meta de hoje: 0.0 a 1.0
  const progressoMeta = meta > 0 ? Math.min(hoje / meta, 1) : 0;
  const metaConcluida = hoje >= meta;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Estatísticas</Text>

      {/* streak e meta hoje */}
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardValor}>{streak} 🔥</Text>
          <Text style={styles.cardLabel}>dias seguidos</Text>
        </View>
        <View style={[styles.card, metaConcluida && styles.cardDestaque]}>
          <Text style={styles.cardValor}>{hoje}/{meta}</Text>
          <Text style={styles.cardLabel}>meta de hoje</Text>
          {/* barra de progresso da meta */}
          <View style={styles.progressoFundo}>
            <View style={[styles.progressoBarra, { width: `${progressoMeta * 100}%` as any }]} />
          </View>
        </View>
      </View>

      {/* seletor de meta diária */}
      <Text style={styles.secaoTitulo}>Meta diária</Text>
      <View style={styles.metaOpcoes}>
        {METAS.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.metaOpcao, meta === m && styles.metaOpcaoAtiva]}
            onPress={() => alterarMeta(m)}
          >
            <Text style={[styles.metaTexto, meta === m && styles.metaTextoAtivo]}>
              {m}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* gráfico semanal */}
      <Text style={styles.secaoTitulo}>Esta semana</Text>
      {totalSemana > 0 ? (
        <View style={styles.graficoContainer}>
          <BarChart
            data={{ labels: DIAS, datasets: [{ data: sessoesPorDia }] }}
            width={340}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#0f0f0f',
              backgroundGradientFrom: '#0f0f0f',
              backgroundGradientTo: '#0f0f0f',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: () => '#555',
              barPercentage: 0.6,
            }}
            style={{ borderRadius: 12 }}
            showValuesOnTopOfBars
            withInnerLines={false}
          />
        </View>
      ) : (
        <Text style={styles.vazio}>Complete uma sessão para ver o gráfico.</Text>
      )}

      {/* dias ativos */}
      <Text style={styles.secaoTitulo}>Dias ativos</Text>
      <View style={styles.diasContainer}>
        {DIAS.map((dia, index) => (
          <View key={dia} style={styles.diaItem}>
            <View style={[styles.diaCirculo, sessoesPorDia[index] > 0 && styles.diaCirculoAtivo]}>
              <Text style={[styles.diaTexto, sessoesPorDia[index] > 0 && styles.diaTextoAtivo]}>
                {dia}
              </Text>
            </View>
            <Text style={styles.diaContagem}>
              {sessoesPorDia[index] > 0 ? sessoesPorDia[index] : ''}
            </Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0f0f0f', padding: 24, paddingTop: 60 },
  titulo:           { fontSize: 28, fontWeight: '300', color: '#fff', marginBottom: 32 },
  cards:            { flexDirection: 'row', gap: 12, marginBottom: 32 },
  card:             { flex: 1, backgroundColor: '#111', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
  cardDestaque:     { borderColor: '#fff' },
  cardValor:        { fontSize: 28, fontWeight: '200', color: '#fff' },
  cardLabel:        { fontSize: 12, color: '#555', marginTop: 4, marginBottom: 8 },
  progressoFundo:   { width: '100%', height: 3, backgroundColor: '#1a1a1a', borderRadius: 2 },
  progressoBarra:   { height: 3, backgroundColor: '#fff', borderRadius: 2 },
  secaoTitulo:      { fontSize: 11, color: '#555', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  metaOpcoes:       { flexDirection: 'row', gap: 10, marginBottom: 32 },
  metaOpcao:        { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  metaOpcaoAtiva:   { borderColor: '#fff', backgroundColor: '#1a1a1a' },
  metaTexto:        { color: '#444', fontSize: 15 },
  metaTextoAtivo:   { color: '#fff' },
  graficoContainer: { marginBottom: 32, alignItems: 'center' },
  vazio:            { color: '#333', fontSize: 14, textAlign: 'center', marginTop: 20, marginBottom: 32 },
  diasContainer:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  diaItem:          { alignItems: 'center', gap: 6 },
  diaCirculo:       { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  diaCirculoAtivo:  { backgroundColor: '#fff', borderColor: '#fff' },
  diaTexto:         { fontSize: 10, color: '#444' },
  diaTextoAtivo:    { color: '#000' },
  diaContagem:      { fontSize: 11, color: '#555', height: 16 },
});