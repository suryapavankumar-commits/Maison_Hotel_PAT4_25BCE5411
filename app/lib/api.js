/*
 * Maison local-demo data layer.
 * All records are stored in this browser's localStorage; no backend/database is required.
 * Demo login: admin@maisonhotel.com / Admin@123
 */
const STORAGE_KEY = 'maison-hotel-data-v1';
const ACCOUNTS_KEY = 'maison-hotel-accounts-v1';

function readAccounts() {
  try { return JSON.parse(window.localStorage.getItem(ACCOUNTS_KEY) || '[]'); }
  catch (_) { return []; }
}
function writeAccounts(accounts) { window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }
async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) throw new Error('Your browser cannot create a local account securely. Please use a recent version of Chrome, Edge or Firefox.');
  const bytes = new TextEncoder().encode(String(password));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
function publicAccount(account) {
  const { passwordHash, ...safe } = account;
  return safe;
}

function localDate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function today() { return localDate(new Date()); }
function addDays(base, amount) {
  const d = new Date(`${base}T12:00:00`);
  d.setDate(d.getDate() + amount);
  return localDate(d);
}
function prettyDate(value) {
  if (!value) return '';
  const d = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}
function initialData() {
  const t = today();
  const guests = [
    { id: 1, name: 'Aarav Mehta', email: 'aarav.mehta@example.com', phone: '+91 98765 12001', stays: 4, tier: 'GOLD' },
    { id: 2, name: 'Priya Sharma', email: 'priya.sharma@example.com', phone: '+91 98765 12002', stays: 2, tier: 'SILVER' },
    { id: 3, name: 'Daniel Wong', email: 'daniel.wong@example.com', phone: '+65 8123 4410', stays: 1, tier: 'STANDARD' },
    { id: 4, name: 'Ananya Rao', email: 'ananya.rao@example.com', phone: '+91 98765 12004', stays: 6, tier: 'GOLD' },
    { id: 5, name: 'Kabir Shah', email: 'kabir.shah@example.com', phone: '+91 98765 12005', stays: 1, tier: 'STANDARD' },
  ];
  const rooms = [
    { id: 101, roomNumber: '101', type: 'Deluxe King', rate: 9500, status: 'OCCUPIED' },
    { id: 118, roomNumber: '118', type: 'Garden Suite', rate: 12500, status: 'AVAILABLE' },
    { id: 212, roomNumber: '212', type: 'Deluxe King', rate: 9500, status: 'OCCUPIED' },
    { id: 307, roomNumber: '307', type: 'Premier Suite', rate: 18500, status: 'AVAILABLE' },
    { id: 302, roomNumber: '302', type: 'Executive King', rate: 15000, status: 'AVAILABLE' },
    { id: 401, roomNumber: '401', type: 'Signature Suite', rate: 24500, status: 'AVAILABLE' },
  ];
  const reservations = [
    { id: 204, reference: 'MA-204', guestId: 1, roomId: 101, checkInIso: addDays(t, -2), checkOutIso: addDays(t, 1), status: 'CHECKED IN', notes: '' },
    { id: 118, reference: 'MA-118', guestId: 2, roomId: 118, checkInIso: t, checkOutIso: addDays(t, 2), status: 'CONFIRMED', notes: '' },
    { id: 307, reference: 'MA-307', guestId: 3, roomId: 307, checkInIso: addDays(t, 1), checkOutIso: addDays(t, 3), status: 'CONFIRMED', notes: '' },
    { id: 212, reference: 'MA-212', guestId: 4, roomId: 212, checkInIso: addDays(t, -1), checkOutIso: addDays(t, 1), status: 'CHECKED IN', notes: '' },
    { id: 401, reference: 'MA-401', guestId: 5, roomId: 401, checkInIso: addDays(t, 2), checkOutIso: addDays(t, 5), status: 'PENDING', notes: '' },
  ];
  const invoices = [
    { id: 1, invoiceNo: 'INV-2026-014', guestId: 1, amount: 28500, status: 'PAID', createdAt: t },
    { id: 2, invoiceNo: 'INV-2026-015', guestId: 2, amount: 25000, status: 'PENDING', createdAt: t },
    { id: 3, invoiceNo: 'INV-2026-016', guestId: 4, amount: 19000, status: 'PAID', createdAt: addDays(t, -1) },
  ];
  const housekeeping = [
    { id: 1, roomNumber: '101', task: 'Departure clean', assignedTo: 'Meera', priority: 'HIGH', status: 'IN PROGRESS' },
    { id: 2, roomNumber: '212', task: 'Refresh amenities', assignedTo: 'Ravi', priority: 'NORMAL', status: 'PENDING' },
    { id: 3, roomNumber: '118', task: 'Arrival inspection', assignedTo: 'Anil', priority: 'HIGH', status: 'PENDING' },
    { id: 4, roomNumber: '307', task: 'Turndown service', assignedTo: 'Meera', priority: 'NORMAL', status: 'COMPLETED' },
  ];
  return { guests, rooms, reservations, invoices, housekeeping, nextGuestId: 6, nextRoomId: 402, nextReservationId: 402, nextInvoiceId: 4, nextHousekeepingId: 5 };
}
function normalizeData(data) {
  data = data && typeof data === 'object' ? data : {};
  for (const key of ['guests', 'rooms', 'reservations', 'invoices', 'housekeeping']) {
    if (!Array.isArray(data[key])) data[key] = [];
  }
  data.invoices = data.invoices.map(invoice => {
    const next = { ...invoice };
    if (!Array.isArray(next.payments)) next.payments = [];
    if (!Number.isFinite(Number(next.paidAmount))) next.paidAmount = next.status === 'PAID' ? Number(next.amount || 0) : 0;
    next.paidAmount = Math.max(0, Math.min(Number(next.amount || 0), Number(next.paidAmount || 0)));
    if (next.status !== 'CANCELLED') next.status = next.paidAmount >= Number(next.amount || 0) ? 'PAID' : next.paidAmount > 0 ? 'PARTIAL' : 'PENDING';
    return next;
  });
  const nextId = (rows, fallback) => Math.max(fallback, ...rows.map(row => Number(row.id) + 1).filter(Number.isFinite));
  data.nextGuestId = nextId(data.guests, Number(data.nextGuestId || 1));
  data.nextRoomId = nextId(data.rooms, Number(data.nextRoomId || 1));
  data.nextReservationId = nextId(data.reservations, Number(data.nextReservationId || 1));
  data.nextInvoiceId = nextId(data.invoices, Number(data.nextInvoiceId || 1));
  data.nextHousekeepingId = nextId(data.housekeeping, Number(data.nextHousekeepingId || 1));
  return data;
}
function readData() {
  if (typeof window === 'undefined') throw new Error('This feature is available in the browser.');
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const data = normalizeData(JSON.parse(existing));
      writeData(data); // migrate older local-demo records without clearing user data
      return data;
    }
  } catch (_) { /* recover from malformed local data by reseeding */ }
  const data = normalizeData(initialData());
  writeData(data);
  return data;
}
function writeData(data) { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function reservationConflict(data, roomId, checkInIso, checkOutIso, excludeId) {
  return data.reservations.some(r => Number(r.roomId) === Number(roomId) && Number(r.id) !== Number(excludeId) && !['CANCELLED', 'CHECKED OUT'].includes(r.status) && checkInIso < r.checkOutIso && checkOutIso > r.checkInIso);
}
function setReservationStatus(data, reservation, status) {
  reservation.status = status;
  if (status === 'CANCELLED') {
    data.invoices.forEach(invoice => { if (Number(invoice.reservationId) === Number(reservation.id) && Number(invoice.paidAmount || 0) === 0) invoice.status = 'CANCELLED'; });
  }
  if (status === 'CHECKED IN') {
    const room = getRoom(data, reservation.roomId); if (room) room.status = 'OCCUPIED';
  } else if (status === 'CHECKED OUT') {
    const room = getRoom(data, reservation.roomId); if (room && room.status === 'OCCUPIED') room.status = 'CLEANING';
  }
}
function getGuest(data, id) { return data.guests.find(g => Number(g.id) === Number(id)); }
function getRoom(data, id) { return data.rooms.find(r => Number(r.id) === Number(id)); }
function mapReservation(data, r) {
  const guest = getGuest(data, r.guestId) || {};
  const room = getRoom(data, r.roomId) || {};
  return { ...r, guestName: guest.name || 'Unknown guest', guestEmail: guest.email || '', roomType: room.type || 'Unassigned', roomNumber: room.roomNumber || '', checkIn: prettyDate(r.checkInIso), checkOut: prettyDate(r.checkOutIso) };
}
function dashboard(data) {
  const t = today();
  const occupied = data.rooms.filter(r => r.status === 'OCCUPIED').length;
  const upcoming = data.reservations.filter(r => r.status !== 'CANCELLED' && r.checkInIso >= t).sort((a,b) => a.checkInIso.localeCompare(b.checkInIso)).slice(0, 5).map(r => {
    const item = mapReservation(data, r);
    return { reference: item.reference, guestName: item.guestName, roomType: item.roomType, arrival: item.checkIn, status: item.status };
  });
  return {
    occupancy: data.rooms.length ? Math.round(occupied / data.rooms.length * 100) : 0,
    occupiedRooms: occupied,
    totalRooms: data.rooms.length,
    arrivalsToday: data.reservations.filter(r => r.status !== 'CANCELLED' && r.checkInIso === t).length,
    departuresToday: data.reservations.filter(r => r.status !== 'CANCELLED' && r.checkOutIso === t).length,
    revenueToday: data.invoices.filter(i => i.status === 'PAID' && i.createdAt === t).reduce((sum, i) => sum + Number(i.amount || 0), 0),
    arrivals: upcoming,
  };
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(path, 'http://maison.local');
  const pathname = url.pathname.replace(/^\/+/, '');
  let body = {};
  if (options.body) {
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; }
    catch (_) { throw new Error('The submitted form could not be read. Please try again.'); }
  }
  // Tiny delay gives forms a natural loading state without depending on a server.
  await Promise.resolve();

  if (pathname === 'auth/login' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) throw new Error('Enter your work email and password to continue.');

    if (email === 'admin@maisonhotel.com' && password === 'Admin@123') {
      return { user: { id: 'demo-admin', name: 'Maison Administrator', email, role: 'ADMIN', title: 'Hotel Administrator', department: 'Management', hotelName: 'Maison Chennai', isDemo: true } };
    }

    const account = readAccounts().find(item => item.email === email);
    if (!account) throw new Error('We could not find an account with that email. Check it or create an account.');
    const passwordHash = await hashPassword(password);
    if (account.passwordHash !== passwordHash) throw new Error('That password does not match this account. Try again.');
    return { user: publicAccount(account) };
  }

  if (pathname === 'auth/register' && method === 'POST') {
    const fullName = String(body.fullName || '').trim().replace(/\s+/g, ' ');
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const hotelName = String(body.hotelName || '').trim();
    const title = String(body.title || '').trim();
    const department = String(body.department || '').trim();
    const password = String(body.password || '');
    const phoneDigits = phone.replace(/\D/g, '');

    if (fullName.length < 2) throw new Error('Enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid work email address.');
    if (phoneDigits.length < 8 || phoneDigits.length > 15) throw new Error('Enter a phone number with 8–15 digits.');
    if (hotelName.length < 2) throw new Error('Enter your hotel or property name.');
    if (!title) throw new Error('Choose or enter your job title.');
    if (!department) throw new Error('Select your department.');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) throw new Error('Use at least 8 characters, including a letter and a number.');
    if (email === 'admin@maisonhotel.com' || readAccounts().some(item => item.email === email)) throw new Error('An account with this email already exists. Sign in instead.');

    const accounts = readAccounts();
    const account = {
      id: `staff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: fullName,
      email,
      phone,
      hotelName,
      title,
      department,
      role: department === 'Management' ? 'MANAGER' : 'STAFF',
      createdAt: new Date().toISOString(),
      passwordHash: await hashPassword(password),
    };
    accounts.push(account);
    writeAccounts(accounts);
    return { user: publicAccount(account) };
  }

  const data = readData();
  if (pathname === 'dashboard' && method === 'GET') return dashboard(data);

  if (pathname === 'guests' && method === 'GET') return data.guests.slice().sort((a,b) => a.name.localeCompare(b.name));
  if (pathname === 'guests' && method === 'POST') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!body.name?.trim() || !email) throw new Error('Enter a guest name and email.');
    if (data.guests.some(g => g.email.toLowerCase() === email)) throw new Error('A guest with this email already exists.');
    const guest = { id: data.nextGuestId++, name: String(body.name).trim(), email, phone: String(body.phone || '').trim(), stays: 0, tier: 'STANDARD' };
    data.guests.push(guest); writeData(data); return guest;
  }
  const guestMatch = pathname.match(/^guests\/(\d+)$/);
  if (guestMatch && method === 'PUT') {
    const guest = getGuest(data, Number(guestMatch[1]));
    if (!guest) throw new Error('Guest not found.');
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    if (name.length < 2) throw new Error('Enter a guest name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid guest email.');
    if (data.guests.some(g => Number(g.id) !== guest.id && g.email.toLowerCase() === email)) throw new Error('Another guest already uses this email.');
    Object.assign(guest, { name, email, phone }); writeData(data); return guest;
  }
  if (guestMatch && method === 'DELETE') {
    const id = Number(guestMatch[1]);
    if (data.reservations.some(r => Number(r.guestId) === id) || data.invoices.some(i => Number(i.guestId) === id)) throw new Error('This guest has reservation or invoice history. Edit the record instead of deleting it.');
    data.guests = data.guests.filter(g => Number(g.id) !== id); writeData(data); return { ok: true };
  }

  if (pathname === 'rooms' && method === 'GET') {
    let rows = data.rooms.slice().sort((a,b) => String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, {numeric:true}));
    const status = url.searchParams.get('status');
    if (status) rows = rows.filter(r => r.status === status);
    return rows;
  }
  if (pathname === 'rooms' && method === 'POST') {
    const roomNumber = String(body.roomNumber || '').trim();
    if (!roomNumber || !body.type || !Number.isFinite(Number(body.rate)) || Number(body.rate) < 0) throw new Error('Enter a room number, type and valid nightly rate.');
    if (data.rooms.some(r => String(r.roomNumber).toLowerCase() === roomNumber.toLowerCase())) throw new Error('That room number already exists.');
    const room = { id: data.nextRoomId++, roomNumber, type: String(body.type), rate: Number(body.rate), status: 'AVAILABLE' };
    data.rooms.push(room); writeData(data); return room;
  }
  const roomMatch = pathname.match(/^rooms\/(\d+)$/);
  if (roomMatch && method === 'PUT') {
    const room = getRoom(data, Number(roomMatch[1]));
    if (!room) throw new Error('Room not found.');
    const roomNumber = String(body.roomNumber || room.roomNumber).trim();
    const type = String(body.type || room.type).trim();
    const rate = Number(body.rate ?? room.rate);
    const status = String(body.status || room.status);
    if (!roomNumber || !type || !Number.isFinite(rate) || rate < 0) throw new Error('Enter a room number, type and valid nightly rate.');
    if (data.rooms.some(r => Number(r.id) !== room.id && String(r.roomNumber).toLowerCase() === roomNumber.toLowerCase())) throw new Error('That room number already exists.');
    if (!['AVAILABLE', 'OCCUPIED', 'CLEANING', 'OUT OF SERVICE'].includes(status)) throw new Error('Choose a valid room status.');
    Object.assign(room, { roomNumber, type, rate, status }); writeData(data); return room;
  }
  if (roomMatch && method === 'DELETE') {
    const id = Number(roomMatch[1]);
    if (data.reservations.some(r => Number(r.roomId) === id && !['CANCELLED', 'CHECKED OUT'].includes(r.status))) throw new Error('This room has active reservations. Cancel or check out those reservations first.');
    data.rooms = data.rooms.filter(r => Number(r.id) !== id); writeData(data); return { ok: true };
  }

  if (pathname === 'reservations' && method === 'GET') return data.reservations.slice().sort((a,b) => a.checkInIso.localeCompare(b.checkInIso)).map(r => mapReservation(data,r));
  if (pathname === 'reservations' && method === 'POST') {
    const guestId = Number(body.guestId), roomId = Number(body.roomId);
    const guest = getGuest(data, guestId), room = getRoom(data, roomId);
    const checkInIso = String(body.checkIn || ''), checkOutIso = String(body.checkOut || '');
    if (!guest) throw new Error('Select a valid guest. Add the guest first if needed.');
    if (!room || room.status !== 'AVAILABLE') throw new Error('Select an available room.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkInIso) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOutIso) || checkOutIso <= checkInIso) throw new Error('Check-out must be after check-in.');
    const conflict = reservationConflict(data, roomId, checkInIso, checkOutIso);
    if (conflict) throw new Error('This room is already reserved for some of those dates. Choose different dates or room.');
    const id = data.nextReservationId++;
    const reference = `MA-${String(id).padStart(3,'0')}`;
    const reservation = { id, reference, guestId, roomId, checkInIso, checkOutIso, status: String(body.status || 'CONFIRMED'), notes: String(body.notes || '').trim() };
    data.reservations.push(reservation);
    const nights = Math.max(1, Math.round((new Date(`${checkOutIso}T12:00:00`) - new Date(`${checkInIso}T12:00:00`)) / 86400000));
    const invoiceId = data.nextInvoiceId++;
    data.invoices.push({ id: invoiceId, invoiceNo: `INV-${new Date().getFullYear()}-${String(100 + invoiceId).padStart(3,'0')}`, guestId, amount: nights * Number(room.rate), paidAmount: 0, payments: [], status: 'PENDING', description: `Accommodation · Room ${room.roomNumber} · ${nights} night${nights === 1 ? '' : 's'}`, createdAt: today(), reservationId: id });
    writeData(data);
    return mapReservation(data, reservation);
  }
  const reservationMatch = pathname.match(/^reservations\/(\d+)$/);
  if (reservationMatch && method === 'PUT') {
    const reservation = data.reservations.find(r => Number(r.id) === Number(reservationMatch[1]));
    if (!reservation) throw new Error('Reservation not found.');
    const status = String(body.status || reservation.status).toUpperCase();
    if (!['PENDING', 'CONFIRMED', 'CHECKED IN', 'CHECKED OUT', 'CANCELLED'].includes(status)) throw new Error('Choose a valid reservation status.');
    if (body.statusOnly) {
      setReservationStatus(data, reservation, status); writeData(data); return mapReservation(data, reservation);
    }
    const guestId = Number(body.guestId ?? reservation.guestId);
    const roomId = Number(body.roomId ?? reservation.roomId);
    const checkInIso = String(body.checkIn || reservation.checkInIso);
    const checkOutIso = String(body.checkOut || reservation.checkOutIso);
    if (!getGuest(data, guestId)) throw new Error('Select a valid guest.');
    const room = getRoom(data, roomId);
    if (!room) throw new Error('Select a valid room.');
    if (room.status !== 'AVAILABLE' && Number(room.id) !== Number(reservation.roomId) && !['CANCELLED','CHECKED OUT'].includes(reservation.status)) throw new Error('Select an available room.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkInIso) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOutIso) || checkOutIso <= checkInIso) throw new Error('Check-out must be after check-in.');
    if (reservationConflict(data, roomId, checkInIso, checkOutIso, reservation.id)) throw new Error('This room is already reserved for those dates.');
    Object.assign(reservation, { guestId, roomId, checkInIso, checkOutIso, notes: String(body.notes ?? reservation.notes ?? '').trim() });
    setReservationStatus(data, reservation, status);
    const invoice = data.invoices.find(i => Number(i.reservationId) === Number(reservation.id) && Number(i.paidAmount || 0) === 0 && i.status !== 'CANCELLED');
    if (invoice) {
      const nights = Math.max(1, Math.round((new Date(`${checkOutIso}T12:00:00`) - new Date(`${checkInIso}T12:00:00`)) / 86400000));
      invoice.guestId = guestId; invoice.amount = Math.round(nights * Number(room.rate) * 100) / 100;
      invoice.description = `Accommodation · Room ${room.roomNumber} · ${nights} night${nights === 1 ? '' : 's'}`;
    }
    writeData(data); return mapReservation(data, reservation);
  }

  if (pathname === 'housekeeping' && method === 'GET') return data.housekeeping.slice();
  if (pathname === 'housekeeping' && method === 'POST') {
    const roomNumber = String(body.roomNumber || '').trim();
    const taskName = String(body.task || '').trim();
    if (!roomNumber || !taskName) throw new Error('Choose a room and enter a task description.');
    if (!data.rooms.some(r => String(r.roomNumber) === roomNumber)) throw new Error('Choose an existing room.');
    const task = { id: data.nextHousekeepingId++, roomNumber, task: taskName, assignedTo: String(body.assignedTo || '').trim(), priority: ['NORMAL','HIGH','URGENT'].includes(body.priority) ? body.priority : 'NORMAL', status: 'PENDING' };
    data.housekeeping.push(task); writeData(data); return task;
  }
  const hkMatch = pathname.match(/^housekeeping\/(\d+)$/);
  if (hkMatch && method === 'PUT') {
    const task = data.housekeeping.find(t => t.id === Number(hkMatch[1]));
    if (!task) throw new Error('Housekeeping task not found.');
    if (!['PENDING', 'IN PROGRESS', 'COMPLETED'].includes(body.status)) throw new Error('Choose a valid task status.');
    task.status = body.status; writeData(data); return task;
  }

  if (pathname === 'billing' && method === 'GET') {
    const t = today();
    const ledger = data.invoices.slice().sort((a,b) => b.id-a.id).map(i => ({ ...i, paidAmount: Number(i.paidAmount || 0), balance: Math.max(0, Number(i.amount || 0) - Number(i.paidAmount || 0)), guestName: getGuest(data, i.guestId)?.name || 'Unknown guest' }));
    const revenue = data.invoices.reduce((sum, invoice) => {
      const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
      if (payments.length) return sum + payments.filter(payment => payment.date === t).reduce((subtotal, payment) => subtotal + Number(payment.amount || 0), 0);
      return sum + (invoice.status === 'PAID' && (invoice.paidAt || invoice.createdAt) === t ? Number(invoice.amount || 0) : 0);
    }, 0);
    return {
      revenue,
      openAmount: data.invoices.filter(i => i.status !== 'CANCELLED').reduce((sum,i) => sum + Math.max(0, Number(i.amount || 0) - Number(i.paidAmount || 0)), 0),
      openCount: data.invoices.filter(i => !['PAID','CANCELLED'].includes(i.status)).length,
      invoiceCount: data.invoices.filter(i => i.status !== 'CANCELLED').length,
      ledger,
      guests: data.guests.slice().sort((a,b) => a.name.localeCompare(b.name)),
    };
  }
  if (pathname === 'billing' && method === 'POST') {
    const guestId = Number(body.guestId);
    const guest = getGuest(data, guestId);
    const amount = Number(body.amount);
    const description = String(body.description || '').trim();
    if (!guest) throw new Error('Choose a guest for this invoice.');
    if (!description) throw new Error('Enter a description for this invoice.');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.');
    const id = data.nextInvoiceId++;
    const invoice = { id, invoiceNo: `INV-${new Date().getFullYear()}-${String(100 + id).padStart(3,'0')}`, guestId, amount: Math.round(amount * 100) / 100, paidAmount: 0, payments: [], description, status: 'PENDING', createdAt: today(), paymentMethod: '', paymentReference: '', paidAt: '', source: 'MANUAL' };
    data.invoices.push(invoice); writeData(data);
    return { ...invoice, guestName: guest.name };
  }
  const invoiceMatch = pathname.match(/^billing\/(\d+)\/payment$/);
  if (invoiceMatch && method === 'PUT') {
    const invoice = data.invoices.find(i => i.id === Number(invoiceMatch[1]));
    if (!invoice) throw new Error('Invoice not found.');
    const paymentMethod = String(body.paymentMethod || '').trim();
    const paymentReference = String(body.paymentReference || '').trim();
    const remaining = Math.max(0, Number(invoice.amount || 0) - Number(invoice.paidAmount || 0));
    const amountReceived = Number(body.amountReceived ?? remaining);
    if (invoice.status === 'CANCELLED') throw new Error('A cancelled invoice cannot receive a payment.');
    if (!['Cash', 'Card terminal', 'Bank transfer', 'UPI', 'Other'].includes(paymentMethod)) throw new Error('Choose a payment method.');
    if (!Number.isFinite(amountReceived) || amountReceived <= 0) throw new Error('Enter a payment amount greater than zero.');
    if (amountReceived > remaining + 0.005) throw new Error(`This invoice only has ${remaining.toFixed(2)} outstanding.`);
    invoice.payments = Array.isArray(invoice.payments) ? invoice.payments : [];
    const paymentRecord = { id: `${invoice.id}-${Date.now()}`, amount: Math.round(amountReceived * 100) / 100, paymentMethod, paymentReference, date: today(), recordedAt: new Date().toISOString() };
    invoice.payments.push(paymentRecord);
    invoice.paidAmount = Math.round((Number(invoice.paidAmount || 0) + paymentRecord.amount) * 100) / 100;
    invoice.status = invoice.paidAmount >= Number(invoice.amount || 0) - 0.005 ? 'PAID' : 'PARTIAL';
    invoice.paymentMethod = paymentMethod; invoice.paymentReference = paymentReference;
    invoice.paidAt = invoice.status === 'PAID' ? today() : '';
    writeData(data);
    return { ...invoice, balance: Math.max(0, Number(invoice.amount || 0) - invoice.paidAmount), guestName: getGuest(data, invoice.guestId)?.name || 'Unknown guest' };
  }

  if (pathname === 'backup' && method === 'GET') {
    return { format: 'maison-hotel-local-backup', version: 2, exportedAt: new Date().toISOString(), data: readData() };
  }
  if (pathname === 'backup' && method === 'POST') {
    const incoming = body.data || body;
    if (!incoming || !Array.isArray(incoming.guests) || !Array.isArray(incoming.rooms) || !Array.isArray(incoming.reservations) || !Array.isArray(incoming.invoices) || !Array.isArray(incoming.housekeeping)) throw new Error('This file is not a valid Maison data backup. Nothing was changed.');
    if (incoming.guests.some(g => !g || !Number.isFinite(Number(g.id)) || !String(g.name || '').trim()) || incoming.rooms.some(r => !r || !Number.isFinite(Number(r.id)) || !String(r.roomNumber || '').trim())) throw new Error('The backup contains invalid guest or room records. Nothing was changed.');
    const restored = normalizeData(JSON.parse(JSON.stringify(incoming)));
    writeData(restored);
    return { ok: true, counts: { guests: restored.guests.length, rooms: restored.rooms.length, reservations: restored.reservations.length, invoices: restored.invoices.length, housekeeping: restored.housekeeping.length } };
  }

  throw new Error(`This action is not supported in the local demo: ${method} /${pathname}`);
}
