// Local copy of shared API for EAS builds (same logic as packages/api).
import type { SupabaseClient, User } from '@supabase/supabase-js';

export const API_VERSION = '0.2.0';

export type TripRecord = {
  id: string; from: string; to: string; departureTime: string; arrivalTime: string;
  date: string; duration: string; price: number; currency: string; availableSeats: number;
  totalSeats: number; status: string; plateNumber?: string | null; operatorName: string;
  branchId?: string | null;
};

export type BookingRecord = {
  id: string; code: string; tripId: string; status: string; paymentStatus: string;
  passengerCount: number; paymentMessage?: string; paymentReference?: string;
  passengerName: string; passengerPhone: string; seatLabel: string; totalAmount: number;
  createdAt: string; trip?: TripRecord | null;
};

export type CreateBookingInput = {
  trip: TripRecord; passengerCount: number; passengerName: string; passengerPhone: string;
  momoName?: string; momoNumber: string; bookingCode?: string;
};

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export function normalizeRwandaPhone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (/^4673312345[0-9]$/.test(digits) || /^4673312346[0-4]$/.test(digits)) return digits;
  if (digits.startsWith('250') && digits.length === 12 && /^250[7-8]\d{8}$/.test(digits)) return digits;
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
  id: row.id,
  from: row.route_from || row.from || '',
  to: row.route_to || row.to || '',
  departureTime: row.departure_time || row.departureTime || '',
  arrivalTime: row.arrival_time || row.arrivalTime || '',
  date: row.travel_date || row.date || '',
  duration: row.duration || '',
  price: Number(row.price ?? 0),
  currency: row.currency || 'RWF',
  availableSeats: Number(row.available_seats ?? row.total_seats ?? 0),
  totalSeats: Number(row.total_seats ?? 0),
  status: row.status || 'scheduled',
  plateNumber: row.plate_number ?? null,
  operatorName: row.operator?.name || 'Bus operator',
  branchId: row.origin_branch_id || row.branch_id || null,
});

const mapBooking = (row: any): BookingRecord => ({
  id: row.id,
  code: row.booking_code || row.short_code || '',
  tripId: row.trip_id,
  status: row.status || 'pending',
  paymentStatus: row.payment_status || 'unpaid',
  passengerName: row.passenger_name || '',
  passengerPhone: row.passenger_phone || '',
  seatLabel: row.seat_label || '',
  passengerCount: Number(row.passenger_count ?? 1),
  totalAmount: Number(row.total_amount ?? row.fare_amount ?? 0),
  createdAt: row.created_at || row.booking_date || '',
  trip: row.trip ? mapTrip(row.trip) : null,
  paymentMessage: row.payment_message,
  paymentReference: row.payment_reference,
});

export async function getCurrentUser(client: SupabaseClient): Promise<User | null> {
  const { data, error } = await client.auth.getUser();
  if (error && error.message.toLowerCase().includes('session')) return null;
  if (error) throw new ApiError(error.message, error.name);
  return data.user;
}

export async function signInPassenger(client: SupabaseClient, email: string, password: string) {
  const cleanEmail = required(email, 'Email').toLowerCase();
  required(password, 'Password');
  const { data, error } = await client.auth.signInWithPassword({ email: cleanEmail, password });
  if (error) throw new ApiError(error.message, error.name);
  return data.user;
}

export async function signUpPassenger(
  client: SupabaseClient,
  input: { email: string; password: string; fullName: string; phone?: string },
) {
  const email = required(input.email, 'Email').toLowerCase();
  const password = required(input.password, 'Password');
  const fullName = required(input.fullName, 'Full name');
  const phone = input.phone?.trim() || null;
  if (password.length < 8) throw new ApiError('Use a password with at least 8 characters.', 'WEAK_PASSWORD');
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, phone } },
  });
  if (error) throw new ApiError(error.message, error.name);
  return { user: data.user, needsEmailConfirmation: !data.session };
}

export async function signOut(client: SupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) throw new ApiError(error.message, error.name);
}

