export interface IAlbum {
    _id: string;
    albumName: string;
    description: string;
    ownerId: string;
    membersId: string[];
    waitingList: string[];
    containsExposedDrawings: boolean;
    isPrivate: boolean;      
}