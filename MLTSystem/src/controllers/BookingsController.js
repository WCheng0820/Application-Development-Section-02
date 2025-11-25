// Controller layer: orchestrates model operations and provides a clean API for views
import * as BookingModel from "../models/BookingModel";

export function fetchBookings() {
  // In a real app this might be async and fetch from an API
  return BookingModel.getBookings();
}

export function cancelBooking(id) {
  return BookingModel.removeBooking(id);
}

export function moveBookingByIndex(fromIndex, toIndex) {
  return BookingModel.reorderBookings(fromIndex, toIndex);
}

export function moveBookingById(id, toIndex) {
  const idx = BookingModel.findIndexById(id);
  if (idx === -1) return BookingModel.getBookings();
  return BookingModel.reorderBookings(idx, toIndex);
}

export function addBooking(booking) {
  return BookingModel.addBooking(booking);
}
