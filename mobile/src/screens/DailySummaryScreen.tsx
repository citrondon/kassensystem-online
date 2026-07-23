import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { getDailyStats, DailyStats } from "../db/queries";
import { formatCFA } from "../utils/format";

export default function DailySummaryScreen() {
  const [stats, setStats] = useState<DailyStats>({
    totalRevenue: 0,
    orderCount: 0,
    totalChange: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const s = await getDailyStats();
    setStats(s);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }

  const avgSale = stats.orderCount > 0 ? stats.totalRevenue / stats.orderCount : 0;
  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>Heute</Text>
        <Text style={styles.dateText}>{today}</Text>
      </View>

      <View style={styles.bigCard}>
        <Text style={styles.bigLabel}>Tagesumsatz</Text>
        <Text style={styles.bigValue}>{formatCFA(stats.totalRevenue)}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>Verkäufe</Text>
          <Text style={styles.smallValue}>{stats.orderCount}</Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.smallLabel}>Ø pro Verkauf</Text>
          <Text style={styles.smallValue}>{formatCFA(Math.round(avgSale))}</Text>
        </View>
      </View>

      <View style={styles.smallCard}>
        <Text style={styles.smallLabel}>Wechselgeld ausgegeben</Text>
        <Text style={styles.smallValue}>{formatCFA(stats.totalChange)}</Text>
      </View>

      {stats.orderCount === 0 && (
        <Text style={styles.emptyHint}>
          Noch keine Verkäufe heute. Starte in "Verkauf"!
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  dateHeader: {
    padding: 16,
    alignItems: "center",
  },
  dateLabel: { fontSize: 14, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1 },
  dateText: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginTop: 4 },
  bigCard: {
    backgroundColor: "#0f766e",
    margin: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  bigLabel: { fontSize: 16, color: "#ccfbf1", marginBottom: 8 },
  bigValue: { fontSize: 36, fontWeight: "bold", color: "#fff" },
  row: { flexDirection: "row", paddingHorizontal: 16, gap: 12 },
  smallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
  },
  smallLabel: { fontSize: 14, color: "#6b7280", marginBottom: 4 },
  smallValue: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  emptyHint: {
    textAlign: "center",
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 32,
    marginBottom: 32,
  },
});
