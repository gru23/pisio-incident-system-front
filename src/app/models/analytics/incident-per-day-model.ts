import { IncidentType } from "../../enums";

export interface IncidentPerDayModel {
    day: number,
    count: number,
    type: IncidentType
}