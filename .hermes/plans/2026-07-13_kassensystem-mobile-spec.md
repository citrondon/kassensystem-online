# Kassensystem Mobile — Spezifikation → Implementierungsplan

> **For Hermes:** Verwende gated-two-phase-dev Workflow. Phase 1 abgeschlossen (Analyse). Phase 2 nach User-Approval.

**Goal:** Mobile-App (Expo RN) um fehlende Features aus dem Lastenheft erweitern — Inventar, Historie, Geldschein-Buttons, Mengen-Popup, Kredit im Checkout, Produktfotos, Sprachausgabe, Backup.

**Architecture:** Expo SDK 57, React Native 0.86, expo-sqlite (lokale SQLite DB), React Navigation Bottom Tabs. Alle Daten lokal auf Gerät. Kein Server, kein Internet.

**Tech Stack:** Expo, React Native, expo-sqlite, expo-image-picker, expo-speech, expo-file-system, react-navigation

---

## Priorisierung (Easy → Hard, каждый als eigener Branch + PR)

| # | Feature | Aufwand | Priorität | Branch |
|---|---------|---------|-----------|--------|
| 1 | Mengen-Pop-up im Verkauf | Klein | Hoch | `feat/quantity-popup` |
| 2 | Geldschein-Buttons im Checkout | Klein | Hoch | `feat/cash-buttons` |
| 3 | Inventar-Verwaltung (Seite 3) | Mittel | Hoch | `feat/inventory-screen` |
| 4 | Verkaufs-Historie (Seite 4) | Mittel | Hoch | `feat/order-history` |
| 5 | "Auf Kredit" im Checkout | Klein | Mittel | `feat/credit-checkout` |
| 6 | Produktfotos | Mittel | Mittel | `feat/product-photos` |
| 7 | Sprachausgabe Wechselgeld | Klein | Niedrig | `feat/tts-change` |
| 8 | SD-Karten-Backup | Mittel | Niedrig | `feat/backup` |
| 9 | Barcode/Camera-Scan | Mittel | Niedrig | `feat/barcode-scan` |
| 10 | Bluetooth P2P (APK + Produkt-Share) | Groß | Niedrig | `feat/p2p-sharing` |

---

## Task 1: Mengen-Pop-up im Verkauf

**Ziel:** Klick auf Produkt → Pop-up "Wie viele Einheiten?" (Vorauswahl: 1) → Bestätigen → in Warenkorb.

**Files:**
- Modify: `mobile/src/screens/CashierScreen.tsx`
  - `addToCart()` → `openQtyPopup(product)` statt direkter Cart-Zugabe
  - Neues `<Modal>` für Mengen-Auswahl
  - State: `qtyProduct`, `qtyValue`

**Schritte:**

1. Neuen State hinzufügen: `const [qtyProduct, setQtyProduct] = useState<Product | null>(null); const [qtyValue, setQtyValue] = useState("1");`
2. `addToCart(product)` umbenennen in `openQtyPopup(product)`: setzt `qtyProduct` und `qtyValue="1"`, zeigt Modal
3. Neue Funktion `confirmQty()`: parsed `qtyValue`, fügt Produkt mit Menge in Cart, schliesst Modal
4. Neues Modal im JSX: Produktname, TextInput (numeric, autoFocus), "Bestätigen" Button
5. TouchableOpacity in FlatList ändert `onPress` von `addToCart(item)` → `openQtyPopup(item)`
6. Cart-Zugabe-Logik extrahieren in `addProductToCart(product, qty)` — zentrale Funktion die von `confirmQty` und bestehender Logik genutzt wird

**Verifikation:**
- Produkt-Tap öffnet Pop-up mit "1" vorausgefüllt
- Andere Zahl eingeben → Cart zeigt richtige Menge
- "1" bestätigen → wie vorher, +1

**Commit:** `feat(cashier): add quantity popup on product tap`

---

## Task 2: Geldschein-Buttons im Checkout

