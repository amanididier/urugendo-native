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
};

export default function App() {
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [segment, setSegment] = useState('today');
  const [managerTab, setManagerTab] = useState('home');

  if (!role) {
    return <AgencyLoginScreen onAgentLogin={() => setRole('agent')} onManagerLogin={() => setRole('manager')} />;
  }

  if (role === 'manager') {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        {managerTab === 'home' && <ManagerHomeScreen />}
        {managerTab === 'branches' && <ManagerBranchesScreen />}
        {managerTab === 'profile' && (
          <ManagerProfileScreen onLogout={() => { setRole(null); setManagerTab('home'); }} />
        )}
        <View style={styles.bottomNav}>
          <NavItem icon="📊" label="Home" active={managerTab === 'home'} onPress={() => setManagerTab('home')} />
          <NavItem icon="🏢" label="Branches" active={managerTab === 'branches'} onPress={() => setManagerTab('branches')} />
          <NavItem icon="👤" label="Profile" active={managerTab === 'profile'} onPress={() => setManagerTab('profile')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={tab === 'dashboard' ? 'light' : 'dark'} />
      {tab === 'dashboard' && <DashboardScreen segment={segment} setSegment={setSegment} />}
      {tab === 'schedule' && <ScheduleScreen />}
      {tab === 'reports' && <ReportsScreen />}
      {tab === 'profile' && (
        <AgencyProfileScreen onLogout={() => { setRole(null); setTab('dashboard'); }} />
      )}
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

function AgencyLoginScreen({ onAgentLogin, onManagerLogin }) {
  const [mode, setMode] = useState('signin');
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.loginHeader}>
        <SafeAreaView style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>🏢</Text>
          <Text style={styles.loginHeaderTitle}>Agency Sign In</Text>
          <Text style={styles.loginHeaderSub}>Manage trips, verify tickets, and view station reports</Text>
          <View style={styles.loginToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signin' && styles.toggleBtnActive]}
              onPress={() => setMode('signin')}
            >
              <Text style={[styles.toggleText, mode === 'signin' && styles.toggleTextActive]}>→  Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>＋  Sign Up</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.inputLabel}>Bus Operator Agency</Text>
        <TouchableOpacity style={styles.selectField}>
          <Text style={styles.selectText}>🏢  Fasta</Text>
          <Text style={{ color: colors.muted }}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Station / Branch</Text>
        <TouchableOpacity style={styles.selectField}>
          <Text style={[styles.selectText, { color: colors.muted }]}>📍  Select branch station...</Text>
          <Text style={{ color: colors.muted }}>▼</Text>
        </TouchableOpacity>

        {mode === 'signup' && (
          <>
            <Text style={styles.inputLabel}>Agent Full Name</Text>
            <TextInput style={styles.input} placeholder="Kinyarwanda safari" placeholderTextColor={colors.muted} />
          </>
        )}

        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="agent@urugendo.rw"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={colors.muted} secureTextEntry />

        <TouchableOpacity style={styles.primaryBtn} onPress={onAgentLogin} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Sign In to Branch  →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={onManagerLogin}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Manager login →</Text>
        </TouchableOpacity>

        <Text style={{ textAlign: 'center', marginTop: 16, color: colors.textSecondary, fontSize: 13 }}>
          New station agent? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign Up for access</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

function DashboardScreen({ segment, setSegment }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}><Text style={{ fontSize: 20 }}>🚌</Text></View>
              <View>
                <Text style={styles.headerTitle}>Agency Dashboard</Text>
                <Text style={styles.headerSub}>Bus operator • Musanze</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellBtn}><Text style={{ fontSize: 18 }}>🔔</Text></TouchableOpacity>
          </View>
          <View style={styles.statRow}>
            {[{ v: '0', l: 'Today' }, { v: 'OK', l: 'Revenue' }, { v: '0', l: 'Buses' }, { v: '0', l: 'Routes' }].map((s) => (
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
              <Text style={styles.revenueTitle}>Today's Revenue (Musanze)</Text>
              <Text style={styles.revenueAmount}>0 RWF</Text>
              <Text style={styles.revenueSub}>↗  0 station bookings today</Text>
            </View>
            <View style={styles.twoCol}>
              <View style={styles.miniCard}>
                <Text style={styles.miniLabel}>Urugendo</Text>
                <Text style={[styles.miniValue, { color: colors.primary }]}>0</Text>
                <Text style={styles.miniSub}>0 RWF digital</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.miniLabel}>Paper Tickets</Text>
                <Text style={[styles.miniValue, { color: colors.orange }]}>0</Text>
                <Text style={styles.miniSub}>0 RWF counter</Text>
              </View>
            </View>
            <View style={styles.twoCol}>
              <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>+  Add Schedule</Text></TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>🔍  Verify Ticket</Text></TouchableOpacity>
            </View>
          </>
        )}
        {segment === 'verify' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Verify ticket</Text>
            <Text style={styles.inputLabel}>BOOKING CODE OR SEAT</Text>
            <TextInput style={styles.input} placeholder="e.g. URG-8K2M" placeholderTextColor={colors.muted} />
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]}><Text style={styles.primaryBtnText}>Search</Text></TouchableOpacity>
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
      <SafeAreaView style={styles.pageHeader}><Text style={styles.pageTitle}>Schedule</Text></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>+ Add new trip</Text></TouchableOpacity>
        <View style={[styles.card, { marginTop: 16 }]}><Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No schedules yet</Text></View>
      </ScrollView>
    </View>
  );
}

function ReportsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}><Text style={styles.pageTitle}>Reports</Text></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.card}><Text style={styles.cardTitle}>Revenue report</Text><Text style={{ color: colors.textSecondary }}>Day / Week / Month</Text></View>
      </ScrollView>
    </View>
  );
}

function AgencyProfileScreen({ onLogout }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}><Text style={styles.pageTitle}>Profile</Text></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branch: Musanze</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Agent account</Text>
        </View>
        <TouchableOpacity style={[styles.actionBtn, { marginTop: 8 }]} onPress={onLogout}>
          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ManagerHomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingBottom: 24 }]}>
        <SafeAreaView>
          <Text style={[styles.headerTitle, { fontSize: 22, marginTop: 8 }]}>Manager</Text>
          <Text style={styles.headerSub}>Agency overview</Text>
        </SafeAreaView>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.revenueCard}>
          <Text style={styles.revenueTitle}>Total revenue</Text>
          <Text style={styles.revenueAmount}>0 RWF</Text>
          <Text style={styles.revenueSub}>All branches</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending agent approvals</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No pending agents</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Branches</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Manage from Branches tab</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ManagerBranchesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}><Text style={styles.pageTitle}>Branches</Text></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <TouchableOpacity style={styles.primaryBtn}><Text style={styles.primaryBtnText}>+ Create branch</Text></TouchableOpacity>
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.cardTitle}>Musanze</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Active</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ManagerProfileScreen({ onLogout }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}><Text style={styles.pageTitle}>Manager Profile</Text></SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Manager account</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Agency owner / manager</Text>
        </View>
        <TouchableOpacity style={[styles.actionBtn, { marginTop: 8 }]} onPress={onLogout}>
          <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loginHeader: { backgroundColor: colors.headerGreen, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  loginHeaderTitle: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 6 },
  loginHeaderSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 20, paddingHorizontal: 12 },
  loginToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 4, width: '100%' },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: '#fff' },
  toggleText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  toggleTextActive: { color: colors.primary },
  selectField: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 4 },
  selectText: { fontSize: 15, color: colors.text },
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
  miniLabel: { fontSize: 13, color: colors.textSecondary },
  miniValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  miniSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  actionBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: colors.text },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  pageHeader: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  pageTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingBottom: 28, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navItemActive: { backgroundColor: colors.primaryLight, borderRadius: 16, marginHorizontal: 2 },
  navLabel: { fontSize: 10, color: colors.muted, marginTop: 2 },
  navLabelActive: { fontSize: 10, color: colors.primary, fontWeight: '700', marginTop: 2 },
});
