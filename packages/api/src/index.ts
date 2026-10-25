// @urugendo/api — shared Supabase operations for the native apps.
// Uses the existing PWA schema; this package never applies migrations or changes the database.
import type { SupabaseClient, User } from '@supabase/supabase-js';

export const API_VERSION = '0.2.0';
export type UserRole = 'passenger' | 'agent' | 'checker' | 'manager' | 'boss';

export type TripRecord = {
  id: string; from: string; to: string; departureTime: string; arrivalTime: string;
  date: string; duration: string; price: number; currency: string; availableSeats: number;
  totalSeats: number; status: string; plateNumber?: string | null; operatorName: string;
  branchId?: string | null;
};
export type BookingRecord = {
  id: string; code: string; tripId: string; status: string; paymentStatus: string; passengerCount: number; paymentMessage?: string; paymentReference?: string;
  passengerName: string; passengerPhone: string; seatLabel: string; totalAmount: number;
  createdAt: string; trip?: TripRecord | null;
};
export type CreateBookingInput = {
  trip: TripRecord; passengerCount: number; passengerName: string; passengerPhone: string;
  momoName?: string; momoNumber: string; bookingCode?: string;
};
export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) { super(message); this.name = 'ApiError'; this.code = code; }
}
export function normalizeRwandaPhone(phone: string): string {
  const digits = String(phone || '').replace(/\\D/g, '');
  // MTN's published sandbox test MSISDNs are 46733123450–46733123464.
  if (/^4673312345[0-9]$/.test(digits) || /^4673312346[0-4]$/.test(digits)) return digits;
  if (digits.startsWith('250') && digits.length === 12 && /^250[7-8]\\d{8}$/.test(digits)) return digits;
  if (digits.startsWith('07') && digits.length === 10) return '250' + digits.slice(1);
  if (digits.startsWith('7') && digits.length === 9) return '250' + digits;
  if (digits.startsWith('08') && digits.length === 10) return '250' + digits.slice(1);
  if (digits.startsWith('8') && digits.length === 9) return '250' + digits;
  throw new ApiError('Enter a valid Rwanda mobile number, such as 078… or +25078…', 'INVALID_PHONE');
}
const required = (value: string, label: string) => {
  const cleaned = value?.trim();
  if (!cleaned) throw new ApiError(`${label} is required.`, 'VALIDATION');
  return cleaned;
};
const mapTrip = (row: any): TripRecord => ({
  id: row.id, from: row.route_from || row.from || '', to: row.route_to || row.to || '',
  departureTime: row.departure_time || row.departureTime || '',
  arrivalTime: row.arrival_time || row.arrivalTime || '',
  date: row.travel_date || row.date || '', duration: row.duration || '',
  price: Number(row.price ?? 0), currency: row.currency || 'RWF',
  availableSeats: Number(row.available_seats ?? row.total_seats ?? 0),
  totalSeats: Number(row.total_seats ?? 0), status: row.status || 'scheduled',
  plateNumber: row.plate_number ?? null, operatorName: row.operator?.name || 'Bus operator',
  branchId: row.origin_branch_id || row.branch_id || null,
});
const mapBooking = (row: any): BookingRecord => ({
  id: row.id, code: row.booking_code || row.short_code || '', tripId: row.trip_id,
  status: row.status || 'pending', paymentStatus: row.payment_status || 'unpaid',
  passengerName: row.passenger_name || '', passengerPhone: row.passenger_phone || '',
  seatLabel: row.seat_label || '', passengerCount: Number(row.passenger_count ?? 1), totalAmount: Number(row.total_amount ?? row.fare_amount ?? 0),
  createdAt: row.created_at || row.booking_date || '', trip: row.trip ? mapTrip(row.trip) : null,
});