**Ziel:** Im Checkout-Modal große Buttons für 100/500/1000/2000/5000/10000 CFA statt numerischer Eingabe. Tap → amount_tendered addiert sich. Zusätzlich "Exakt" Button (setzt = Gesamtbetrag) und "C" Clear.

**Files:**
- Modify: `mobile/src/screens/CashierScreen.tsx`
  - Checkout-Modal: TextInput für `amountTendered` ersetzen durch Button-Grid
  - Neuer State: `tendered` als number (statt string)
  - "Exakt" Button: setzt tendered = grandTotal
  - "C" Button: setzt tendered = 0

**Schritte:**

1. `amountTendered` State von `string` auf `number` ändern: `const [amountTendered, setAmountTendered] = useState(0);`
2. `doCheckout()` anpassen: `tendered` direkt als number verwenden
3. Array von CFA-Werten: `const CFA_DENOMS = [100, 500, 1000, 2000, 5000, 10000];`
4. Button-Grid im Checkout-Modal (3 Spalten, 2 Reihen): jedes zeigt `formatCFA(denom)`, onPress addiert zu `amountTendered`
5. Zusätzliche Buttons: "Exakt" (set = grandTotal), "C" (set = 0)
6. Anzeige: `amountTendered` groß als "Gegeben: X CFA" anzeigen
7. Wechselgeld-Anzeige: `amountTendered - grandTotal` live berechnen
8. Validierung: `amountTendered >= grandTotal` für "Bestätigen"

**Verifikation:**
- 5000 Tippen → "Gegeben: 500 CFA" erscheint
- Nochmal 500 → "Gegeben: 1000 CFA"
- "Exakt" → = Gesamtbetrag
- Wechselgeld wird live angezeigt
- "C" → zurück auf 0

**Commit:** `feat(checkout): add visual CFA banknote buttons`

---

## Task 3: Inventar-Verwaltung (Seite 3)

**Ziel:** Neuer Tab "Lager" mit Produkt-CRUD, Foto, Name, Einheit, EK, VK, Anfangsbestand, Meldebestand, Low-Stock-Warnungen.

**Files:**
- Create: `mobile/src/screens/InventoryScreen.tsx`
- Modify: `mobile/src/db/database.ts` — Schema erweitern: `unit TEXT`, `cost_price INTEGER`, `image_path TEXT`
- Modify: `mobile/src/db/queries.native.ts` — `updateProduct()`, `deleteProduct()`, `getLowStockProducts()`, Product-Interface erweitern
- Modify: `mobile/src/db/queries.ts` — web mock anpassen (falls nötig)
- Modify: `mobile/App.tsx` — Tab hinzufügen: "📦 Lager"

**DB-Schema Migration:**

```sql
ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'Stück';
ALTER TABLE products ADD COLUMN cost_price INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN image_path TEXT;
```

**Schritte:**

1. **DB-Schema erweitern** — `database.ts`: ALTER TABLE statements (mit `IF NOT EXISTS` pattern oder versioned migration). SQLite unterstützt `ALTER TABLE ADD COLUMN` — sichere Migration: `PRAGMA table_info` check.
2. **queries.native.ts erweitern:**
   - `Product` interface: `unit`, `cost_price`, `image_path` hinzufügen
   - `addProduct()` Signatur erweitern: `addProduct(name, price, stock, category, unit, cost_price, low_stock_threshold, image_path)`
   - `updateProduct(id, fields)` — neue Funktion
   - `deleteProduct(id)` — neue Funktion
   - `getLowStockProducts()` — neue Funktion: `WHERE stock <= low_stock_threshold AND stock > 0`
3. **InventoryScreen.tsx erstellen:**
   - FlatList aller Produkte (Name, VK, Stock, Einheit)
   - Low-Stock Badge: rot wenn stock <= threshold
   - "+" Button → ProductFormModal
   - Tap auf Produkt → Edit-Modus
   - Swipe-to-delete oder Mülleimer-Icon
