import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function App() {
  const [tab, setTab] = useState('home');
  const [screen, setScreen] = useState('main');

  const goTab = (t) => {
    setTab(t);
    setScreen('main');
  };

  return (
    <View style={styles.root}>
      <StatusBar style={tab === 'home' && screen === 'main' ? 'light' : 'dark'} />
      {screen === 'login' && <LoginScreen onClose={() => setScreen('main')} />}
      {screen === 'search' && (
        <SearchScreen onBack={() => setScreen('main')} onSelectTrip={() => setScreen('payment')} />
      )}
      {screen === 'payment' && (
        <PaymentScreen onBack={() => setScreen('search')} onPay={() => setScreen('ticket')} />
      )}
      {screen === 'ticket' && (
        <TicketScreen onDone={() => { setTab('tickets'); setScreen('main'); }} />
      )}
      {screen === 'main' && tab === 'home' && (
        <HomeScreen onSearch={() => setScreen('search')} />
      )}
      {screen === 'main' && tab === 'tickets' && <TicketsScreen />}
      {screen === 'main' && tab === 'profile' && (
        <ProfileScreen onLogin={() => setScreen('login')} />
      )}
      {screen === 'main' && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navItem, tab === 'home' && styles.navItemActive]} onPress={() => goTab('home')}>
            <Text style={{ fontSize: 22 }}>🏠</Text>
            <Text style={tab === 'home' ? styles.navLabelActive : styles.navLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, tab === 'tickets' && styles.navItemActive]} onPress={() => goTab('tickets')}>
            <Text style={{ fontSize: 22 }}>🎫</Text>
            <Text style={tab === 'tickets' ? styles.navLabelActive : styles.navLabel}>Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, tab === 'profile' && styles.navItemActive]} onPress={() => goTab('profile')}>
            <Text style={{ fontSize: 22 }}>👤</Text>
            <Text style={tab === 'profile' ? styles.navLabelActive : styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function HomeScreen({ onSearch }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}><Text style={{ fontSize: 18 }}>🚌</Text></View>
              <Text style={styles.logoText}>Urugendo.</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn}><Text style={{ fontSize: 18 }}>🔔</Text></TouchableOpacity>
          </View>
          <Text style={styles.greeting}>Muraho 👋</Text>
          <Text style={styles.title}>Where to today?</Text>
        </SafeAreaView>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchCard}>
          <TouchableOpacity style={styles.fieldRow}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={styles.placeholder}>From (e.g. Kigali)</Text>
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.dashedLine} />
            <TouchableOpacity style={styles.swapBtn}><Text style={styles.swapIcon}>⇄</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.fieldRow}>
            <View style={[styles.dot, { backgroundColor: colors.orange }]} />
            <Text style={styles.placeholder}>To (e.g. Musanze)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationRow}>
            <Text>📍</Text>
            <Text style={styles.locationText}>Use my current location</Text>
          </TouchableOpacity>
          <View style={styles.solidLine} />
          <View style={styles.metaRow}>
            <View style={styles.dateChip}><Text>🕐</Text><Text style={styles.dateText}>Oct 25, 2026</Text></View>
            <View style={styles.passengerRow}>
              <TouchableOpacity style={styles.stepperBtn}><Text style={styles.stepperText}>−</Text></TouchableOpacity>
              <Text style={styles.passengerCount}>1</Text>
              <TouchableOpacity style={styles.stepperBtn}><Text style={styles.stepperText}>+</Text></TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={onSearch} activeOpacity={0.85}>
            <Text style={styles.searchBtnText}>🔍  Search Buses</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: '#DCFCE7' }]}><Text style={styles.chipText}>📍 6 Cities</Text></View>
          <View style={[styles.chip, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.chipText, { color: '#B45309' }]}>🏢 2 Agencies</Text></View>
          <View style={[styles.chip, { backgroundColor: '#DBEAFE' }]}><Text style={[styles.chipText, { color: '#1D4ED8' }]}>🕐 24/7</Text></View>
        </View>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.greenBar} />
            <Text style={styles.sectionTitle}>Popular Routes</Text>
          </View>
          <Text style={styles.seeAll}>See all</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { from: 'Kigali', to: 'Nyanza', price: '1,800 RWF', duration: '1h 45m' },
            { from: 'Kigali', to: 'Huye', price: '2,500 RWF', duration: '2h 15m' },
            { from: 'Kigali', to: 'Musanze', price: '3,500 RWF', duration: '2h' },
          ].map((r) => (
            <TouchableOpacity key={r.to} style={styles.routeCard} onPress={onSearch}>
              <View style={styles.routeTop}>
                <View style={styles.routeIconWrap}><Text>📍</Text></View>
                <Text style={styles.routeName}>{r.from} → {r.to}</Text>
              </View>
              <Text style={styles.routePrice}>{r.price}</Text>
              <Text style={styles.routeDuration}>{r.duration}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.footer}>Made with 💚 for Rwanda's travellers</Text>
      </ScrollView>
    </View>
  );
}