export async function fetchTrips(
  client: SupabaseClient,
  filters: { from?: string; to?: string; date?: string } = {},
): Promise<TripRecord[]> {
  let query = client
    .from('trips')
    .select(
      'id, route_from, route_to, departure_time, arrival_time, duration, travel_date, date, price, currency, total_seats, available_seats, status, plate_number, origin_branch_id, branch_id, operator:operators(id,name)',
    )
    .order('travel_date', { ascending: true })
    .limit(200);
  if (filters.from?.trim()) query = query.ilike('route_from', `%${filters.from.trim()}%`);
  if (filters.to?.trim()) query = query.ilike('route_to', `%${filters.to.trim()}%`);
  if (filters.date) query = query.eq('travel_date', filters.date);
  const { data, error } = await query;
  if (error) throw new ApiError(`Could not load trips: ${error.message}`, error.code);
  const rows = (data || []).filter((row: any) => !['cancelled', 'departed', 'arrived'].includes(row.status));
  if (!rows.length) return [];
  const { data: reservations, error: reservationError } = await client
    .from('bookings')
    .select('trip_id, passenger_count, status')
    .in(
      'trip_id',
      rows.map((row: any) => row.id),
    )
    .not('status', 'in', '("rejected","cancelled","expired","past")');
  if (reservationError) {
    throw new ApiError(`Could not calculate seat availability: ${reservationError.message}`, reservationError.code);
  }
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
  const { data, error } = await client
    .from('bookings')
    .select(
      'id, trip_id, booking_code, short_code, status, payment_status, passenger_name, passenger_phone, seat_label, passenger_count, total_amount, fare_amount, created_at, booking_date, trip:trips(id,route_from,route_to,departure_time,arrival_time,duration,travel_date,date,price,currency,total_seats,available_seats,status,plate_number,origin_branch_id,branch_id,operator:operators(id,name))',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new ApiError(`Could not load tickets: ${error.message}`, error.code);
  return (data || []).map(mapBooking);
}

export async function createPassengerBooking(
  client: SupabaseClient,
  input: CreateBookingInput,
): Promise<BookingRecord> {
  const user = await getCurrentUser(client);
  if (!user) throw new ApiError('Sign in to book a trip.', 'SIGN_IN_REQUIRED');
  const passengerName = required(input.passengerName, 'Passenger name');
  const passengerPhone = normalizeRwandaPhone(required(input.passengerPhone, 'Passenger phone'));
  const momoNumber = normalizeRwandaPhone(required(input.momoNumber, 'MoMo number'));
  const count = Math.max(1, Number(input.passengerCount) || 1);
  if (count > input.trip.availableSeats) {
    throw new ApiError('Not enough seats left on this trip.', 'NO_SEATS');
  }
  const totalAmount = input.trip.price * count;
  const code =
    input.bookingCode ||
    `URG-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-3)}`;
  const { data, error } = await client
    .from('bookings')
    .insert({
      user_id: user.id,
      trip_id: input.trip.id,
      booking_code: code,
      passenger_name: passengerName,
      passenger_phone: passengerPhone,
      passenger_count: count,
      total_amount: totalAmount,
      fare_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      momo_name: input.momoName || null,
      momo_number: momoNumber,
    })
    .select(
      'id, trip_id, booking_code, short_code, status, payment_status, passenger_name, passenger_phone, seat_label, passenger_count, total_amount, fare_amount, created_at, booking_date',
    )
    .single();
  if (error) throw new ApiError(`Could not save booking: ${error.message}`, error.code);
  return mapBooking({ ...data, trip: input.trip });
}

export async function checkPassengerPaymentStatus(
  client: SupabaseClient,
  referenceId: string,
): Promise<{ status: string; message?: string }> {
  const { data, error } = await client.functions.invoke('check-payment', {
    body: { referenceId },
  });
  if (error) throw new ApiError(error.message || 'Could not check payment status.');
  return {
    status: data?.status || 'unknown',
    message: data?.message,
  };
}

export async function signInPassengerWithPhone(client: SupabaseClient, phone: string, password: string) {
  const msisdn = normalizeRwandaPhone(required(phone, 'Phone'));
  required(password, 'Password');
  const email = `${msisdn}@phone.urugendo.local`;
  return signInPassenger(client, email, password);
}

export async function signUpPassengerWithPhone(
  client: SupabaseClient,
  input: { phone: string; password: string; fullName: string },
) {
  const msisdn = normalizeRwandaPhone(required(input.phone, 'Phone'));
  const password = required(input.password, 'Password');
  const fullName = required(input.fullName, 'Full name');
  const email = `${msisdn}@phone.urugendo.local`;
  const result = await signUpPassenger(client, { email, password, fullName, phone: msisdn });
  return {
    ...result,
    phone: msisdn,
    fullName,
    needsPhoneConfirmation: result.needsEmailConfirmation,
  };
}

export async function verifyPassengerPhone(
  client: SupabaseClient,
  phone: string,
  token: string,
  fullName: string,
) {
  const msisdn = normalizeRwandaPhone(required(phone, 'Phone'));
  required(token, 'Code');
  const { data, error } = await client.auth.verifyOtp({
    phone: `+${msisdn}`,
    token,
    type: 'sms',
  });
  if (error) throw new ApiError(error.message, error.name);
  return data.user;
}
