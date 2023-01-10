import { inject, injectable } from "inversify";
import {
  Collection,
  FilterQuery,
  FindOneOptions,
  MatchKeysAndValues,
  ObjectId,
  MongoClient,
} from "mongodb";
import { IHttpResponse } from "../../models/response";
import { Status } from "../../const/status";
import { DATABASE_NAME } from "../../const/database_url";
import { DbConnection } from "./db";
import 'reflect-metadata';
import { IAlbum } from "../../models/album";
import { TYPES } from "../../const/types";
import { DrawingDatabaseService } from "../firebase/drawing-db.service";
import { ProfileDatabaseService } from "./profile-db.service";

@injectable()
export class AlbumDatabaseService {
  private albums: Collection<string>;

  public constructor(@inject(TYPES.DrawingDatabaseService)
  private drawingDatabaseService: DrawingDatabaseService,
  @inject(TYPES.ProfileDatabaseService)
  private profileDatabaseService: ProfileDatabaseService) {
    this.fetchCollection();
  }
  
  public fetchCollection(): void {
    const DATABASE_COLLECTION = "ALBUM";
    DbConnection.GetInstance()
    .then((client: MongoClient) => {
      this.albums = client
        .db(DATABASE_NAME)
        .collection(DATABASE_COLLECTION);
      console.log("AlbumDatabaseService is ready");
      })
      .catch(() => {
        console.error("Fetching error, exiting process..");
        process.exit(1);
      });
  }


  private async fetchAlbumByName(albumName: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "albumName": albumName
    };