4. **ProductFormModal (inline oder separat):**
   - Name (TextInput)
   - Einheit (Dropdown: Stück, Kilosack, Flasche, Beutel, Kiste)
   - EK (TextInput numeric)
   - VK (TextInput numeric)
   - Anfangsbestand (TextInput numeric)
   - Meldebestand (TextInput numeric, default 5)
   - Foto (Button → expo-image-picker, zeigt Preview)
   - Marge wird auto-berechnet und angezeigt: `((VK - EK) / VK * 100).toFixed(0)%`
5. **App.tsx Tab hinzufügen:** "📦 Lager" → InventoryScreen, zwischen Verkauf und Kunden
6. **CashierScreen anpassen:** `Product` interface nutzt jetzt `unit` — Anzeige ggf. erweitern

**Verifikation:**
- Neuer Tab "Lager" sichtbar
- Produkt anlegen: Name, Einheit, EK 100, VK 150, Stock 20, Meldebestand 5 → gespeichert
- Produkt erscheint in Verkauf
- Stock auf 3 setzen → Low-Stock Badge erscheint
- Produkt editieren → Änderungen gespeichert
- Produkt löschen → verschwindet

**Commit:** `feat(inventory): add product management screen with cost price, unit, low-stock`

---

## Task 4: Verkaufs-Historie (Seite 4)

**Ziel:** Neuer Tab "Historie" mit chronologischer Transaktionsliste + Tagesbilanz mit Reingewinn.

**Files:**
- Create: `mobile/src/screens/HistoryScreen.tsx`
- Modify: `mobile/src/db/queries.native.ts` — `getOrders(limit, offset)`, `getOrderItems(orderId)`, `getDailyProfit(date)`
- Modify: `mobile/App.tsx` — Tab hinzufügen: "📜 Historie"

**queries.native.ts Erweiterung:**

```typescript
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function getOrders(limit: number = 50, offset: number = 0): Promise<Order[]> {
  // SELECT * FROM orders ORDER BY order_date DESC LIMIT ? OFFSET ?
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  // SELECT * FROM order_items WHERE order_id = ?
}

export async function getDailyProfit(date?: string): Promise<{ revenue: number; cost: number; profit: number; orderCount: number }> {
  // SUM(total_amount) as revenue, SUM(line_total - cost) as profit
  // Join order_items with products on product_id to get cost_price
}

export async function getMonthlyStats(month: string): Promise<{ revenue: number; profit: number; orderCount: number }> {
  // Same but WHERE strftime('%Y-%m', order_date) = ?
}
```

**HistoryScreen.tsx:**

1. **Header:** Datum-Selektor (Heute / Gestern / Wähle Datum) — einfach: Toggle Heute/Gestern/Diese Woche
2. **Tagesbilanz-Karte:**
   - Umsatz: `formatCFA(revenue)`
   - Reingewinn: `formatCFA(profit)` (grün)
   - Anzahl Verkäufe: `orderCount`
3. **Transaktionsliste:** FlatList von Orders —每条: Datum/Uhrzeit, Anzahl Artikel, Gesamtbetrag, "Anzeigen" → expandiert Items
4. **Tap auf Order:** expandiert → zeigt einzelne Positionen (Name, Menge, Preis)
5. **Monatsbilanz:** unten oder als Toggle — Umsatz + Profit für aktuellen Monat

**App.tsx Tab:** "📜 Historie" → HistoryScreen

**Verifikation:**
- Verkäufe tätigen → erscheinen in Historie
- Reingewinn korrekt: wenn EK=100, VK=150, 1x verkauft → Profit=50
- Tap auf Order → Items expandieren
- Tages- und Monatsbilanz korrekt

**Commit:** `feat(history): add order history screen with daily/monthly profit`

---

## Task 5: "Auf Kredit" im Checkout

