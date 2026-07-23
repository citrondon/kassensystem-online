import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import {
  getCustomers,
  addCustomer,
  getDebts,
  addDebt,
  settleDebt,
  Customer,
  Debt,
} from "../db/queries";
import { formatCFA, formatShortDate } from "../utils/format";

export default function CustomerBookScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtNote, setDebtNote] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [c, d] = await Promise.all([getCustomers(), getDebts(true)]);
    setCustomers(c);
    setDebts(d);
  }

  async function handleAddCustomer() {
    if (!newName.trim()) {
      Alert.alert("Fehler", "Name fehlt.");
      return;
    }
    await addCustomer(newName.trim(), newPhone.trim() || undefined);
    setNewName("");
    setNewPhone("");
    setShowAddCustomer(false);
    await loadData();
  }

  async function handleAddDebt() {
    if (!selectedCustomer) return;
    const amount = parseInt(debtAmount, 10);
    if (!amount || amount <= 0) {
      Alert.alert("Fehler", "Betrag ungültig.");
      return;
    }
    await addDebt(selectedCustomer.id, amount, debtNote.trim() || undefined);
    setDebtAmount("");
    setDebtNote("");
    setShowAddDebt(false);
    setSelectedCustomer(null);
    await loadData();
  }

  async function handleSettle(debtId: number) {
    Alert.alert(
      "Schuld beglichen?",
      "Als bezahlt markieren?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Ja, beglichen",
          onPress: async () => {
            await settleDebt(debtId);
            await loadData();
          },
        },
      ]
    );
  }

  const totalDebt = debts.reduce((s, d) => s + d.amount, 0);

  return (
    <View style={styles.container}>
      {/* Übersicht */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Offene Schulden: {formatCFA(totalDebt)}
        </Text>
        <Text style={styles.summarySub}>
          {debts.length} Eintrag{debts.length !== 1 ? "e" : ""} • {customers.length} Kunde{customers.length !== 1 ? "n" : ""}
        </Text>
      </View>

      {/* Kundenliste */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kunden</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddCustomer(true)}
        >
          <Text style={styles.addBtnText}>+ Kunde</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={customers}
        keyExtractor={(item) => item.id.toString()}
        style={styles.customerList}
        renderItem={({ item }) => (
          <View style={styles.customerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{item.name}</Text>
              {item.phone && <Text style={styles.customerPhone}>{item.phone}</Text>}
            </View>
            <Text
              style={[
                styles.customerBalance,
                { color: item.balance > 0 ? "#dc2626" : "#059669" },
              ]}
            >
              {formatCFA(item.balance)}
            </Text>
            <TouchableOpacity
              style={styles.debtBtn}
              onPress={() => {
                setSelectedCustomer(item);
                setShowAddDebt(true);
              }}
            >
              <Text style={styles.debtBtnText}>+ Schuld</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Offene Schulden */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Offene Schulden</Text>
      </View>

      <FlatList
        data={debts}
        keyExtractor={(item) => item.id.toString()}
        style={styles.debtList}
        renderItem={({ item }) => (
          <View style={styles.debtRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.debtCustomer}>{item.customer_name}</Text>
              <Text style={styles.debtDate}>{formatShortDate(item.created_at)}</Text>
              {item.note && <Text style={styles.debtNote}>{item.note}</Text>}
            </View>
            <Text style={styles.debtAmount}>{formatCFA(item.amount)}</Text>
            <TouchableOpacity
              style={styles.settleBtn}
              onPress={() => handleSettle(item.id)}
            >
              <Text style={styles.settleBtnText}>✓ Beglichen</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Add Customer Modal */}
      <Modal visible={showAddCustomer} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Neuer Kunde</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Name"
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Telefon (optional)"
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowAddCustomer(false)}
              >
                <Text style={styles.modalCancelText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddCustomer}>
                <Text style={styles.modalConfirmText}>Speichern</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Debt Modal */}
      <Modal visible={showAddDebt} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Schuld: {selectedCustomer?.name}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Betrag (CFA)"
              keyboardType="numeric"
              value={debtAmount}
              onChangeText={setDebtAmount}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Notiz (optional)"
              value={debtNote}
              onChangeText={setDebtNote}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowAddDebt(false)}
              >
                <Text style={styles.modalCancelText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleAddDebt}>
                <Text style={styles.modalConfirmText}>Eintragen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  summary: {
    backgroundColor: "#0f766e",
    padding: 16,
    alignItems: "center",
  },
  summaryText: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  summarySub: { fontSize: 14, color: "#ccfbf1", marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  addBtn: {
    backgroundColor: "#0f766e",
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 12,
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  customerList: { maxHeight: 200 },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  customerName: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  customerPhone: { fontSize: 13, color: "#9ca3af", marginTop: 2 },
  customerBalance: { fontSize: 16, fontWeight: "bold", marginRight: 12 },
  debtBtn: {
    backgroundColor: "#fef3c7",
    borderRadius: 6,
    padding: 6,
    paddingHorizontal: 10,
  },
  debtBtnText: { fontSize: 13, color: "#92400e", fontWeight: "600" },
  debtList: { flex: 1 },
  debtRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  debtCustomer: { fontSize: 16, fontWeight: "600", color: "#1f2937" },
  debtDate: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  debtNote: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  debtAmount: { fontSize: 18, fontWeight: "bold", color: "#dc2626", marginRight: 12 },
  settleBtn: {
    backgroundColor: "#d1fae5",
    borderRadius: 6,
    padding: 8,
    paddingHorizontal: 12,
  },
  settleBtnText: { fontSize: 13, color: "#065f46", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 380,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    marginBottom: 12,
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  modalCancelText: { fontSize: 16, color: "#6b7280" },
  modalConfirm: {
    flex: 1,
    backgroundColor: "#0f766e",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  modalConfirmText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
