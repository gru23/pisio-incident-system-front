export const API_BASE_URL = 'http://localhost:8080/api/v1';

export const API_INCIDENT_ENDPOINTS = {
  incidents: `${API_BASE_URL}/incidents`,
  filter: `${API_BASE_URL}/incidents/filter`,
};

export const API_MODERATION_ENDPOINTS = {
  updateStatus: (id: number) => `${API_BASE_URL}/moderation/${id}/status`,
}