    return this.albums
      .findOne(filter)
      .then((fetchedAlbumName: string) => {
        return fetchedAlbumName;
      })
      .catch((error: Error) => {
        console.log("fetchAlbumByName failed. Error: " + error);
        throw error;
      });
  }


  public async getAlbums(): Promise<any> {
    const filter : FilterQuery<string> = {};
    
    return this.albums
      .find(filter)
      .toArray()
      .then(async (albums: any) => {

        for (const album of albums) {
          //update containsExposedDrawings
          album.containsExposedDrawings = await this.drawingDatabaseService.containsExposedDrawings(album._id);
        }
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: albums,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }


  public async createAlbum(albumToAdd: IAlbum): Promise<IHttpResponse> {
    const fetchedAlbum = await this.fetchAlbumByName(albumToAdd.albumName);
    // We can create album because no album was found with specified name
    if (fetchedAlbum == null) {

      // include ownerId in member list
      albumToAdd.membersId = [albumToAdd.ownerId];
      albumToAdd.waitingList = [];
      albumToAdd.containsExposedDrawings = false;

      return this.albums
        .insertOne(albumToAdd)
        .then(() => {

          // update album stats
          this.profileDatabaseService.updateAlbumCount(albumToAdd.ownerId, "+");

          const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: albumToAdd,
          };
          return response;
        })
        .catch((error: Error) => {
          throw error;
        });
    }

    // Album name was found in database
    const response: IHttpResponse = {
      status: Status.ALREADY_EXISTS,
      data: "Album already exists"
    };
    return response;
  }


  public async deleteAlbum(albumId: string): Promise<any> {

    const membersId = await this.getMembersIdList(albumId!);

    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    return this.albums.deleteOne(filter)
        .then(() => {

          for (const userId of membersId) {
            // update album stats
            this.profileDatabaseService.updateAlbumCount(userId, "-");
          }
          const response: IHttpResponse = {
              status: Status.HTTP_OK,
              data: {_id: albumId}
          };
          return response;
        })
        .catch((error: Error) => {
            throw error;
        });
  }

  public async leaveAlbum(albumId: string, userId: string): Promise<IHttpResponse> {
    return this.removeMemberInAlbum(albumId, userId)
    .then(async () => {
      // update album stats
      this.profileDatabaseService.updateAlbumCount(userId, "-");

      const albumOwnerId = await this.fetchAlbumOwnerId(albumId);
      await this.drawingDatabaseService.reassignDrawingsOwnership(albumOwnerId, userId);
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: "user has left album"
      };
      return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }

 
  public async deleteAlbums(): Promise<any> {
    return this.albums
    .deleteMany({})
    .then((_: any) => {
        const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: "deleted all elements in album collection"
        };
        return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }

  public async updateAlbumName(albumId: string, newAlbumName: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"albumName": newAlbumName}
    };

    return this.albums
      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: {albumName: newAlbumName}
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateAlbumDescription(albumId: string, newDescription: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"description": newDescription}
    };

    return this.albums
      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: {description: newDescription}
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateAlbumIsPrivate(albumId: string, newIsPrivate: boolean): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"isPrivate": newIsPrivate}
    };

    return this.albums
      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: {isPrivate: newIsPrivate}
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  private async fetchAlbumOwnerId(albumId: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    return this.albums
      .findOne(filter)
      .then(async (album: IAlbum) => {
        return album.ownerId;
      })
      .catch((error: Error) => {
        console.log("fetchAlbumOwnerId failed. Error: " + error);
        throw error;
      });
  }

  public async getMembersIdList(albumId: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    return this.albums
      .findOne(filter)
      .then((album: IAlbum) => {
          return album.membersId;
      })
      .catch((error: Error) => {
        console.log("getMembersIdList failed. Error: " + error);
        throw error;
      });
  }

  public async getAlbumWaitingList(albumId: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    return this.albums
      .findOne(filter)
      .then(async (album: IAlbum) => {
        const waitingListWithUsername : any[] = []
        for (const userId of album.waitingList) {
          // add username
          const username = await this.profileDatabaseService.fetchUsernameById(userId);
          waitingListWithUsername.push({_id: userId, username: username});
        }

        const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: waitingListWithUsername
        };
          return response;
      })
      .catch((error: Error) => {
        console.log("getAlbumWaitingList failed. Error: " + error);
        throw error;
      });
  }

  public async addMemberInAlbum(albumId: string, userId: string): Promise<void> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    const options: FindOneOptions<any> = {
      $addToSet: 
      { 
        membersId: userId
      } 
    };
     this.albums.findOneAndUpdate(filter, options);

     // update album stats
     this.profileDatabaseService.updateAlbumCount(userId, "+");
    }

  private async removeMemberInAlbum(albumId: string, userId: string): Promise<void>{
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    const options: FindOneOptions<any> = {
      $pull: 
      { 
        membersId: userId
      } 
    };

    this.albums.findOneAndUpdate(filter, options);
  }

  private async addUserInWaitingList(albumId: string, userId: string): Promise<void> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    const options: FindOneOptions<any> = {
      $addToSet: 
      { 
        waitingList: userId
      } 
    };

    this.albums.findOneAndUpdate(filter, options);
  }

  private async removeUserInWaitingList(albumId: string, userId: string): Promise<void> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(albumId)
    };

    const options: FindOneOptions<any> = {
      $pull: 
      { 
        waitingList: userId
      } 
    };

    return this.albums.findOneAndUpdate(filter, options);
  }

  public async sendJoinRequest(albumId: string, waitingUserId: string): Promise<IHttpResponse> {

    const waitingListResponse = await this.getAlbumWaitingList(albumId);
    const waitingList = waitingListResponse.data;

    for (const user of waitingList) {
      if (user._id == waitingUserId) {
        // Error: userId is already in waitinglist
        const response: IHttpResponse = {
          status: Status.ALREADY_EXISTS,
          data: "User already sent a request to join the album"
        };
        return response;
      }
    }        

    return this.addUserInWaitingList(albumId, waitingUserId)
    .then(() => {
      const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: "successfully sent join request to album"
        };
      return response;
      });
    }


  public async respondJoinRequest(albumId: string, waitingUserId: string, accept: boolean): Promise<IHttpResponse> {

    const waitingListResponse = await this.getAlbumWaitingList(albumId);
    const waitingList = waitingListResponse.data;

    const user = waitingList.filter((user => user._id == waitingUserId));

    if (user.length < 1) {
      // Error: userId is not in waitinglist
      const response: IHttpResponse = {
        status: Status.USER_DOESNT_EXISTS,
        data: "Error request does not exist"
      };
      return response;
    }
    
    if (accept)
      this.addMemberInAlbum(albumId, waitingUserId);
  
    // remove waitingUserId from waiting list
    return this.removeUserInWaitingList(albumId, waitingUserId)
    .then(() => {
      const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: "successfully responded to join request"
        };
      return response;
      });;
  }

  public async filterDrawings(userId: string, albumId: string, filter: any, text: string): Promise<any> {

    // Get only exposed drawings
    let drawings = await this.drawingDatabaseService.getAllDrawings();

    if (albumId != "") {
      let drawingsInAlbum = drawings.filter(drawing => drawing.albumId == albumId);
      const membersId = await this.getMembersIdList(albumId);
      if (!membersId.includes(userId)) {
        let exposedDrawingsInAlbum = drawingsInAlbum.filter(drawing => drawing.isExposed == true);
        return await this.drawingDatabaseService.filterDrawings(exposedDrawingsInAlbum, filter, text);
      } else
        return await this.drawingDatabaseService.filterDrawings(drawingsInAlbum, filter, text);
    }
    else {
      // Keep all drawings where user is a member of the album
      let drawingsInAlbums : any = [];
      for (let drawing of drawings) {
        const membersId = await this.getMembersIdList(drawing.albumId);
        if (membersId.includes(userId))
          drawingsInAlbums.push(drawing);
      }
      return await this.drawingDatabaseService.filterDrawings(drawingsInAlbums, filter, text);
    }
  }
}