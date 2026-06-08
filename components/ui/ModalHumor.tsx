import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { humorDeHoje, salvarHumor, OPCOES_HUMOR } from '../../services/humor';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../context/ThemeContext';

export function ModalHumor() {
  const [visivel, setVisivel] = useState(false);
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  useEffect(() => {
    verificarHumor();
  }, []);

  async function verificarHumor() {
    const hoje = await humorDeHoje();
    if (!hoje) setVisivel(true);
  }

  async function handleSelecionar(emoji: string, label: string) {
    setSelecionado(emoji);
    await salvarHumor(emoji, label);
    setTimeout(() => setVisivel(false), 800);
  }

  return (
    <Modal visible={visivel} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.titulo}>Como você está hoje?</Text>
          <Text style={styles.subtitulo}>Registre seu humor para acompanhar seu bem-estar</Text>

          <View style={styles.opcoes}>
            {OPCOES_HUMOR.map(opcao => (
              <TouchableOpacity
                key={opcao.emoji}
                style={[styles.opcao, selecionado === opcao.emoji && styles.opcaoSelecionada]}
                onPress={() => handleSelecionar(opcao.emoji, opcao.label)}
              >
                <Text style={styles.emoji}>{opcao.emoji}</Text>
                <Text style={styles.label}>{opcao.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btnPular} onPress={() => setVisivel(false)}>
            <Text style={styles.btnPularTexto}>Pular por hoje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    card:             { backgroundColor: t.card, borderRadius: 20, padding: 28, width: '100%', borderWidth: 1, borderColor: t.border },
    titulo:           { fontSize: 22, fontWeight: '300', color: t.textPrimary, textAlign: 'center', marginBottom: 8 },
    subtitulo:        { fontSize: 13, color: t.textMuted, textAlign: 'center', marginBottom: 32, lineHeight: 20 },
    opcoes:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    opcao:            { alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: t.border, flex: 1, marginHorizontal: 4 },
    opcaoSelecionada: { borderColor: t.textPrimary, backgroundColor: t.activeBg },
    emoji:            { fontSize: 28, marginBottom: 6 },
    label:            { fontSize: 11, color: t.textMuted },
    btnPular:         { alignItems: 'center', padding: 12 },
    btnPularTexto:    { color: t.textDimmer, fontSize: 13 },
  });
}