**Ziel:** Im Checkout-Modal ein Button "Auf Kredit". Klick → Kundenauswahl (vorhandene Kunden oder neu anlegen) → Verkauf wird als Debt gebucht statt als bezahlte Order.

**Files:**
- Modify: `mobile/src/screens/CashierScreen.tsx` — Checkout-Modal erweitern
- Modify: `mobile/src/db/queries.native.ts` — `checkoutOnCredit(items, customerId)` neue Funktion

**Schritte:**

1. **queries.native.ts:** `checkoutOnCredit(items, customerId)` — wie `checkout()` aber `payment_method = 'credit'`, zusätzlich Debt-Eintrag erstellen
2. **CashierScreen:** State `showCreditCustomerPicker` boolean
3. **Checkout-Modal:** Button "📒 Auf Kredit" neben "Bestätigen"
4. **Customer-Picker Modal:** FlatList vorhandener Kunden + "Neuer Kunde" Option
5. **On Credit Selected:** `checkoutOnCredit(items, customerId)` aufrufen → Bestätigung "Verkauf auf Kredit gebucht für [Kunde]"
6. **Result Modal:** zeigt Kundenname + Gesamtbetrag als Schuld

**Verifikation:**
- Verkauf auf Kredit → Debt in Kundenbuch erscheint
- Kunde zahlt später → "Beglichen" im Kundenbuch → Debt verschwindet
- Regulärer Verkauf weiterhin möglich

**Commit:** `feat(checkout): add sell-on-credit option with customer picker`

---

## Task 6: Produktfotos

**Ziel:** Produktfoto mit Kamera aufnehmen oder aus Galerie wählen. Foto wird lokal gespeichert (expo-file-system) und in Kacheln + Inventar angezeigt.

**Files:**
- Create: `mobile/src/utils/photo.ts` — Hilfsfunktionen: `takePhoto()`, `pickPhoto()`, `getPhotoUri()`
- Modify: `mobile/src/screens/InventoryScreen.tsx` — Foto-Button im ProductFormModal
- Modify: `mobile/src/screens/CashierScreen.tsx` — Foto in Produktkachel anzeigen
- Install: `expo-image-picker`

**Schritte:**

1. `npx expo install expo-image-picker`
2. **photo.ts:**
   - `takePhoto()`: `ImagePicker.launchCameraAsync({ mediaTypes: Images, allowsEditing: true, aspect: [1,1], quality: 0.7 })`
   - `pickPhoto()`: `ImagePicker.launchImageLibraryAsync(...)` gleiche Optionen
   - Kopiert Foto in app's document directory unter `photos/{timestamp}.jpg`
   - Return: lokaler URI oder null bei Abbruch
3. **InventoryScreen ProductFormModal:** Foto-Button "📷 Foto" + "🖼 Galerie" → zeigt Preview (Image component)
4. **CashierScreen:** `<Image>` in productTile wenn `image_path` vorhanden, sonst Initialen-Placeholder
5. **DB:** `image_path` Spalte bereits in Task 3 hinzugefügt

**Verifikation:**
- Produkt anlegen → Foto aufnehmen → gespeichert
- Verkauf: Kachel zeigt Foto
- Neues Foto → altes wird überschrieben

**Commit:** `feat(photos): add product photo capture and display in cashier tiles`

---

## Task 7: Sprachausgabe Wechselgeld (TTS)

**Ziel:** Nach Checkout: Stimme sagt "Rückgeld: [Betrag] CFA". Optional, Sprache wählbar (Französisch default, Fon/Yoruba falls verfügbar).

**Files:**
- Modify: `mobile/src/screens/CashierScreen.tsx` — `doCheckout()` und `confirmQty` Result Modal
- Install: `expo-speech`

**Schritte:**

