import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';

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

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [segment, setSegment] = useState('today');

  return (
    <View style={styles.root}>
      <StatusBar style={tab === 'dashboard' ? 'light' : 'dark'} />

      {tab === 'dashboard' && (
        <DashboardScreen segment={segment} setSegment={setSegment} />
      )}
      {tab === 'schedule' && <ScheduleScreen />}
      {tab === 'reports' && <ReportsScreen />}
      {tab === 'profile' && <AgencyProfileScreen />}

      <View style={styles.bottomNav}>
        <NavItem icon="🚌" label="Dashboard" active={tab === 'dashboard'} onPress={() => setTab('dashboard')} />
        <NavItem icon="📅" label="Schedule" active={tab === 'schedule'} onPress={() => setTab('schedule')} />
        <NavItem icon="📄" label="Reports" active={tab === 'reports'} onPress={() => setTab('reports')} />
        <NavItem icon="⚙️" label="Profile" active={tab === 'profile'} onPress={() => setTab('profile')} />
      </View>
    </View>
  );
}

function NavItem({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.navItem, active && styles.navItemActive]} onPress={onPress}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={active ? styles.navLabelActive : styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function DashboardScreen({ segment, setSegment }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <Text style={{ fontSize: 20 }}>🚌</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Agency Dashboard</Text>
                <Text style={styles.headerSub}>Bus operator • Musanze</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statRow}>
            {[
              { v: '0', l: 'Today' },
              { v: 'OK', l: 'Revenue' },
              { v: '0', l: 'Buses' },
              { v: '0', l: 'Routes' },
            ].map((s) => (
              <View key={s.l} style={styles.statBox}>
                <Text style={styles.statValue}>{s.v}</Text>
                <Text style={styles.statLabel}>{s.l}</Text>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.segmentWrap}>
        {['Today', 'Verify', 'Manifest'].map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.segmentBtn, segment === s.toLowerCase() && styles.segmentActive]}
            onPress={() => setSegment(s.toLowerCase())}
          >
            <Text style={[styles.segmentText, segment === s.toLowerCase() && styles.segmentTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {segment === 'today' && (
          <>
            <View style={styles.revenueCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.revenueTitle}>Today's Revenue (Musanze)</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>$</Text>
              </View>
              <Text style={styles.revenueAmount}>0 RWF</Text>
              <Text style={styles.revenueSub}>↗  0 station bookings today</Text>
            </View>
            <View style={styles.twoCol}>
              <View style={styles.miniCard}>
                <View style={[styles.miniIcon, { backgroundColor: '#DCFCE7' }]}><Text>🎫</Text></View>
                <Text style={styles.miniLabel}>Urugendo</Text>
                <Text style={[styles.miniValue, { color: colors.primary }]}>0</Text>
                <Text style={styles.miniSub}>0 RWF digital</Text>
              </View>
              <View style={styles.miniCard}>
                <View style={[styles.miniIcon, { backgroundColor: '#FEF3C7' }]}><Text>🎫</Text></View>
                <Text style={styles.miniLabel}>Paper Tickets</Text>
                <Text style={[styles.miniValue, { color: colors.orange }]}>0</Text>
                <Text style={styles.miniSub}>0 RWF counter</Text>
              </View>
            </View>
            <View style={styles.twoCol}>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>+  Add Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>🔍  Verify Ticket</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {segment === 'verify' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verify ticket</Text>
            <Text style={styles.inputLabel}>BOOKING CODE OR SEAT</Text>
            <TextInput style={styles.input} placeholder="e.g. URG-8K2M or seat 12" placeholderTextColor={colors.muted} />
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]}>
              <Text style={styles.primaryBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        )}
        {segment === 'manifest' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Manifest</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No trips scheduled for today.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ScheduleScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Schedule</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>+ Add new trip</Text>
        </TouchableOpacity>
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No schedules yet</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ReportsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Reports</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue report</Text>
          <Text style={{ color: colors.textSecondary }}>Day / Week / Month filters — same as PWA</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function AgencyProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Profile</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branch: Musanze</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Agent account</Text>
        </View>
        <TouchableOpacity style={[styles.actionBtn, { marginTop: 8 }]}>
          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.headerGreen, paddingHorizontal: 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  segmentWrap: { flexDirection: 'row', marginHorizontal: 16, marginTop: -12, backgroundColor: '#fff', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.border, zIndex: 2 },
  segmentBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: '#fff' },
  revenueCard: { backgroundColor: colors.primary, borderRadius: 20, padding: 20, marginTop: 16, marginBottom: 12 },
  revenueTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  revenueAmount: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 8 },
  revenueSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 8 },
  twoCol: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  miniCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  miniIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  miniLabel: { fontSize: 13, color: colors.textSecondary },
  miniValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  miniSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  actionBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  inputLabel: { fontSize: 11, fontWeight: '600', color: colors.muted, marginBottom: 6, marginTop: 12, letterSpacing: 0.5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pageHeader: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingBottom: 28, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navItemActive: { backgroundColor: colors.primaryLight, borderRadius: 16, marginHorizontal: 2 },
  navLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  navLabelActive: { fontSize: 10, color: colors.primary, fontWeight: '700', marginTop: 2 },
});
