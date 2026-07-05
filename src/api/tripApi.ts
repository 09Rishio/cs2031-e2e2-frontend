import api from "./api";
import type { Trip, User } from "../types";

export async function getAvailableDrivers() {
  const response = await api.get<User[]>("/drivers/available");
  return response.data;
}

export async function createTrip(data: {
  pickupAddress: string;
  dropoffAddress: string;
}) {
  const response = await api.post<Trip>("/trips", data);
  return response.data;
}

export async function getPassengerTrips() {
  const response = await api.get<Trip[]>("/trips");
  return response.data;
}

export async function getPendingTrips() {
  const response = await api.get<Trip[]>("/trips/pending");
  return response.data;
}

export async function getDriverTrips() {
  const response = await api.get<Trip[]>("/trips/my");
  return response.data;
}

export async function getTripById(id: number) {
  const response = await api.get<Trip>(`/trips/${id}`);
  return response.data;
}

export async function acceptTrip(id: number) {
  const response = await api.patch<Trip>(`/trips/${id}/accept`);
  return response.data;
}

export async function completeTrip(id: number) {
  const response = await api.patch<Trip>(`/trips/${id}/complete`);
  return response.data;
}

export async function rateTrip(
  id: number,
  data: {
    rating: number;
    comment: string;
  }
) {
  const response = await api.post<Trip>(`/trips/${id}/rate`, data);
  return response.data;
}