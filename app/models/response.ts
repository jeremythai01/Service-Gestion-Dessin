import { Status } from "../const/status";

export interface IHttpResponse {
    status: Status;
    data: any; // Can be a string message or IUser
}