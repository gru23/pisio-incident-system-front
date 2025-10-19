export const API_BASE_URL = 'http://localhost:8080/api/v1';

export const API_INCIDENT_ENDPOINTS = {
  incidents: `${API_BASE_URL}/incidents`,
  filter: `${API_BASE_URL}/incidents/filter`,

  vehiclesById: (id: number) => `${API_BASE_URL}/vehicles/${id}`,

  cars: `${API_BASE_URL}/cars`,
  bikes: `${API_BASE_URL}/bikes`,
  scooters: `${API_BASE_URL}/scooters`,

  carById: (id: number) => `${API_BASE_URL}/cars/${id}`,
  bikeById: (id: number) => `${API_BASE_URL}/bikes/${id}`,
  scooterById: (id: number) => `${API_BASE_URL}/scooters/${id}`,

  updateRentalPrice: (id: number) => `${API_BASE_URL}/vehicles/${id}/update-rental-price`,
};
