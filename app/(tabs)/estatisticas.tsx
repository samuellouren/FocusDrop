import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { buscarSessoes, calcularStreak, minutosHoje, buscarMetaMinutos } from '../../services/storage';
import { humoresDaSemana } from '../../services/humor';
import { Session } from '../../types/session';
import { Humor } from '../../types/rotina';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function TelaEstatisticas() {
  const [sessoesPorDia, setSessoesPorDia] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [totalSemana, setTotalSemana] = useState(0);
  const [streak, setStreak] = useState(0);
  const [minutosDeHoje, setMinutosDeHoje] = useState(0);
  const [metaMinutos, setMetaMinutos] = useState(120);
  const [humores, setHumores] = useState<Humor[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([buscarSessoes(), buscarMetaMinutos(), humoresDaSemana()])
        .then(([sessoes, meta, h]) => {
          calcularTudo(sessoes, meta);
          setHumores(h);
        });
    }, [])
  );

  function calcularTudo(sessoes: Session[], meta: number) {
    const agora = new Date();
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - agora.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const sessoesSemana = sessoes.filter(s => new Date(s.completedAt) >= inicioSemana);
    const contagem = [0, 0, 0, 0, 0, 0, 0];
    sessoesSemana.forEach(s => {
      const dia = new Date(s.completedAt).getDay();
      contagem[dia]++;
    });

    setSessoesPorDia(contagem);
    setTotalSemana(sessoesSemana.length);
    setStreak(calcularStreak(sessoes));
    setMinutosDeHoje(minutosHoje(sessoes));
    setMetaMinutos(meta);
  }

  const metaConcluida = minutosDeHoje >= metaMinutos;
  const progressoMeta = metaMinutos > 0 ? Math.min(minutosDeHoje / metaMinutos, 1) : 0;

  function formatarMinutos(minutos: number) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Estatísticas</Text>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardValor}>{streak} 🔥</Text>
          <Text style={styles.cardLabel}>dias seguidos</Text>
        </View>
        <View style={[styles.card, metaConcluida && styles.cardDestaque]}>
          <Text style={styles.cardValor}>{formatarMinutos(minutosDeHoje)}</Text>
          <Text style={styles.cardLabel}>de {formatarMinutos(metaMinutos)} hoje</Text>
          <View style={styles.progressoFundo}>
            <View style={[styles.progressoBarra, { width: `${progressoMeta * 100}%` as any }]} />
          </View>
        </View>
      </View>

      <Text style={styles.secaoTitulo}>Esta semana</Text>
      {totalSemana > 0 ? (
        <View style={styles.graficoContainer}>
          <BarChart
            data={{ labels: DIAS, datasets: [{ data: sessoesPorDia }] }}
            width={340} height={200}
            yAxisLabel="" yAxisSuffix=""
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

      {humores.length > 0 && (
        <>
          <Text style={styles.secaoTitulo}>Humor da semana</Text>
          <View style={styles.humorSemana}>
            {humores.map(h => (
              <View key={h.id} style={styles.humorItem}>
                <Text style={styles.humorEmoji}>{h.emoji}</Text>
                <Text style={styles.humorData}>
                  {new Date(h.criadoEm).toLocaleDateString('pt-BR', { weekday: 'short' })}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
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
  graficoContainer: { marginBottom: 32, alignItems: 'center' },
  vazio:            { color: '#333', fontSize: 14, textAlign: 'center', marginTop: 20, marginBottom: 32 },
  diasContainer:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  diaItem:          { alignItems: 'center', gap: 6 },
  diaCirculo:       { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  diaCirculoAtivo:  { backgroundColor: '#fff', borderColor: '#fff' },
  diaTexto:         { fontSize: 10, color: '#444' },
  diaTextoAtivo:    { color: '#000' },
  diaContagem:      { fontSize: 11, color: '#555', height: 16 },
  humorSemana:      { flexDirection: 'row', gap: 16, marginBottom: 40, flexWrap: 'wrap' },
  humorItem:        { alignItems: 'center', gap: 4 },
  humorEmoji:       { fontSize: 28 },
  humorData:        { fontSize: 11, color: '#555' },
});