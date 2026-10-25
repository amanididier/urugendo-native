import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { supabase } from './src/lib/supabase';

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
  const [managerProfile, setManagerProfile] = useState(null);
  const [managerSessionToken, setManagerSessionToken] = useState(null);
  const [authBusy, setAuthBusy] = useState(false);

  const authenticateAgencyUser = async (email, password, expectedRole, managerCode = '', agencyName = '') => {
    if (!email?.trim() || !password) { Alert.alert('Sign in required', 'Enter your email and password.'); return; }
    setAuthBusy(true);
    try {
      if (expectedRole === 'manager') {
        if (!managerCode.trim() || !agencyName.trim()) {
          throw new Error('Enter the manager code and choose the agency assigned to your manager account.');
        }
        const { data, error } = await supabase.functions.invoke('manager-auth', {
          body: { email: email.trim().toLowerCase(), managerCode: managerCode.trim(), password, agencyName: agencyName.trim(), native: true },
        });
        if (error) throw new Error(error.message || 'Manager sign-in failed.');
        if (!data?.ok || !data?.manager || !data?.sessionToken) {
          const reasons = { not_found: 'Manager account not found.', inactive: 'This manager account is inactive.', code_mismatch: 'Manager code is incorrect.', agency_mismatch: 'The selected agency does not match this manager account.', bad_password: 'Password is incorrect.' };
          throw new Error(reasons[data?.reason] || 'Manager sign-in failed.');
        }
        setManagerProfile(data.manager);
        setManagerSessionToken(data.sessionToken);
        setRole('manager'); setManagerTab('home'); setTab('dashboard');
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error || !data.user) throw error || new Error('Sign in failed.');
      const { data: profile, error: profileError } = await supabase.from('profiles')
        .select('id, role, operator_id, branch, full_name, email')
        .eq('id', data.user.id).maybeSingle();
      if (profileError) throw profileError;
      const roleName = String(profile?.role || '').toLowerCase();
      if (!['agent', 'checker', 'ticket_checker'].includes(roleName)) {
        await supabase.auth.signOut();
        throw new Error('This account is not assigned an Agent or Ticket Checker role.');
      }
      setManagerProfile(profile);
      setRole('agent'); setManagerTab('home'); setTab('dashboard');
    } catch (e) {
      Alert.alert('Unable to sign in', e?.message || 'Check your account and try again.');
    } finally { setAuthBusy(false); }
  };

  const logoutManager = async () => {
    if (managerSessionToken) {
      try { await supabase.functions.invoke('manager-schedule', { body: { action: 'logout', sessionToken: managerSessionToken } }); } catch {}
    }
    setManagerSessionToken(null); setManagerProfile(null); setRole(null); setManagerTab('home');
  };

  if (!role) {
    return <AgencyLoginScreen busy={authBusy} onAgentLogin={(email, password) => authenticateAgencyUser(email, password, 'agent')} onManagerLogin={(email, password, code, agency) => authenticateAgencyUser(email, password, 'manager', code, agency)} />;
  }

  if (role === 'manager') {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        {managerTab === 'home' && <ManagerHomeScreen />}
        {managerTab === 'branches' && <ManagerBranchesScreen />}
        {managerTab === 'schedule' && <ManagerScheduleScreen profile={managerProfile} sessionToken={managerSessionToken} />}
        {managerTab === 'profile' && (
          <ManagerProfileScreen onLogout={logoutManager} />
        )}
        <View style={styles.bottomNav}>
          <NavItem icon="📊" label="Home" active={managerTab === 'home'} onPress={() => setManagerTab('home')} />
          <NavItem icon="🏢" label="Branches" active={managerTab === 'branches'} onPress={() => setManagerTab('branches')} />
          <NavItem icon="📅" label="Schedule" active={managerTab === 'schedule'} onPress={() => setManagerTab('schedule')} />
          <NavItem icon="👤" label="Profile" active={managerTab === 'profile'} onPress={() => setManagerTab('profile')} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={tab === 'dashboard' ? 'light' : 'dark'} />
      {tab === 'dashboard' && <DashboardScreen segment={segment} setSegment={setSegment} />}      {tab === 'reports' && <ReportsScreen />}
      {tab === 'profile' && (
        <AgencyProfileScreen onLogout={async () => { await supabase.auth.signOut(); setManagerProfile(null); setRole(null); setTab('dashboard'); }} />
      )}
      <View style={styles.bottomNav}>
        <NavItem icon="🚌" label="Dashboard" active={tab === 'dashboard'} onPress={() => setTab('dashboard')} />        <NavItem icon="📄" label="Reports" active={tab === 'reports'} onPress={() => setTab('reports')} />
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

function AgencyLoginScreen({ busy, onAgentLogin, onManagerLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [managerCode, setManagerCode] = useState('');
  const [agencyName, setAgencyName] = useState('Virunga Express');
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.loginHeader}><SafeAreaView style={{ alignItems: 'center' }}><Text style={{ fontSize: 48, marginBottom: 8 }}>🏢</Text><Text style={styles.loginHeaderTitle}>Agency Sign In</Text><Text style={styles.loginHeaderSub}>Approved agency accounts only. Scheduling is reserved for Branch Managers.</Text></SafeAreaView></View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@agency.rw" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" />
        <View style={[styles.card, { marginTop: 18 }]}><Text style={styles.cardTitle}>Branch Manager / Agency Boss</Text>
          <Text style={styles.inputLabel}>Manager Code</Text><TextInput style={styles.input} value={managerCode} onChangeText={setManagerCode} placeholder="Your manager code" placeholderTextColor={colors.muted} autoCapitalize="characters" />
          <Text style={styles.inputLabel}>Agency Name</Text><TextInput style={styles.input} value={agencyName} onChangeText={setAgencyName} placeholder="Fasta or Virunga Express" placeholderTextColor={colors.muted} autoCapitalize="words" />
          <TouchableOpacity style={[styles.primaryBtn, busy && { opacity: 0.6 }]} disabled={busy} onPress={() => onManagerLogin(email, password, managerCode, agencyName)}><Text style={styles.primaryBtnText}>{busy ? 'Signing in…' : 'Sign in as Manager →'}</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.actionBtn, { marginTop: 10 }]} disabled={busy} onPress={() => onAgentLogin(email, password)}><Text style={styles.actionBtnText}>{busy ? 'Signing in…' : 'Sign in as Agent / Checker'}</Text></TouchableOpacity>
        <Text style={{ textAlign: 'center', marginTop: 16, color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>Your role is checked on the server. Agents cannot access manager scheduling.</Text>
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
              <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionBtnText}>🧾  Counter Sales</Text></TouchableOpacity>
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



function ManagerScheduleScreen({ profile, sessionToken }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [departureTime, setDepartureTime] = useState('08:00');
  const [price, setPrice] = useState('3500');
  const [totalSeats, setTotalSeats] = useState('29');

  const loadTrips = async () => {
    if (!sessionToken) { setError('Manager session expired. Sign in again.'); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('manager-schedule', {
        body: { action: 'list', sessionToken },
      });
      if (fnError) throw new Error(fnError.message || 'Could not load scheduled trips.');
      if (data?.error) throw new Error(data.error);
      setTrips(Array.isArray(data?.trips) ? data.trips : []);
    } catch (e) { setError(e?.message || 'Could not load scheduled trips.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadTrips(); }, [sessionToken]);

  const createTrip = async () => {
    setError(''); setNotice('');
    if (!from.trim() || !to.trim() || from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setError('Enter different origin and destination stations.'); return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < new Date().toISOString().slice(0, 10)) {
      setError('Choose today or a future travel date in YYYY-MM-DD format.'); return;
    }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(departureTime)) { setError('Use 24-hour time, for example 08:30.'); return; }
    if (!Number.isFinite(Number(price)) || Number(price) <= 0) { setError('Enter a valid fare in RWF.'); return; }
    if (!Number.isInteger(Number(totalSeats)) || Number(totalSeats) < 1 || Number(totalSeats) > 100) { setError('Capacity must be between 1 and 100 seats.'); return; }
    setSaving(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('manager-schedule', {
        body: { action: 'create', sessionToken, trip: { from: from.trim(), to: to.trim(), date, departureTime, price: Number(price), totalSeats: Number(totalSeats) } },
      });
      if (fnError) throw new Error(fnError.message || 'Could not save the trip.');
      if (data?.error) throw new Error(data.error);
      setNotice('Trip scheduled. Passenger availability now uses this capacity.');
      setFrom(''); setTo('');
      await loadTrips();
    } catch (e) { setError(e?.message || 'Could not save the trip.'); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Trip schedule</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{profile?.agencyName || 'Your agency'} · Manager only</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule a bus</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5 }}>The seat count you enter becomes the passenger app's capacity. Travellers do not choose seat numbers.</Text>
          <Text style={styles.inputLabel}>FROM</Text><TextInput style={styles.input} value={from} onChangeText={setFrom} placeholder="e.g. Kigali" placeholderTextColor={colors.muted} />
          <Text style={styles.inputLabel}>TO</Text><TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="e.g. Musanze" placeholderTextColor={colors.muted} />
          <Text style={styles.inputLabel}>TRAVEL DATE (YYYY-MM-DD)</Text><TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-10-25" placeholderTextColor={colors.muted} />
          <Text style={styles.inputLabel}>DEPARTURE TIME (24-HOUR)</Text><TextInput style={styles.input} value={departureTime} onChangeText={setDepartureTime} placeholder="08:00" placeholderTextColor={colors.muted} />
          <Text style={styles.inputLabel}>FARE PER PASSENGER (RWF)</Text><TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="3500" placeholderTextColor={colors.muted} />
          <Text style={styles.inputLabel}>TOTAL BUS CAPACITY</Text><TextInput style={styles.input} value={totalSeats} onChangeText={setTotalSeats} keyboardType="number-pad" placeholder="29" placeholderTextColor={colors.muted} />
          {!!error && <Text style={{ color: '#B91C1C', marginTop: 12, lineHeight: 19 }}>{error}</Text>}
          {!!notice && <Text style={{ color: '#15803D', marginTop: 12, lineHeight: 19 }}>{notice}</Text>}
          <TouchableOpacity style={[styles.primaryBtn, saving && { opacity: 0.6 }]} disabled={saving} onPress={createTrip}>
            <Text style={styles.primaryBtnText}>{saving ? 'Saving schedule…' : 'Publish trip'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.cardTitle}>Scheduled trips</Text>
            <TouchableOpacity onPress={loadTrips}><Text style={{ color: colors.primary, fontWeight: '700' }}>Refresh</Text></TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 18 }} /> :
            trips.length === 0 ? <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No trips scheduled for this agency yet.</Text> :
            trips.map((trip) => (
              <View key={trip.id} style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 12 }}>
                <Text style={styles.cardTitle}>{trip.route_from} → {trip.route_to}</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{trip.travel_date} · {trip.departure_time || 'Time TBC'}</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{Number(trip.price || 0).toLocaleString()} RWF · {trip.total_seats} total seats · {trip.available_seats} available</Text>
                <Text style={{ color: trip.status === 'scheduled' ? colors.primary : colors.muted, marginTop: 4, fontWeight: '700' }}>{trip.status}</Text>
              </View>
            ))
          }
        </View>
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
