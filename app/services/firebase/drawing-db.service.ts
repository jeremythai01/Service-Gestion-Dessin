import { inject, injectable } from "inversify";
import { MAX_PLAYERS_DRAWINGS } from "../../const/max_player_drawing";
import { Status } from "../../const/status";
import { TYPES } from "../../const/types";
import { IDrawing } from "../../models/drawing";
import { IHttpResponse } from "../../models/response";
import { ChannelDatabaseService } from "../database/channel-db.service";
import { ProfileDatabaseService } from "../database/profile-db.service";
import { drawingsDB, admin } from "./config";
let moment = require('moment-timezone');
moment.locale("fr");
@injectable()
export class DrawingDatabaseService {

  public constructor(@inject(TYPES.ProfileDatabaseService)
  private profileDatabaseService: ProfileDatabaseService,
  @inject(TYPES.ChannelDatabaseService)
  private channelDatabaseService: ChannelDatabaseService) {}

  private async getCountActions(drawingId: string) {
    const snapshot = await drawingsDB.ref().child(drawingId).child("actions").once("value");
    return snapshot.numChildren();
  }

  public async drawingExist(drawingId): Promise<boolean> {
    const snapshot = await drawingsDB.ref().child(drawingId).once("value");
    return snapshot.val() != null;
  }

  public async canJoinDrawing(drawingId): Promise<boolean> {
    const snapshot = await drawingsDB.ref().child(drawingId).child("userCount").once("value");
    return snapshot.val() < MAX_PLAYERS_DRAWINGS;
  }


  public async addAction(drawingId: string, action: any) {    
  
    // update index
    const numberActions = await this.getCountActions(drawingId);
    action.index = numberActions > 0 ? numberActions: 0;
    
    return drawingsDB
    .ref()
    .child(drawingId).child("actions")
    .push(action)
    .then((childRef: any) => {
      // update _id, no other way
      const generatedId = childRef.key;
      action._id = generatedId;
      childRef.child("_id").set(generatedId);
      return action;
    });
  }

  public async fetchActions(drawingId: string): Promise<any> {
    const snapshot = await drawingsDB.ref().child(drawingId).child("actions").once('value');
    if (snapshot.val() == null)
      return null;
    
    const actions = Object.values(snapshot.val());// removed id keys  

    // sort by index
    actions.sort((action1: any, action2: any) => {
      return action1.index - action2.index;
    });
    
    return actions;
  }


