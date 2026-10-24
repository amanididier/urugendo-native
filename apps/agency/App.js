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

const ROLES = [
  {
    id: 'agent',
    title: 'Agent',
    subtitle: 'Counter staff · one branch',
    desc: 'Sell tickets, confirm MoMo, print manifests',
    icon: '🏪',
  },
  {
    id: 'checker',
    title: 'Ticket Checker',
    subtitle: 'At the bus door',
    desc: 'Scan QR or look up tickets and board passengers',
    icon: '📱',
  },
  {
    id: 'manager',
    title: 'Branch Manager',
    subtitle: 'Runs a branch',
    desc: 'Schedule buses, assign checkers, approve staff',
    icon: '🚌',
  },
  {
    id: 'boss',
    title: 'Agency Boss',
    subtitle: 'Company owner',
    desc: 'Money across every branch, payouts, rankings',
    icon: '👑',
  },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🚌</Text>
          </View>
          <Text style={styles.logoText}>Urugendo Agency</Text>
        </View>

        <Text style={styles.headline}>Choose your role</Text>
        <Text style={styles.subhead}>
          Each person gets only the tools they need. Pick a role to continue.
        </Text>

        {ROLES.map((role) => (
          <TouchableOpacity key={role.id} style={styles.roleCard} activeOpacity={0.85}>
            <View style={styles.roleIconWrap}>
              <Text style={styles.roleIcon}>{role.icon}</Text>
            </View>
            <View style={styles.roleBody}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
              <Text style={styles.roleDesc}>{role.desc}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingBottom: 40 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 22 },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subhead: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 28,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  roleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleIcon: { fontSize: 24 },
  roleBody: { flex: 1 },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  roleSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  roleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