function TicketsScreen() {
  const [segment, setSegment] = useState('upcoming');
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingBottom: 24 }]}>
        <SafeAreaView>
          <Text style={[styles.title, { marginTop: 16 }]}>My Tickets</Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>Manage your bus tickets</Text>
        </SafeAreaView>
      </View>
      <View style={styles.segmentWrap}>
        <TouchableOpacity style={[styles.segmentBtn, segment === 'upcoming' && styles.segmentActive]} onPress={() => setSegment('upcoming')}>
          <Text style={[styles.segmentText, segment === 'upcoming' && styles.segmentTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.segmentBtn, segment === 'past' && styles.segmentActive]} onPress={() => setSegment('past')}>
          <Text style={[styles.segmentText, segment === 'past' && styles.segmentTextActive]}>Past</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}><Text style={{ fontSize: 40 }}>🎫</Text></View>
        <Text style={styles.emptyTitle}>
          {segment === 'upcoming' ? 'No upcoming trips. Book your next journey!' : 'No past trips yet.'}
        </Text>
      </View>
    </View>
  );
}

function ProfileScreen({ onLogin }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingBottom: 40, alignItems: 'center' }]}>
        <SafeAreaView style={{ alignItems: 'center' }}>
          <View style={styles.avatar}><Text style={styles.avatarText}>GU</Text></View>
          <Text style={[styles.title, { fontSize: 22 }]}>Guest User</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>Please sign in to view details</Text>
        </SafeAreaView>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>0</Text>
          <Text style={styles.statsLabel}>TOTAL TRIPS</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳  Default MoMo Payment Info</Text>
          <Text style={styles.inputLabel}>PHONE NUMBER</Text>
          <TextInput style={styles.input} placeholder="0788000000" placeholderTextColor={colors.muted} />
          <Text style={styles.inputLabel}>REGISTERED NAME</Text>
          <TextInput style={styles.input} placeholder="Account Holder Name" placeholderTextColor={colors.muted} />
          <TouchableOpacity style={styles.lightBtn}><Text style={styles.lightBtnText}>Save Default MoMo</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.signInLink} onPress={onLogin}>
          <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 15 }}>Sign In / Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function SearchScreen({ onBack, onSelectTrip }) {
  const trips = [
    { id: '1', time: '06:00', agency: 'Volcano Express', price: 3500, seats: 12, duration: '2h' },
    { id: '2', time: '08:30', agency: 'Ritco', price: 3200, seats: 8, duration: '2h 15m' },
    { id: '3', time: '14:30', agency: 'Volcano Express', price: 3500, seats: 22, duration: '2h' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.searchHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={{ fontSize: 22 }}>‹</Text></TouchableOpacity>
        <View>
          <Text style={styles.searchRoute}>Kigali → Musanze</Text>
          <Text style={styles.searchMeta}>Oct 25 · 1 passenger</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {trips.map((t) => (
          <TouchableOpacity key={t.id} style={styles.tripCard} onPress={onSelectTrip} activeOpacity={0.85}>
            <View style={styles.tripLeft}>
              <Text style={styles.tripTime}>{t.time}</Text>
              <Text style={styles.tripAgency}>{t.agency}</Text>
              <Text style={styles.tripDuration}>{t.duration} · {t.seats} seats left</Text>
            </View>
            <View style={styles.tripRight}>
              <Text style={styles.tripPrice}>{t.price.toLocaleString()} RWF</Text>
              <View style={styles.selectBtn}><Text style={styles.selectBtnText}>Select</Text></View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function PaymentScreen({ onBack, onPay }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.searchHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={{ fontSize: 22 }}>‹</Text></TouchableOpacity>
        <Text style={styles.searchRoute}>Payment</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip summary</Text>
          <Text style={{ color: colors.text, fontWeight: '600', marginTop: 8 }}>Kigali → Musanze</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Oct 25 · 14:30 · Volcano Express</Text>
          <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 20, marginTop: 12 }}>3,500 RWF</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Passenger</Text>
          <Text style={styles.inputLabel}>FULL NAME</Text>
          <TextInput style={styles.input} placeholder="Traveler name" placeholderTextColor={colors.muted} />
          <Text style={styles.inputLabel}>PHONE (MoMo)</Text>
          <TextInput style={styles.input} placeholder="0788 000 000" placeholderTextColor={colors.muted} keyboardType="phone-pad" />
        </View>
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary }]} onPress={onPay}>
          <Text style={[styles.searchBtnText, { color: '#fff' }]}>Pay with MoMo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function TicketScreen({ onDone }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Ticket confirmed</Text>
          <Text style={{ color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
            Kigali → Musanze · 14:30 · Volcano Express
          </Text>
          <View style={{ backgroundColor: '#F1F5F9', padding: 16, borderRadius: 12, marginTop: 20, width: '100%', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>BOOKING CODE</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: 2, marginTop: 4 }}>URG-8K2M</Text>
          </View>
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary, marginTop: 24, width: '100%' }]} onPress={onDone}>
            <Text style={[styles.searchBtnText, { color: '#fff' }]}>View My Tickets</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function LoginScreen({ onClose }) {
  return (
    <View style={styles.loginOverlay}>
      <View style={styles.loginCard}>
        <TouchableOpacity style={styles.loginClose} onPress={onClose}>
          <Text style={{ fontSize: 18, color: colors.muted }}>✕</Text>
        </TouchableOpacity>
        <View style={styles.loginIcon}><Text style={{ fontSize: 28 }}>✨</Text></View>
        <Text style={styles.loginTitle}>Welcome Back</Text>
        <Text style={styles.loginSub}>Sign in to manage your active bookings</Text>
        <Text style={styles.inputLabel}>Mobile Phone Number</Text>
        <TextInput style={styles.input} placeholder="+250  788 123 456" placeholderTextColor={colors.muted} keyboardType="phone-pad" />
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={colors.muted} secureTextEntry />
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={onClose}>
          <Text style={[styles.searchBtnText, { color: '#fff' }]}>Sign In  →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.headerGreen, paddingHorizontal: 20, paddingBottom: 48 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  bellBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  scroll: { flex: 1, marginTop: -36 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  searchCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6, marginBottom: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  placeholder: { fontSize: 15, color: colors.muted, flex: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  dashedLine: { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 0.5, borderColor: colors.border },
  swapBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  swapIcon: { color: '#fff', fontSize: 16, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  locationText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  solidLine: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, marginTop: 4 },
  dateChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  dateText: { fontSize: 14, fontWeight: '500', color: colors.text },
  passengerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  stepperText: { fontSize: 18, color: colors.text, fontWeight: '600' },
  passengerCount: { fontSize: 16, fontWeight: '600', color: colors.text, minWidth: 16, textAlign: 'center' },
  searchBtn: { backgroundColor: colors.lightGreenBtn, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  searchBtnText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greenBar: { width: 4, height: 18, backgroundColor: colors.primary, borderRadius: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  seeAll: { fontSize: 14, fontWeight: '600', color: colors.primary },
  routeCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginRight: 12, width: width * 0.42, borderWidth: 1, borderColor: colors.border },
  routeTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  routeIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  routeName: { fontSize: 13, fontWeight: '600', color: colors.text, flex: 1 },
  routePrice: { fontSize: 18, fontWeight: '800', color: colors.primary },
  routeDuration: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  footer: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 28, marginBottom: 16 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingBottom: 28, paddingHorizontal: 12 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navItemActive: { backgroundColor: colors.primaryLight, borderRadius: 16, marginHorizontal: 4 },
  navLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  navLabelActive: { fontSize: 11, color: colors.primary, fontWeight: '700', marginTop: 2 },
  segmentWrap: { flexDirection: 'row', marginHorizontal: 16, marginTop: -16, backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: '#fff' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12, marginTop: 12 },
  avatarText: { fontSize: 24, fontWeight: '800', color: colors.primary },
  statsCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, marginTop: -24, borderWidth: 1, borderColor: colors.border },
  statsNumber: { fontSize: 32, fontWeight: '800', color: colors.primary },
  statsLabel: { fontSize: 12, color: colors.muted, marginTop: 4, letterSpacing: 1 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '600', color: colors.muted, marginBottom: 6, marginTop: 8, letterSpacing: 0.5 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
  lightBtn: { backgroundColor: colors.lightGreenBtn, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  lightBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  signInLink: { alignItems: 'center', paddingVertical: 12 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchRoute: { fontSize: 17, fontWeight: '700', color: colors.text },
  searchMeta: { fontSize: 13, color: colors.textSecondary },
  tripCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', borderWidth: 1, borderColor: colors.border },
  tripLeft: { flex: 1 },
  tripTime: { fontSize: 20, fontWeight: '800', color: colors.text },
  tripAgency: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  tripDuration: { fontSize: 12, color: colors.muted, marginTop: 4 },
  tripRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  tripPrice: { fontSize: 16, fontWeight: '800', color: colors.primary },
  selectBtn: { backgroundColor: colors.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 8 },
  selectBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  loginOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: 20, zIndex: 100 },
  loginCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 24 },
  loginClose: { position: 'absolute', right: 16, top: 16, zIndex: 1 },
  loginIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  loginTitle: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  loginSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 20 },
});
