import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { supabase } from './src/lib/supabase';
import {
  ApiError, createPassengerBooking, fetchPassengerBookings, fetchTrips,
  getCurrentUser, signInPassenger, signOut, signUpPassenger,
} from '../../packages/api/src/index';

const C = {
  primary: '#16A34A', primaryDark: '#15803D', primaryLight: '#DCFCE7',
  background: '#F8FAFC', surface: '#FFFFFF', text: '#0F172A',
  secondary: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  orange: '#F59E0B', danger: '#DC2626', blue: '#2563EB',
};
const today = () => new Date().toISOString().slice(0, 10);
const money = (amount) => `${Number(amount || 0).toLocaleString()} RWF`;

export default function App() {
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('main');
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('Kigali');
  const [to, setTo] = useState('Musanze');
  const [travelDate, setTravelDate] = useState(today());
  const [trips, setTrips] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerCount, setPassengerCount] = useState('1');
  const [momoName, setMomoName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');

  const refreshUser = useCallback(async () => {
    try {
      const current = await getCurrentUser(supabase);
      setUser(current);
      setProfileName(current?.user_metadata?.full_name || '');
    } catch (e) {
      setError(e.message || 'Could not restore your session.');
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setProfileName(session?.user?.user_metadata?.full_name || '');
    });
    return () => listener.subscription.unsubscribe();
  }, [refreshUser]);

  const showError = (e, fallback) => {
    const message = e instanceof ApiError ? e.message : (e?.message || fallback);
    setError(message);
    Alert.alert('Urugendo', message);
  };

  const runSearch = async () => {
    setBusy(true); setError(''); setTrips([]);
    try {
      const results = await fetchTrips(supabase, { from, to, date: travelDate || undefined });
      const fromKey = from.trim().toLowerCase();
      const toKey = to.trim().toLowerCase();
      const exact = results.filter(t =>
        t.from.trim().toLowerCase() === fromKey && t.to.trim().toLowerCase() === toKey
      );
      setTrips(exact);
      setScreen('search');
      if (!exact.length) setError('No scheduled trips match this route and date. Try another date or route.');
    } catch (e) { showError(e, 'Could not load trips from the database.'); }
    finally { setBusy(false); }
  };

  const loadTickets = async () => {
    if (!user) { setTickets([]); setScreen('login'); return; }
    setBusy(true); setError('');
    try { setTickets(await fetchPassengerBookings(supabase)); }
    catch (e) { showError(e, 'Could not load your tickets.'); }
    finally { setBusy(false); }
  };

  const openTab = async (nextTab) => {
    setTab(nextTab); setScreen('main'); setError('');
    if (nextTab === 'tickets') await loadTickets();
  };

  const submitBooking = async () => {
    if (!user) { setScreen('login'); return; }
    if (!selectedTrip) return;
    setBusy(true); setError('');
    try {
      const booking = await createPassengerBooking(supabase, {
        trip: selectedTrip, passengerCount: Number(passengerCount), passengerName, passengerPhone, momoName, momoNumber,
      });
      setCreatedBooking(booking);
      setScreen('ticket');
    } catch (e) { showError(e, 'Could not save this booking.'); }
    finally { setBusy(false); }
  };

  const handleLogin = async (mode, values) => {
    setBusy(true); setError('');
    try {
      if (mode === 'signup') {
        const result = await signUpPassenger(supabase, values);
        if (result.needsEmailConfirmation) {
          Alert.alert('Check your email', 'Your account was created. Confirm your email, then return here and sign in.');
          setScreen('login');
        } else {
          setUser(result.user); setProfileName(values.fullName); setScreen('main'); setTab('home');
        }
      } else {
        const loggedIn = await signInPassenger(supabase, values.email, values.password);
        setUser(loggedIn); setProfileName(loggedIn.user_metadata?.full_name || '');
        setScreen('main'); setTab('home');
      }
    } catch (e) { showError(e, 'Authentication failed.'); }
    finally { setBusy(false); }
  };

  const handleLogout = async () => {
    setBusy(true);
    try { await signOut(supabase); setUser(null); setTickets([]); setTab('profile'); }
    catch (e) { showError(e, 'Could not sign out.'); }
    finally { setBusy(false); }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {loadingUser ? (
        <View style={styles.center}><ActivityIndicator size="large" color={C.primary} /><Text style={styles.muted}>Restoring your session…</Text></View>
      ) : screen === 'login' ? (
        <AuthScreen busy={busy} onBack={() => setScreen('main')} onSubmit={handleLogin} />
      ) : screen === 'search' ? (
        <SearchScreen trips={trips} busy={busy} error={error} from={from} to={to} date={travelDate}
          onBack={() => { setScreen('main'); setError(''); }}
          onSelect={(trip) => {
            setSelectedTrip(trip); setPassengerName(profileName);
            setPassengerCount('1'); setMomoName(''); setMomoNumber(''); setScreen('payment'); setError('');
          }} />
      ) : screen === 'payment' && selectedTrip ? (
        <PaymentScreen trip={selectedTrip} busy={busy} error={error} user={user}
          passengerName={passengerName} setPassengerName={setPassengerName}
          passengerPhone={passengerPhone} setPassengerPhone={setPassengerPhone}
          passengerCount={passengerCount} setPassengerCount={setPassengerCount}
          momoName={momoName} setMomoName={setMomoName}
          momoNumber={momoNumber} setMomoNumber={setMomoNumber}
          onBack={() => setScreen('search')} onLogin={() => setScreen('login')} onSubmit={submitBooking} />
      ) : screen === 'ticket' && createdBooking ? (
        <TicketScreen booking={createdBooking} trip={selectedTrip} onDone={async () => {
          setScreen('main'); setTab('tickets'); await loadTickets();
        }} />
      ) : (
        <>
          {tab === 'home' && <HomeScreen from={from} setFrom={setFrom} to={to} setTo={setTo}
            travelDate={travelDate} setTravelDate={setTravelDate} busy={busy} onSearch={runSearch} />}
          {tab === 'tickets' && <TicketsScreen tickets={tickets} busy={busy} user={user}
            onRefresh={loadTickets} onLogin={() => setScreen('login')} />}
          {tab === 'profile' && <ProfileScreen user={user} name={profileName} busy={busy}
            onLogin={() => setScreen('login')} onLogout={handleLogout} />}
          <View style={styles.bottomNav}>
            {[
              ['home', '🏠', 'Home'], ['tickets', '🎫', 'Tickets'], ['profile', '👤', 'Profile'],
            ].map(([key, emoji, label]) => (
              <TouchableOpacity key={key} style={[styles.navItem, tab === key && styles.navItemActive]} onPress={() => openTab(key)}>
                <Text style={{ fontSize: 21 }}>{emoji}</Text>
                <Text style={tab === key ? styles.navLabelActive : styles.navLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function HomeScreen({ from, setFrom, to, setTo, travelDate, setTravelDate, busy, onSearch }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.brandRow}><Text style={styles.brandIcon}>🚌</Text><Text style={styles.brand}>Urugendo.</Text></View>
          <Text style={styles.greeting}>Muraho 👋</Text><Text style={styles.heroTitle}>Where to today?</Text>
          <Text style={styles.headerSub}>Find your next journey across Rwanda.</Text>
        </SafeAreaView>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Field label="FROM" value={from} onChangeText={setFrom} placeholder="e.g. Kigali" />
          <Field label="TO" value={to} onChangeText={setTo} placeholder="e.g. Musanze" />
          <Field label="TRAVEL DATE (YYYY-MM-DD)" value={travelDate} onChangeText={setTravelDate} placeholder={today()} />
          <PrimaryButton title={busy ? 'Searching…' : '🔍  Search buses'} onPress={onSearch} disabled={busy || !from.trim() || !to.trim()} />
        </View>
        <View style={styles.noteCard}><Text style={styles.noteTitle}>Travel with confidence</Text><Text style={styles.muted}>Trip availability and prices are loaded from Urugendo's shared database.</Text></View>
      </ScrollView>
    </View>
  );
}

function SearchScreen({ trips, busy, error, from, to, date, onBack, onSelect }) {
  return (
    <View style={styles.page}>
      <PageHeader title={`${from} → ${to}`} subtitle={date || 'All available dates'} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {busy && <ActivityIndicator color={C.primary} size="large" />}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
        {!busy && !trips.length && !error && <Empty title="No trips found" subtitle="Try a different route or date." />}
        {trips.map(trip => (
          <View key={trip.id} style={styles.tripCard}>
            <View style={styles.rowBetween}><Text style={styles.tripTime}>{trip.departureTime || 'Time TBC'}</Text><Text style={styles.price}>{money(trip.price)}</Text></View>
            <Text style={styles.cardTitle}>{trip.from} → {trip.to}</Text>
            <Text style={styles.muted}>{trip.operatorName} · {trip.date || date}</Text>
            <Text style={styles.muted}>{trip.duration || 'Duration not listed'} · {trip.availableSeats} seats available</Text>
            <PrimaryButton title="Select trip" onPress={() => onSelect(trip)} disabled={trip.availableSeats <= 0} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function PaymentScreen({ trip, busy, error, user, passengerName, setPassengerName, passengerPhone, setPassengerPhone, passengerCount, setPassengerCount, momoName, setMomoName, momoNumber, setMomoNumber, onBack, onLogin, onSubmit }) {
  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title="Booking details" subtitle={`${trip.from} → ${trip.to}`} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{trip.operatorName}</Text>
          <Text style={styles.muted}>{trip.date} · {trip.departureTime} – {trip.arrivalTime || 'TBC'}</Text>
          <Text style={styles.priceLarge}>{money(trip.price)}</Text>
          <Text style={styles.muted}>{trip.availableSeats} seats currently available · capacity set by the agency manager</Text>
        </View>
        {!user && <View style={styles.noteCard}><Text style={styles.noteTitle}>Sign in required</Text><Text style={styles.muted}>Sign in to attach this booking securely to your account.</Text><PrimaryButton title="Sign in" onPress={onLogin} /></View>}
        <View style={styles.card}>
          <Field label="PASSENGER FULL NAME" value={passengerName} onChangeText={setPassengerName} placeholder="Full name" />
          <Field label="PASSENGER PHONE" value={passengerPhone} onChangeText={setPassengerPhone} placeholder="078… / +250…" keyboardType="phone-pad" />
          <Field label="NUMBER OF PASSENGERS" value={passengerCount} onChangeText={(v) => setPassengerCount(v.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="1" keyboardType="number-pad" />
          <Text style={styles.muted}>Total: {money(trip.price * Math.max(1, Number(passengerCount) || 1))} for {Math.max(1, Number(passengerCount) || 1)} passenger(s).</Text>
          <Field label="MOMO ACCOUNT NAME" value={momoName} onChangeText={setMomoName} placeholder="Name on MoMo account" />
          <Field label="MOMO PHONE NUMBER" value={momoNumber} onChangeText={setMomoNumber} placeholder="078… / +250…" keyboardType="phone-pad" />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.disclaimer}>Your booking reserves the requested number of seats against the manager's scheduled capacity. The app will request an MTN MoMo sandbox payment; approval and provider confirmation are separate from saving the booking.</Text>
          <PrimaryButton title={busy ? 'Saving booking…' : 'Reserve seats & request MTN payment'} onPress={onSubmit} disabled={busy || !user || !Number(passengerCount) || Number(passengerCount) > trip.availableSeats} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TicketScreen({ booking, trip, onDone }) {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.centerContent}>
        <Text style={{ fontSize: 54 }}>🎫</Text>
        <Text style={styles.heroDark}>Booking saved</Text>
        <Text style={styles.muted}>Your booking was written to Urugendo. Payment status must be confirmed by MTN or the agency.</Text>
        <View style={[styles.card, { width: '100%' }]}>
          <Text style={styles.inputLabel}>BOOKING CODE</Text><Text style={styles.code}>{booking.code || booking.id}</Text>
          <Text style={styles.cardTitle}>{trip?.from} → {trip?.to}</Text>
          <Text style={styles.muted}>{trip?.date} · {trip?.departureTime}</Text>
          <Text style={styles.muted}>Passengers: {booking.passengerCount}</Text>
          <Text style={styles.price}>{money(booking.totalAmount)}</Text>
          <Text style={styles.statusPill}>{booking.paymentStatus === 'verified' || booking.paymentStatus === 'success' ? 'Payment confirmed' : 'Payment pending'}</Text>
          {!!booking.paymentMessage && <Text style={styles.disclaimer}>{booking.paymentMessage}</Text>
        </View>
        <PrimaryButton title="View My Tickets" onPress={onDone} />
      </ScrollView>
    </View>
  );
}

function TicketsScreen({ tickets, busy, user, onRefresh, onLogin }) {
  return (
    <View style={styles.page}>
      <View style={styles.simpleHeader}><Text style={styles.heroDark}>My Tickets</Text><Text style={styles.muted}>Your bookings from the shared database</Text></View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!user ? <Empty title="Sign in to view tickets" subtitle="Your bookings are linked to your account." action="Sign in" onAction={onLogin} /> :
          busy ? <ActivityIndicator color={C.primary} size="large" /> :
          tickets.length === 0 ? <Empty title="No bookings yet" subtitle="Your saved bookings will appear here." action="Refresh" onAction={onRefresh} /> :
          <>
            <PrimaryButton title="Refresh tickets" onPress={onRefresh} />
            {tickets.map(ticket => (
              <View key={ticket.id} style={styles.tripCard}>
                <View style={styles.rowBetween}><Text style={styles.cardTitle}>{ticket.trip ? `${ticket.trip.from} → ${ticket.trip.to}` : 'Urugendo booking'}</Text><Text style={styles.price}>{money(ticket.totalAmount)}</Text></View>
                <Text style={styles.muted}>{ticket.trip?.date || ticket.createdAt}</Text>
                <Text style={styles.muted}>Code: {ticket.code || ticket.id}</Text>
                <Text style={styles.statusPill}>{ticket.paymentStatus === 'verified' ? 'Payment verified' : ticket.paymentStatus === 'failed' ? 'Payment failed' : 'Awaiting payment verification'}</Text>
              </View>
            ))}
          </>
        }
      </ScrollView>
    </View>
  );
}

function ProfileScreen({ user, name, busy, onLogin, onLogout }) {
  return (
    <View style={styles.page}>
      <View style={styles.simpleHeader}><Text style={styles.heroDark}>Profile</Text><Text style={styles.muted}>Manage your Urugendo account</Text></View>
      <View style={styles.scrollContent}>
        <View style={styles.card}><Text style={styles.avatar}>{user ? '👤' : '👋'}</Text><Text style={styles.cardTitle}>{name || user?.email || 'Guest traveller'}</Text><Text style={styles.muted}>{user?.email || 'Sign in to sync bookings across devices.'}</Text></View>
        {!user ? <PrimaryButton title="Sign in / Create account" onPress={onLogin} /> : <PrimaryButton title={busy ? 'Signing out…' : 'Sign out'} onPress={onLogout} disabled={busy} secondary />}
      </View>
    </View>
  );
}

function AuthScreen({ busy, onBack, onSubmit }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PageHeader title={mode === 'signin' ? 'Welcome back' : 'Create account'} subtitle="Securely access your bookings" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.centerContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.segmentRow}>
            <TouchableOpacity style={[styles.segment, mode === 'signin' && styles.segmentActive]} onPress={() => setMode('signin')}><Text style={[styles.segmentText, mode === 'signin' && styles.segmentTextActive]}>Sign in</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.segment, mode === 'signup' && styles.segmentActive]} onPress={() => setMode('signup')}><Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>Create account</Text></TouchableOpacity>
          </View>
          {mode === 'signup' && <><Field label="FULL NAME" value={fullName} onChangeText={setFullName} placeholder="Your name" /><Field label="PHONE NUMBER" value={phone} onChangeText={setPhone} placeholder="078… / +250…" keyboardType="phone-pad" /></>}
          <Field label="EMAIL" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="PASSWORD" value={password} onChangeText={setPassword} placeholder="At least 6 characters" secureTextEntry />
          <PrimaryButton title={busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'} disabled={busy} onPress={() => onSubmit(mode, { email, password, fullName, phone })} />
          <Text style={styles.disclaimer}>Email confirmation may be required, depending on the Supabase project settings.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder, ...props }) {
  return <View style={styles.fieldWrap}><Text style={styles.inputLabel}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.muted} {...props} /></View>;
}
function PrimaryButton({ title, onPress, disabled, secondary }) {
  return <TouchableOpacity activeOpacity={0.85} style={[styles.primaryButton, secondary && styles.secondaryButton, disabled && { opacity: 0.55 }]} onPress={onPress} disabled={disabled}><Text style={[styles.primaryButtonText, secondary && styles.secondaryButtonText]}>{title}</Text></TouchableOpacity>;
}
function PageHeader({ title, subtitle, onBack }) {
  return <SafeAreaView style={styles.pageHeader}><TouchableOpacity onPress={onBack} style={styles.backButton}><Text style={{ fontSize: 25, color: C.text }}>‹</Text></TouchableOpacity><View style={{ flex: 1 }}><Text style={styles.pageTitle}>{title}</Text>{!!subtitle && <Text style={styles.muted}>{subtitle}</Text>}</View></SafeAreaView>;
}
function Empty({ title, subtitle, action, onAction }) {
  return <View style={styles.emptyState}><Text style={{ fontSize: 38 }}>🚌</Text><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text>{!!action && <PrimaryButton title={action} onPress={onAction} />}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: { backgroundColor: C.primary, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 52, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  brandIcon: { fontSize: 24, backgroundColor: '#FFFFFF', overflow: 'hidden', borderRadius: 24, padding: 8 },
  brand: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginLeft: 10 },
  greeting: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginBottom: 4 },
  heroTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.85)', marginTop: 7, fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 110 },
  card: { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  noteCard: { backgroundColor: C.primaryLight, borderRadius: 16, padding: 16, marginBottom: 14 },
  noteTitle: { fontSize: 15, fontWeight: '800', color: C.primaryDark, marginBottom: 5 },
  fieldWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: C.secondary, marginBottom: 7, letterSpacing: 0.6 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 13, color: C.text, fontSize: 15 },
  primaryButton: { backgroundColor: C.primary, borderRadius: 13, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryButton: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  secondaryButtonText: { color: C.text },
  page: { flex: 1, backgroundColor: C.background },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.background, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 19, fontWeight: '800', color: C.text },
  simpleHeader: { padding: 20, paddingTop: 36, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  heroDark: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 4 },
  muted: { color: C.secondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  tripCard: { backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tripTime: { fontSize: 21, fontWeight: '800', color: C.text },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '800', marginTop: 6 },
  price: { color: C.primaryDark, fontWeight: '800', fontSize: 16 },
  priceLarge: { color: C.primaryDark, fontSize: 25, fontWeight: '900', marginTop: 12 },
  errorText: { color: C.danger, fontSize: 13, marginVertical: 10, lineHeight: 19 },
  disclaimer: { color: C.secondary, fontSize: 12, lineHeight: 18, marginTop: 12 },
  statusPill: { overflow: 'hidden', alignSelf: 'flex-start', color: '#92400E', backgroundColor: '#FEF3C7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginTop: 12, fontSize: 12, fontWeight: '700' },
  code: { fontSize: 26, color: C.text, fontWeight: '900', letterSpacing: 2, marginVertical: 7 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 7, paddingBottom: Platform.OS === 'ios' ? 22 : 9, paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: 14 },
  navItemActive: { backgroundColor: C.primaryLight },
  navLabel: { color: C.muted, fontSize: 11, marginTop: 3 },
  navLabelActive: { color: C.primaryDark, fontWeight: '800', fontSize: 11, marginTop: 3 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  centerContent: { flexGrow: 1, justifyContent: 'center', padding: 18, paddingBottom: 40 },
  emptyState: { backgroundColor: C.surface, borderRadius: 18, padding: 22, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: C.border, gap: 7 },
  avatar: { fontSize: 42, textAlign: 'center', marginBottom: 10 },
  segmentRow: { flexDirection: 'row', backgroundColor: C.background, borderRadius: 12, padding: 4, marginBottom: 16 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 9 },
  segmentActive: { backgroundColor: C.primary },
  segmentText: { color: C.secondary, fontWeight: '700' },
  segmentTextActive: { color: '#FFFFFF' },
});
