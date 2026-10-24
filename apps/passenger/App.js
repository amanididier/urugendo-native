import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const colors = {
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#DCFCE7',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>MURAHO, TRAVELLER</Text>
            <Text style={styles.title}>Where to today?</Text>
          </View>
          <View style={styles.bell}>
            <Text style={styles.bellIcon}>🔔</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.dotGreen} />
            <View style={styles.flex}>
              <Text style={styles.label}>From</Text>
              <Text style={styles.value}>Kigali · Nyabugogo</Text>
            </View>
          </View>

          <View style={styles.swapRow}>
            <View style={styles.line} />
            <View style={styles.swapBtn}>
              <Text style={styles.swapIcon}>⇅</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.dotGray} />
            <View style={styles.flex}>
              <Text style={styles.label}>To</Text>
              <Text style={styles.value}>Musanze</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>📅 Today, 25 Oct</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>👤 1</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.searchBtn} activeOpacity={0.85}>
            <Text style={styles.searchBtnText}>🔍  Search buses</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Popular routes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontal}>
          {[
            { to: 'Musanze', time: '2h', price: '3,500 RWF' },
            { to: 'Huye', time: '3h', price: '4,000 RWF' },
            { to: 'Rubavu', time: '3h', price: '5,000 RWF' },
          ].map((r) => (
            <View key={r.to} style={styles.routeCard}>
              <Text style={styles.routeIcon}>📍</Text>
              <Text style={styles.routeTo}>{r.to}</Text>
              <Text style={styles.routeMeta}>{r.time} · from</Text>
              <Text style={styles.routePrice}>{r.price}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Leaving soon</Text>
        <View style={styles.leavingCard}>
          <View>
            <Text style={styles.leavingTime}>14:30 · Musanze</Text>
            <Text style={styles.leavingAgency}>Volcano Express</Text>
          </View>
          <View style={styles.seatsBadge}>
            <Text style={styles.seatsText}>12 seats</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem icon="🏠" label="Home" active />
        <NavItem icon="🔍" label="Search" />
        <NavItem icon="🎫" label="Tickets" />
        <NavItem icon="👤" label="Profile" />
      </View>
    </SafeAreaView>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <View style={styles.navItem}>
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bellIcon: { fontSize: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  label: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600', color: colors.text },
  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  dotGray: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingLeft: 5,
  },
  line: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginRight: 16,
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapIcon: { fontSize: 16, color: colors.primary },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 16 },
  chip: {
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  horizontal: { marginBottom: 28 },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 130,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeIcon: { fontSize: 20, marginBottom: 8 },
  routeTo: { fontSize: 15, fontWeight: '700', color: colors.text },
  routeMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  routePrice: { fontSize: 14, fontWeight: '700', color: colors.primary, marginTop: 6 },
  leavingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  leavingTime: { fontSize: 15, fontWeight: '700', color: colors.text },
  leavingAgency: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  seatsBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seatsText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  navItem: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  navLabelActive: { color: colors.primary, fontWeight: '700' },
});
