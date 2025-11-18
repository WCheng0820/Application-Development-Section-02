// Simple in-memory model for bookings
// This is the "Model" in MVC: holds data and basic operations.
// Uses User IDs from AuthContext for tutorId/studentId (Alice=1, Li Ming=2)

let bookings = [
  { id: 1, tutorId: 2, studentId: 1, date: "2025-11-10", time: "10:00 AM", status: "Confirmed" },
  { id: 2, tutorId: 2, studentId: 1, date: "2025-11-12", time: "4:30 PM", status: "Pending" },
  { id: 3, tutorId: 2, studentId: 1, date: "2025-11-20", time: "2:00 PM", status: "Confirmed" },
];

export function getBookings() {
  // return a shallow copy to avoid external mutation
  return bookings.slice();
}

export function findIndexById(id) {
  return bookings.findIndex((b) => b.id === id);
}

export function removeBooking(id) {
  bookings = bookings.filter((b) => b.id !== id);
  return getBookings();
}

export function reorderBookings(startIndex, endIndex) {
  const items = bookings.slice();
  if (startIndex < 0 || endIndex < 0 || startIndex >= items.length || endIndex >= items.length) {
    return getBookings();
  }
  const [moved] = items.splice(startIndex, 1);
  items.splice(endIndex, 0, moved);
  bookings = items;
  return getBookings();
}

export function addBooking(booking) {
  bookings = bookings.concat(booking);
  return getBookings();
}
