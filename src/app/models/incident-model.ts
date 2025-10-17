import { IncidentSubtype, IncidentType } from "../enums";
import { LocationModel } from "./location-model";
import { ImageModel } from "./image-model";

export interface IncidentModel {
    type: IncidentType,
    subtype: IncidentSubtype,
    location: LocationModel,
    description: string,
    images: ImageModel[];
}