import { IncidentStatus, IncidentSubtype, IncidentType } from "../enums";
import { LocationModel } from "./location-model";
import { ImageModel } from "./image-model";

export interface IncidentModel {
    id?: number,
    type: IncidentType,
    subtype: IncidentSubtype,
    location: LocationModel,
    description: string,
    images: ImageModel[],
    status: IncidentStatus
}