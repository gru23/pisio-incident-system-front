import { IncidentStatus } from "../../enums";

export interface FilterRequestDto {
    incidentType?: string,
    incidentSubtype?: string,
    location?: string,
    status?: IncidentStatus,
    timeRange?: string
    //mozda mogu biti null, a ne da se kroz formu setuju na prazan string
}