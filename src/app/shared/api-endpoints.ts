export const API_BASE_URL = 'http://localhost:8080/api/v1';

export const API_INCIDENT_ENDPOINTS = {
  incidents: `${API_BASE_URL}/incidents`,
  filter: `${API_BASE_URL}/incidents/filter`,
  updateStatus: (id: number) => `${API_BASE_URL}/incidents/${id}/status`,
};

export const API_MODERATION_ENDPOINTS = {
  updateStatus: (id: number) => `${API_BASE_URL}/moderation/${id}/status`,
}

export const API_ANALYTICS_ENDPOINTS = {
  cityIncidentCount: `${API_BASE_URL}/analytics/count-by-city`,
  typeIncidentCount: `${API_BASE_URL}/analytics/count-by-type`,
  incidentPerDay: (year: number, month: number) => 
    `${API_BASE_URL}/analytics/count-by-month?year=${year}&month=${month}`,
  incidents: `${API_BASE_URL}/analytics/incidents`,
  updateIncidentStatus: (id: number) => `${API_BASE_URL}/analytics/incidents/${id}/status`,
}

export const API_ALERT_ENDPOINTS = {
  detectionPosition: `${API_BASE_URL}/alert/detection-position`,
  incidentDetection: `${API_BASE_URL}/alert/incident-detection`,
  incidents: `${API_BASE_URL}/alert/incidents`,
  updateIncidentStatus: (id: number) => `${API_BASE_URL}/alert/incidents/${id}/status`,
}