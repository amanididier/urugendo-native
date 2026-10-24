import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

// Colors taken from live PWA (urugendo-v0.vercel.app/home)
const colors = {
  primary: '#16A34A',
  primaryLight: '#DCFCE7',
  headerGreen: '#22C55E',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  muted: '#94A3B8',
  border: '#E2E8F0',
  orange: '#F59E0B',
  lightGreenBtn: '#A7F3D0',
};

const { width } = Dimensions.get('window');

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoBus}>🚌</Text>
              </View>
              <Text style={styles.logoText}>
                Urugendo<Text style={styles.logoDot}>.</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.bellBtn}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>Muraho 👋</Text>
          <Text style={styles.title}>Where to today?</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchCard}>
          <TouchableOpacity style={styles.fieldRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.placeholder}>From (e.g. Kigali)</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dashedLine} />
            <TouchableOpacity style={styles.swapBtn}>
              <Text style={styles.swapIcon}>⇄</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.fieldRow}>
            <View style={[styles.dot, { backgroundColor: colors.orange }]} />
            <Text style={styles.placeholder}>To (e.g. Musanze)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>Use my current location</Text>
          </TouchableOpacity>

          <View style={styles.solidLine} />

          <View style={styles.metaRow}>
            <View style={styles.dateChip}>
              <Text style={styles.dateIcon}>🕐</Text>
              <Text style={styles.dateText}>Oct 25, 2026</Text>
            </View>
            <View style={styles.passengerRow}>
              <TouchableOpacity style={styles.stepperBtn}>
                <Text style={styles.stepperText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.passengerCount}>1</Text>
              <TouchableOpacity style={styles.stepperBtn}>
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85}>
            <Text style={styles.searchBtnText}>🔍  Search Buses</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.chipText}>📍 6 Cities</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.chipText, { color: '#B45309' }]}>🏢 2 Agencies</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.chipText, { color: '#1D4ED8' }]}>🕐 24/7</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.greenBar} />
            <Text style={styles.sectionTitle}>Popular Routes</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { from: 'Kigali', to: 'Nyanza', price: '1,800 RWF', duration: '1h 45m' },
            { from: 'Kigali', to: 'Huye', price: '2,500 RWF', duration: '2h 15m' },
            { from: 'Kigali', to: 'Musanze', price: '3,500 RWF', duration: '2h' },
          ].map((r) => (
            <TouchableOpacity key={r.to} style={styles.routeCard} activeOpacity={0.85}>
              <View style={styles.routeTop}>
                <View style={styles.routeIconWrap}>
                  <Text>📍</Text>
                </View>
                <Text style={styles.routeName}>
                  {r.from} → {r.to}
                </Text>
              </View>
              <Text style={styles.routePrice}>{r.price}</Text>
              <Text style={styles.routeDuration}>{r.duration}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.footer}>Made with 💚 for Rwanda's travellers</Text>
      </ScrollView>

      <View style={styles.bottomNav}>
        <View style={[styles.navItem, styles.navItemActive]}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🎫</Text>
          <Text style={styles.navLabel}>Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.headerGreen,
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBus: { fontSize: 18 },
  logoText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  logoDot: { color: '#fff' },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 18 },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  scroll: { flex: 1, marginTop: -36 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  placeholder: { fontSize: 15, color: colors.muted, flex: 1 },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  swapIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  locationIcon: { fontSize: 14 },
  locationText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  solidLine: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dateIcon: { fontSize: 14 },
  dateText: { fontSize: 14, fontWeight: '500', color: colors.text },
  passengerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: { fontSize: 18, color: colors.text, fontWeight: '600' },
  passengerCount: { fontSize: 16, fontWeight: '600', color: colors.text, minWidth: 16, textAlign: 'center' },
  searchBtn: {
    backgroundColor: colors.lightGreenBtn,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greenBar: {
    width: 4,
    height: 18,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.primary },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: width * 0.42,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  routeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeName: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1 },
  routePrice: { fontSize: 18, fontWeight: '800', color: colors.primary },
  routeDuration: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
    marginTop: 28,
    marginBottom: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingBottom: 28,
    paddingHorizontal: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  navItemActive: {
    backgroundColor: colors.primaryLight,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  navIcon: { fontSize: 22 },
  navIconActive: { fontSize: 22 },
  navLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  navLabelActive: { fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 2 },
});