  public async addDrawingInAlbum(drawing: IDrawing): Promise<IHttpResponse>{

    // update created_at
    const currentDatetime = moment().tz('America/Montreal').format("dddd Do MMMM YYYY HH[h]mm");
    drawing.createdAt = currentDatetime

    return drawingsDB
      .ref()
      .push(drawing)
      .then((childRef: any) => {          
        // update _id: no other way
        const generatedId = childRef.key;
        drawing._id = generatedId;
        childRef.child("_id").set(generatedId);

        // update owned drawings
        this.profileDatabaseService.updateOwnedDrawingCount(drawing.ownerId, "+");

        // Create channel of drawing
        const channelToAdd = {
          channelName: generatedId,
          hostUsername: "NOBODY",
          messageHistory: []
        }
        
        this.channelDatabaseService.createChannel(channelToAdd);

        const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: drawing
        };
        return response;
      })
      .catch((error: Error) => {
          throw error;
      });
  }

  public deleteDrawings():  Promise<any> {
    return drawingsDB.ref().set(null);
  }

  public async deleteDrawingInAlbum(drawingId: string): Promise<IHttpResponse>{

    const snapshot = await drawingsDB.ref().child(drawingId).child("userCount").once("value");
    const userCount = snapshot.val();

    if (userCount > 0) {
      const response: IHttpResponse = {
        status: Status.HTTP_ERROR,
        data: "Cant delete drawing: users are currently editing"
      };
      return response;
    }

    const ownerId = await this.getDrawingOwnerIdById(drawingId);
    
    return drawingsDB
      .ref()
      .child(drawingId)
      .remove()
      .then(async () => {
        // update owned drawings        
        await this.profileDatabaseService.updateOwnedDrawingCount(ownerId , "-");

        this.channelDatabaseService.deleteChannel(drawingId);
        const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: {_id: drawingId}
        };
        return response;
      })
      .catch((error: Error) => {
          throw error;
      });
  }


  public async deleteDrawingsInAlbum(albumId: string): Promise<any>{

    const snapshot = await drawingsDB.ref().once('value');
    if (snapshot.val() == null)
      return;

    const drawings: any = Object.values(snapshot.val()); // removed id keys

    const drawingsInAlbum = drawings.filter(drawing => drawing.albumId == albumId);

    drawingsInAlbum.forEach((drawing: any) => {
      drawingsDB.ref().child(drawing._id).remove();
    });

    return drawingsInAlbum;
  }

  public async getDrawingNameById(drawingId: string): Promise<any>{
    const snapshot = await drawingsDB.ref().child(drawingId).child("drawingName").once('value');
    if (snapshot.val() == null)
      return;

    return snapshot.val();
  }

  private async getDrawingOwnerIdById(drawingId: string): Promise<any>{
    const snapshot = await drawingsDB.ref().child(drawingId).child("ownerId").once('value');
    if (snapshot.val() == null)
      return;

    return snapshot.val();
  }


  public async getDrawingsInAlbum(albumId: string): Promise<IHttpResponse>{
    const snapshot = await drawingsDB.ref().once('value');

    if (snapshot.val() == null) {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: []
      };
      return response;
    }
    const drawings: any = Object.values(snapshot.val()); // removed id keys

    const drawingsInAlbum = drawings.filter(drawing => drawing.albumId == albumId);

    for (const drawing of drawings) {
      if (drawing.actions != undefined)
        delete drawing.actions;
    }

    const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: drawingsInAlbum
    };

    return response;
  }

  public async getExposedDrawingsInAlbum(albumId: string): Promise<IHttpResponse>{
    const snapshot = await drawingsDB.ref().once('value');

    if (snapshot.val() == null) {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: []
      };
      return response;
    }
    const drawings: any = Object.values(snapshot.val()); // removed id keys

    const drawingsInAlbum = drawings.filter(drawing => drawing.albumId == albumId && drawing.isExposed);

    
    const result: any[] = []; // bitmap and drawingName
    drawingsInAlbum.forEach(drawing => {
      result.push({drawingName: drawing.drawingName, bitmap: drawing.bitmap})
    });

    const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: result
    };

    return response;
  }

  public async updateDrawingName(drawingId: string, newDrawingName: string): Promise<IHttpResponse> {
    return drawingsDB
    .ref()
    .child(drawingId)
    .child("drawingName")
    .set(newDrawingName)
    .then(() => {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: {drawingName: newDrawingName}
      };
      return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }

  public async updateDrawingPassword(drawingId: string, newPassword: string): Promise<IHttpResponse> {
    return drawingsDB
    .ref()
    .child(drawingId)
    .child("password")
    .set(newPassword)
    .then(() => {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: {password: newPassword}
      };
      return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }

  public async accessDrawing(drawingId: string, sentPassword: string): Promise<IHttpResponse> {

    const snapshot = await drawingsDB.ref().child(drawingId).child("password").once("value");
    const password = snapshot.val();

    // Invalid password
    if (password != sentPassword) {
      const response: IHttpResponse = {
        status: Status.HTTP_ERROR,
        data: "Password incorrect"
      };
      return response;
    }

    // Valid password
    const response: IHttpResponse = {
      status: Status.HTTP_OK,
      data: "Password correct"
    };
    return response;
  }

  public async updateDrawingIsExposed(drawingId: string, newIsExposed: boolean): Promise<IHttpResponse> {
    return drawingsDB
    .ref()
    .child(drawingId)
    .child("isExposed")
    .set(newIsExposed)
    .then(() => {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: {isExposed: newIsExposed}
      };
      return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }

  public async updateDrawingIsProtected(drawingId: string, newIsProtected: boolean): Promise<IHttpResponse> {
    return drawingsDB
    .ref()
    .child(drawingId)
    .child("isProtected")
    .set(newIsProtected)
    .then(() => {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: {isProtected: newIsProtected}
      };
      return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }

  public async updateDrawingUserCount(drawingId: string, operation: string): Promise<any> {
    return drawingsDB
    .ref()
    .child(drawingId)
    .child("userCount")
    .set(admin.database.ServerValue.increment(operation == '+' ? 1 : -1));
  }

  public async updateDrawingBitmap(drawingId: string, bitmap: any): Promise<any> {
    return drawingsDB
    .ref()
    .child(drawingId)
    .child("bitmap")
    .set(bitmap);
  }

  public async updateDrawingAlbumId(drawingId: string, newAlbumId: string): Promise<any> {
    return drawingsDB
    .ref()
    .child(drawingId)
    .child("albumId")
    .set(newAlbumId)
    .then(() => {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: {albumId: newAlbumId}
      };
      return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }  

  public async updateDrawingAction(drawingId: string, action: any): Promise<any> {

    // update action
    // return action
    await drawingsDB
    .ref()
    .child(drawingId)
    .child("actions")
    .child(action._id)
    .set(action);

    const snapshot = await drawingsDB.ref().child(drawingId).child("actions").child(action._id).once("value");
    const updatedAction = snapshot.val();
    return updatedAction;

  }

  public async deleteDrawingAction(drawingId: string, actionId): Promise<any> {

    // fetch index of action to delete
    const snapshot = await drawingsDB
                          .ref()
                          .child(drawingId)
                          .child("actions")
                          .child(actionId)
                          .child("index")
                          .once("value"); 

    const index = snapshot.val();

    // delete action
    await drawingsDB
    .ref()
    .child(drawingId)
    .child("actions")
    .child(actionId)
    .set(null);

    // fetch all actions 
    const orderedActions = await this.fetchActions(drawingId);

    // decrement index of every action that is on top of delete action
    if (orderedActions != null) {
      for (const action of orderedActions) {
        if (action.index > index) {
          await drawingsDB
          .ref()
          .child(drawingId)
          .child("actions")
          .child(action._id)
          .child("index")
          .set(admin.database.ServerValue.increment(-1));
        }
      }
    }
    
    return actionId;
  }


  public async updateDrawingActionIndex(drawingId: string, actionId: string, newIndex: number): Promise<any> {


    const orderedActions = await this.fetchActions(drawingId);

    // Unselect action 1
    await drawingsDB
    .ref()
    .child(drawingId)
    .child("actions")
    .child(actionId)
    .child("isSelected")
    .set(false);

    // fetch old index of action 1
    const snapshot = await drawingsDB
                          .ref()
                          .child(drawingId)
                          .child("actions")
                          .child(actionId)
                          .child("index")
                          .once("value");

    const oldIndex = snapshot.val();


    if (oldIndex < newIndex) {
      // increment indexes between old and new
      for (let i = oldIndex + 1; i <= newIndex; i++) {
        await drawingsDB
        .ref()
        .child(drawingId)
        .child("actions")
        .child(orderedActions[i]._id)
        .child("index")
        .set(admin.database.ServerValue.increment(-1));
      }

    } else {
      // increment indexes between old and new
      for (let i = newIndex; i < oldIndex ; i++) {
        await drawingsDB
        .ref()
        .child(drawingId)
        .child("actions")
        .child(orderedActions[i]._id)
        .child("index")
        .set(admin.database.ServerValue.increment(1));
      }
  }

  const oldActionId = orderedActions[oldIndex]._id;
  await drawingsDB
    .ref()
    .child(drawingId)
    .child("actions")
    .child(oldActionId)
    .child("index")
    .set(newIndex);
  }

  public async containsExposedDrawings(albumId: string): Promise<boolean>{
    const snapshot = await drawingsDB.ref().once('value');

    if (snapshot.val() == null)
      return false;

    const drawings: any = Object.values(snapshot.val()); // removed id keys
    const check = (drawing) => drawing.albumId == albumId && drawing.isExposed == true;

    return drawings.some(check);
  }

  public async reassignDrawingsOwnership(albumOwnerId: string, userId: string): Promise<any> {

    const snapshots = await drawingsDB.ref().orderByChild('ownerId').equalTo(userId).once('value');

    if (snapshots == null)
      return;

    // dont use async/await or else it will fail
    snapshots.forEach((snapshot) => {
      const drawing = snapshot.val();
      drawingsDB
        .ref()
        .child(drawing._id)
        .child("ownerId")
        .set(albumOwnerId)
    });
  }

  public async filterDrawings(drawings: any, filter: any, text: string): Promise<any> {

    let resultSet = new Set();

    for (let drawing of drawings) {

      if (filter.drawingName) {
        if (drawing.drawingName.includes(text))
          resultSet.add(drawing);
      }

      if (filter.ownerUsername) {
        const drawingOwnerUsername = await this.profileDatabaseService.fetchUsernameById(drawing.ownerId);
        if (drawingOwnerUsername.includes(text))
          resultSet.add(drawing);
      }

      if (filter.ownerEmail) {
        const drawingOwnerEmail = await this.profileDatabaseService.fetchEmailById(drawing.ownerId);
        if (drawingOwnerEmail != undefined && drawingOwnerEmail.includes(text))
          resultSet.add(drawing);
      }

      if (filter.createdAt) {
        if (drawing.createdAt.includes(text))
        resultSet.add(drawing);
      }
    }

    const resultArray : any = Array.from(resultSet);
    
    // Delete action field
    for (const drawing of resultArray) {
      if (drawing.actions != undefined)
        delete drawing.actions;
    }

    const response: IHttpResponse = {
      status: Status.HTTP_OK,
      data: resultArray
    };
    return response;
  }

  public async getAllDrawings() : Promise<any> {
    // Fetch all drawings (excluding competition ones)
    const snapshot = await drawingsDB.ref().once('value');

    if (snapshot.val() == null)
      return [];
    const drawings : any =  Object.values(snapshot.val()); // removed id keys

    return drawings.filter((drawing => drawing.use != "Competition"));
  }
  
  /*********************COMPETITION****************** */

  public async addCompetitionDrawing(lobbyId: string, playerId: string): Promise<any>{

    const drawing: any = {
      lobbyId: lobbyId,
      playerId: playerId,
      use: "Competition",
      userCount: 0,
      bitmap:"",
      actions: []
    }

    return drawingsDB
      .ref()
      .push(drawing)
      .then((childRef: any) => {          
        // update _id: no other way
        const generatedId = childRef.key;
        childRef.child("_id").set(generatedId);
        return generatedId;
      })
  }

  private async getCompetitionDrawingsForLobby(lobbyId: string): Promise<any> {
    const snapshot = await drawingsDB.ref().once('value');

    if (snapshot.val() == null)
      return [];

    const drawings: any = Object.values(snapshot.val()); // removed id keys

    const drawingsForLobby = drawings.filter(drawing => drawing.use == "Competition" && drawing.lobbyId == lobbyId);
    return drawingsForLobby;
  }

  
  public async deleteCompetitionDrawings(lobbyId: string): Promise<any> {

    const drawings = await this.getCompetitionDrawingsForLobby(lobbyId);

    for (const drawing of drawings) {
      await drawingsDB
      .ref()
      .child(drawing._id)
      .remove();
    } 
  }

  public async deleteCompetitionDrawingOfPlayer(lobbyId: string, playerId: string): Promise<any> {

    const drawings = await this.getCompetitionDrawingsForLobby(lobbyId);

    const drawing = drawings.find(drawing => drawing.playerId == playerId);
    
    if (drawing != undefined) {
      await drawingsDB
      .ref()
      .child(drawing._id)
      .remove(); 
    }
  }


  public async getCompetitionDrawingBitmapByPlayerId(lobbyId: string, playerId: string) {
    const drawings = await this.getCompetitionDrawingsForLobby(lobbyId);

    const drawing = drawings.find(drawing => drawing.playerId == playerId);
    

    if (drawing == undefined) {
      console.log("UNDEFINED");
      return;
    }

    return drawing.bitmap;

  }
}