1. `npx expo install expo-speech`
2. **CashierScreen:** import `* as Speech from 'expo-speech'`
3. **Nach `doCheckout()` Erfolg:** `Speech.speak(\`Rückgeld: ${formatCFA(change)} Francs CFA\`, { language: 'fr' })`
4. **Setting:** in Onboarding oder Settings-Toggle "Sprachausgabe an/aus" — `getSetting('tts_enabled')`
5. **Sprache:** Default 'fr' (Französisch). Fon/Yoruba evtl. nicht von TTS unterstützt → 'fr' als sicherer Default.

**Verifikation:**
- Checkout → Stimme spricht Rückgeld-Betrag auf Französisch
- Toggle aus → keine Sprachausgabe

**Commit:** `feat(tts): speak change amount after checkout in French`

---

## Task 8: SD-Karten-Backup

**Ziel:** Einmal täglich automatisches Backup der SQLite-DB auf SD-Karte (falls verfügbar) oder internem Speicher. Restore-Funktion beim Onboarding.

**Files:**
- Create: `mobile/src/utils/backup.ts`
- Modify: `mobile/src/context/AuthContext.tsx` — Backup-Check bei App-Start
- Modify: `mobile/src/screens/OnboardingScreen.tsx` — "Backup wiederherstellen" Option
- Install: `expo-file-system`

**Schritte:**

1. `npx expo install expo-file-system`
2. **backup.ts:**
   - `backupDatabase()`: kopiere `pos_offline.db` → `FileSystem.documentDirectory + 'backups/pos_backup_{date}.db'`
   - `getLastBackupDate()`: aus Settings
   - `shouldBackup()`: letzte Backup > 24h her
   - `restoreFromBackup(uri)`: kopiere Backup-Datei → DB-Pfad
   - `listBackups()`: alle Backup-Dateien auflisten
3. **AuthContext:** bei App-Start `if (shouldBackup()) await backupDatabase()`
4. **OnboardingScreen:** wenn Backups existieren → "📦 Backup wiederherstellen" Button → listBackups → auswählen → restore
5. **Settings (neu oder in bestehendem Screen):** "Backup jetzt erstellen" Button

**Verifikation:**
- App öffnen nach 24h → Backup erstellt
- Onboarding auf neuem Gerät → Backup-Option sichtbar wenn Backups da
- Restore → alle Daten zurück

**Commit:** `feat(backup): auto-daily SQLite backup with restore on new device`

---

## Task 9: Barcode/Camera-Scan

**Ziel:** Scan-Button im Verkauf: Barcode scannen → Produkt per Barcode finden → in Warenkorb. Falls Barcode unbekannt → Alert "Produkt nicht gefunden".

**Files:**
- Modify: `mobile/src/db/database.ts` — `barcode TEXT` Spalte zu products
- Modify: `mobile/src/db/queries.native.ts` — `getProductByBarcode(barcode)`
- Modify: `mobile/src/screens/CashierScreen.tsx` — Scan-Button + Camera-Modal
- Modify: `mobile/src/screens/InventoryScreen.tsx` — Barcode-Feld im ProductFormModal
- Install: `expo-camera` oder `expo-barcode-scanner`

**Schritte:**

1. `npx expo install expo-camera`
2. **DB:** `ALTER TABLE products ADD COLUMN barcode TEXT;`
3. **queries:** `getProductByBarcode(barcode)` — `SELECT * FROM products WHERE barcode = ? LIMIT 1`
4. **InventoryScreen:** Barcode-Feld im Form (manuelle Eingabe + "Barcode scannen" Button)
5. **CashierScreen:**
   - Scan-Button oben (neben Suche): "📷 Scan"
   - Camera-Modal mit `expo-camera` Barcode-Scanner
   - Bei Scan-Ergebnis: `getProductByBarcode(code)` → gefunden? → `openQtyPopup(product)` : Alert "Unbekannt: [code] — im Lager anlegen?"
6. **Permission:** Camera-Permission request

**Verifikation:**
- Barcode-Feld im Produktform → speichern
- Scan im Verkauf → Produkt erscheint in Mengen-Pop-up
- Unbekannter Barcode → Alert
- Bereits im Cart → Menge +1