export async function getCurrentUser(client: SupabaseClient): Promise<User | null> {
  const { data, error } = await client.auth.getUser();
  if (error && error.message.toLowerCase().includes('session')) return null;
  if (error) throw new ApiError(error.message, error.name);
  return data.user;
}
export async function signInPassenger(client: SupabaseClient, email: string, password: string) {
  const cleanEmail = required(email, 'Email').toLowerCase(); required(password, 'Password');
  const { data, error } = await client.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) throw new ApiError(error.message, error.name);
  return data.user;
}
export async function signUpPassenger(client: SupabaseClient, input: { email: string; password: string; fullName: string; phone: string }) {
  const email = required(input.email, 'Email').toLowerCase();
  const password = required(input.password, 'Password');
  const fullName = required(input.fullName, 'Full name'); const phone = required(input.phone, 'Phone number');
  const { data, error } = await client.auth.signUp({ email, password, options: { data: { full_name: fullName, phone, role: 'passenger' } } });
  if (error) throw new ApiError(error.message, error.name);
  if (data.user && data.session) {
    const { error: profileError } = await client.from('profiles').upsert({ id: data.user.id, full_name: fullName, phone, role: 'passenger' }, { onConflict: 'id' });
    if (profileError) throw new ApiError(`Account created, but passenger profile setup failed: ${profileError.message}`, profileError.code);
  }
  return { user: data.user, needsEmailConfirmation: !data.session };
}
export async function signOut(client: SupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) throw new ApiError(error.message, error.name);
}
export async function fetchTrips(client: SupabaseClient, filters: { from?: string; to?: string; date?: string } = {}): Promise<TripRecord[]> {
  let query = client.from('trips').select('id, route_from, route_to, departure_time, arrival_time, duration, travel_date, date, price, currency, total_seats, available_seats, status, plate_number, origin_branch_id, branch_id, operator:operators(id,name)').order('travel_date', { ascending: true }).limit(200);
  if (filters.from?.trim()) query = query.ilike('route_from', `%${filters.from.trim()}%`);
  if (filters.to?.trim()) query = query.ilike('route_to', `%${filters.to.trim()}%`);
  if (filters.date) query = query.eq('travel_date', filters.date);
  const { data, error } = await query;
  if (error) throw new ApiError(`Could not load trips: ${error.message}`, error.code);
  const rows = (data || []).filter((row: any) => !['cancelled', 'departed', 'arrived'].includes(row.status));
  if (!rows.length) return [];
  // Capacity is based on the manager-entered total_seats minus active booking passenger counts.
  // Do not rely on potentially stale available_seats values maintained by older PWA flows.
  const { data: reservations, error: reservationError } = await client.from('bookings')
    .select('trip_id, passenger_count, status')
    .in('trip_id', rows.map((row: any) => row.id))
    .not('status', 'in', '("rejected","cancelled","expired","past")');
  if (reservationError) throw new ApiError(`Could not calculate seat availability: ${reservationError.message}`, reservationError.code);
  const used = new Map<string, number>();
  for (const booking of reservations || []) {
    used.set(booking.trip_id, (used.get(booking.trip_id) || 0) + Math.max(1, Number(booking.passenger_count || 1)));
  }
  return rows.map((row: any) => {
    const trip = mapTrip(row);
    const capacity = Math.max(0, trip.totalSeats - (used.get(trip.id) || 0));
    return { ...trip, availableSeats: capacity };
  });
}
export async function fetchPassengerBookings(client: SupabaseClient): Promise<BookingRecord[]> {
  const user = await getCurrentUser(client);
  if (!user) throw new ApiError('Sign in to see your tickets.', 'SIGN_IN_REQUIRED');
  const { data, error } = await client.from('bookings').select('id, trip_id, booking_code, short_code, status, payment_status, passenger_name, passenger_phone, seat_label, passenger_count, total_amount, fare_amount, created_at, booking_date, trip:trips(id,route_from,route_to,departure_time,arrival_time,duration,travel_date,date,price,currency,total_seats,available_seats,status,plate_number,origin_branch_id,branch_id,operator:operators(id,name))').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
  if (error) throw new ApiError(`Could not load tickets: ${error.message}`, error.code);
  return (data || []).map(mapBooking);
}
function makeBookingCode() { return `URG-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }
export async function createPassengerBooking(client: SupabaseClient, input: CreateBookingInput): Promise<BookingRecord> {
  const user = await getCurrentUser(client);
  if (!user) throw new ApiError('Sign in before booking a trip.', 'SIGN_IN_REQUIRED');
  const passengerName = required(input.passengerName, 'Passenger name');
  const passengerPhone = required(input.passengerPhone, 'Passenger phone');
  const momoNumber = normalizeRwandaPhone(required(input.momoNumber, 'MoMo number'));
  const passengerCount = Math.floor(Number(input.passengerCount));
  if (!Number.isInteger(passengerCount) || passengerCount < 1 || passengerCount > 50) {
    throw new ApiError('Passenger count must be between 1 and 50.', 'VALIDATION');
  }
  if (input.trip.availableSeats < passengerCount) {
    throw new ApiError(`Only ${input.trip.availableSeats} seats remain for this trip.`, 'SOLD_OUT');
  }
  const code = input.bookingCode || makeBookingCode();
  const { data, error } = await client.rpc('create_passenger_booking', {
    p_trip_id: input.trip.id,
    p_passenger_name: passengerName,
    p_passenger_phone: passengerPhone,
    p_passenger_count: passengerCount,
    p_total_amount: Math.round(input.trip.price * passengerCount),
    p_momo_name: input.momoName?.trim() || '',
    p_momo_number: momoNumber,
    p_booking_code: code,
  });
  if (error) {
    if (error.code === 'P0001') throw new ApiError(error.message || 'There are not enough seats remaining.', 'SOLD_OUT');
    if (error.code === '42883') throw new ApiError('The capacity-booking database migration has not been applied yet. Please contact support before retrying.', 'MIGRATION_REQUIRED');
    throw new ApiError(`Booking could not be saved: ${error.message}`, error.code);
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new ApiError('The database did not return the saved booking.', 'EMPTY_BOOKING');
  let booking = mapBooking(row);
  // Initiate the real MTN sandbox request only after the atomic capacity reservation succeeds.
  const { data: paymentData, error: paymentError } = await client.functions.invoke('mtn-payment', {
    body: { bookingId: booking.id, amount: booking.totalAmount, phone: momoNumber, currency: 'RWF' },
  });
  if (paymentError || paymentData?.error) {
    booking = { ...booking, paymentMessage: paymentError?.message || paymentData?.error || 'MTN payment request could not be started.' };
    return booking;
  }
  return { ...booking, paymentReference: paymentData?.referenceId, paymentMessage: paymentData?.message || 'MTN payment request submitted. Approve the prompt on your phone.' };
}

export async function checkPassengerPaymentStatus(client: SupabaseClient, referenceId: string): Promise<{ status: string; message?: string }> {
  if (!referenceId) throw new ApiError('No MTN payment reference is available yet.', 'PAYMENT_REFERENCE_MISSING');
  const user = await getCurrentUser(client);
  if (!user) throw new ApiError('Sign in to check payment status.', 'SIGN_IN_REQUIRED');
  const { data, error } = await client.functions.invoke(`mtn-payment?action=status&referenceId=${encodeURIComponent(referenceId)}`, { method: 'GET' });
  if (error) throw new ApiError(`Could not check MTN payment: ${error.message}`, 'PAYMENT_STATUS_ERROR');
  if (data?.error) throw new ApiError(data.error, 'PAYMENT_STATUS_ERROR');
  return { status: data?.status || 'pending', message: data?.message };
}
