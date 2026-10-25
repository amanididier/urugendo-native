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
  id: string; code: string; tripId: string; status: string; paymentStatus: string;
  passengerName: string; passengerPhone: string; seatLabel: string; totalAmount: number;
  createdAt: string; trip?: TripRecord | null;
};
export type CreateBookingInput = {
  trip: TripRecord; seatLabel: string; passengerName: string; passengerPhone: string;
  momoName?: string; momoNumber: string; bookingCode?: string;
};
export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) { super(message); this.name = 'ApiError'; this.code = code; }
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
  seatLabel: row.seat_label || '', totalAmount: Number(row.total_amount ?? row.fare_amount ?? 0),
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
  return (data || []).filter((row: any) => !['cancelled', 'departed', 'arrived'].includes(row.status)).map(mapTrip);
}
export async function fetchPassengerBookings(client: SupabaseClient): Promise<BookingRecord[]> {
  const user = await getCurrentUser(client);
  if (!user) throw new ApiError('Sign in to see your tickets.', 'SIGN_IN_REQUIRED');
  const { data, error } = await client.from('bookings').select('id, trip_id, booking_code, short_code, status, payment_status, passenger_name, passenger_phone, seat_label, total_amount, fare_amount, created_at, booking_date, trip:trips(id,route_from,route_to,departure_time,arrival_time,duration,travel_date,date,price,currency,total_seats,available_seats,status,plate_number,origin_branch_id,branch_id,operator:operators(id,name))').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100);
  if (error) throw new ApiError(`Could not load tickets: ${error.message}`, error.code);
  return (data || []).map(mapBooking);
}
function makeBookingCode() { return `URG-${Math.random().toString(36).slice(2, 6).toUpperCase()}`; }
export async function createPassengerBooking(client: SupabaseClient, input: CreateBookingInput): Promise<BookingRecord> {
  const user = await getCurrentUser(client);
  if (!user) throw new ApiError('Sign in before booking a trip.', 'SIGN_IN_REQUIRED');
  const passengerName = required(input.passengerName, 'Passenger name');
  const passengerPhone = required(input.passengerPhone, 'Passenger phone');
  const seatLabel = required(input.seatLabel, 'Seat');
  const momoNumber = required(input.momoNumber, 'MoMo number');
  if (input.trip.availableSeats <= 0) throw new ApiError('This trip has no available seats.', 'SOLD_OUT');
  const code = input.bookingCode || makeBookingCode();
  const payload: Record<string, unknown> = {
    trip_id: input.trip.id, seat_id: null, seat_label: seatLabel, passenger_name: passengerName,
    passenger_phone: passengerPhone, booking_code: code, short_code: code,
    fare_amount: input.trip.price, total_amount: input.trip.price, booking_fee: 0,
    payment_method: 'MTN MoMo', user_id: user.id, branch_id: input.trip.branchId || null,
    agency_branch: input.trip.from || null, status: 'payment_submitted',
    booking_date: new Date().toISOString().slice(0, 10), momo_name: input.momoName?.trim() || null,
    momo_number: momoNumber, payment_status: 'submitted',
  };
  const { data, error } = await client.from('bookings').insert(payload).select('id, trip_id, booking_code, short_code, status, payment_status, passenger_name, passenger_phone, seat_label, total_amount, fare_amount, created_at, booking_date').single();
  if (error) {
    if (error.code === '23505') throw new ApiError('That seat has just been booked. Choose another seat.', error.code);
    throw new ApiError(`Booking could not be saved: ${error.message}`, error.code);
  }
  return mapBooking(data);
}
