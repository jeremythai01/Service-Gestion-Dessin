import { IMessage } from "./message";

export interface IChannel {
    channelName: string;
    hostUsername: string;
    messageHistory: IMessage[];
}