**Commit:** `feat(scan): barcode scanner for product lookup in cashier and inventory`

---

## Task 10: Bluetooth P2P (APK-Share + Produkt-Share)

**Ziel:** "App weitergeben" (APK via QR/Hotspot) + "Produktliste senden/empfangen" (via Bluetooth/Wi-Fi Direct).

**Status:** Komplex. Expo-Begrenzungen für Bluetooth/Wi-Fi Direct. Forschung nötig.

**Ansatz:**

1. **APK-Share ( viral Motor):**
   - Expo kann nicht direkt APK teilen — aber: `expo-sharing` + `FileSystem` kann die installierte APK lokalisieren und über WhatsApp/Bluetooth teilen
   - Alternative: QR-Code mit Download-Link (falls Internet vorhanden) oder lokaler Hotspot + HTTP-Server
   - `expo-network` für Hotspot-Detection, `react-native-qrcode` für QR-Code
   - Einfachster Weg: Share-Sheet (`expo-sharing`) → Benutzer wählt Bluetooth/WhatsApp/Xender
2. **Produktliste-Share:**
   - Export: Produkte als JSON-Datei → `expo-sharing` → Bluetooth
   - Import: Datei empfangen → `expo-document-picker` → JSON parsen → in DB einfügen
   - Format: `[{ name, price, unit, category, barcode }]` — ohne Stock (jeder Händler hat eigenen Stock)

**Files:**
- Create: `mobile/src/screens/ShareScreen.tsx`
- Create: `mobile/src/utils/share.ts`
- Modify: `mobile/App.tsx` — Tab: "📤 Teilen"
- Install: `expo-sharing`, `expo-document-picker`, `expo-network`, `react-native-qrcode-svg` (oder ähnlich)

**Schritte:**

1. `npx expo install expo-sharing expo-document-picker expo-network`
2. **share.ts:**
   - `exportProducts()`: getProducts() → JSON.stringify → Datei speichern → `Sharing.shareAsync()`
   - `importProducts(uri)`: Datei lesen → JSON.parse → `addProduct()` für jedes
   - `shareAppApk()`: APK-Pfad finden → `Sharing.shareAsync()` (Share-Sheet → Bluetooth/Xender)
3. **ShareScreen.tsx:**
   - "📤 App weitergeben" Button → `shareAppApk()`
   - "📋 Produktliste senden" Button → `exportProducts()`
   - "📥 Produktliste empfangen" Button → `DocumentPicker.getDocumentAsync()` → `importProducts(uri)`
4. **App.tsx Tab:** "📤 Teilen"

**Risiken:**
- APK-Pfad kann je nach Gerät/Expo-Build variieren
- EAS Build APK ≠ Expo Go (APK-Sharing braucht Custom Dev Client oder Standalone Build)
- Bluetooth-Dateiübertragung über Share-Sheet hängt vom Gerät ab
- Fon/Yoruba TTS Verfügbarkeit unklar

**Verifikation:**
- Produktliste exportieren → JSON-Datei geteilt
- Auf anderem Gerät importieren → Produkte erscheinen
- APK teilen → Share-Sheet öffnet

**Commit:** `feat(p2p): add app APK sharing and product list import/export`

---

## Offene Fragen (vor Implementierung klären)

1. **Reihenfolge:** Vorschlag oben (1-10, easy→hard). Alternative?
2. **P2P-Priorität:** Bluetooth-Share ist komplex und Expo-begrenzt. Jetzt oder später?
3. **TTS-Sprache:** Französisch als Default OK? Fon/Yoruba wahrscheinlich nicht von TTS unterstützt.
4. **Barcode:** Kann entfallen wenn zu komplex für Phase 1. Alternative: manuelle Barcode-Eingabe im Produktform.
5. **Design-Beibehaltung:** Aktuelles Teal/`#0f766e` Schema beibehalten oder neues Design für neue Screens?
