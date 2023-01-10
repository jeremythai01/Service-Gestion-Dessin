export interface IUser {
    _id: string;
    username: string;
    password: string;
    avatar: string;
    privacy: boolean;
    email: string;
    isConnected: boolean;
    stats;
}