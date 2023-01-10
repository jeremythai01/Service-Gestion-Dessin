export interface IDrawing {
    _id?: number;
    drawingName: string;
    ownerId: string;
    albumId: string;
    password: string;
    actions?: any[];
    isProtected: boolean;
    isExposed: boolean;
    userCount: number;
    bitmap: string;
    createdAt: string;
}