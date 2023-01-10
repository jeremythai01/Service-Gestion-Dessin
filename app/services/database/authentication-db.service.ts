import { inject, injectable } from "inversify";
import {
  Collection,
  FilterQuery,
  MatchKeysAndValues,
  FindOneOptions,
  MongoClient,
  ObjectId
} from "mongodb";
import { IHttpResponse } from "../../models/response";
import { Status } from "../../const/status";
import { IUser } from "../../models/user";
import { DbConnection } from "./db";
import { DATABASE_NAME } from "../../const/database_url";
import { TYPES } from "../../const/types";
import { ProfileDatabaseService } from "./profile-db.service";
import { PUBLIC_ALBUM_ID } from "../../const/main_album";
import { AlbumDatabaseService } from "./album-db.service";


@injectable()
export class AuthenticationDatabaseService {
  private users: Collection<string>;
  
  public constructor(@inject(TYPES.ProfileDatabaseService)
  private profileDatabaseService: ProfileDatabaseService,@inject(TYPES.AlbumDatabaseService)
  private albumDatabaseService: AlbumDatabaseService) {
    this.fetchCollection();
  }
  public fetchCollection() {
    const DATABASE_COLLECTION = "USER";
    DbConnection.GetInstance()
    .then((client: MongoClient) => {
      this.users = client
        .db(DATABASE_NAME)
        .collection(DATABASE_COLLECTION);

        console.log("AuthenticationDatabaseService is ready");
      })
      .catch(() => {
        console.error("Fetching error, exiting process..");
        process.exit(1);
      });
  }


  public async createUser(user: IUser): Promise<IHttpResponse> {
    const fetchedUsername = await this.fetchUsername(user.username);

    // We can register user because no username was found
    if (fetchedUsername == null) {

      user.stats = {
        drawingCount: 0,
        ownedDrawingCount: 0,
        albumCount: 0,
        score: 0,
        totalDrawingTime: 0,
        meanDrawingTime: 0,
        activityHistory: []
      }

      return this.users
        .insertOne(user)
        .then(async () => {
          // add member to public album
          const userId = await this.profileDatabaseService.fetchIdByUsername(user.username);
          await this.albumDatabaseService.addMemberInAlbum(PUBLIC_ALBUM_ID, userId );

          const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: user,
          };
          return response;
        })
        .catch((error: Error) => {
          throw error;
        });
    }

    // Username was found in database so we cant register the user
    const response: IHttpResponse = {
      status: Status.ALREADY_EXISTS,
      data: "Account already exists",
    };
    return response;
  }


  public async loginUser(user: IUser): Promise<IHttpResponse> {
    const fetchedUsername = await this.fetchUsername(user.username);

    if (fetchedUsername == null) {
      const response: IHttpResponse = {
        status: Status.USER_DOESNT_EXISTS,
        data: "User does not exist",
      }
      return response;
    }

    const fetchedUser = await this.fetchUserByCredentials(user.username, user.password);
    // Check if credentials are invalid
    if (fetchedUser == null) {

      const response: IHttpResponse = {
        status: Status.USER_INVALID_CREDENTIALS,
        data: "Username or password incorrect",
      };
      return response;
    } 
    // Check if already connected
    if (fetchedUser.isConnected) {
      const response: IHttpResponse = {
        status: Status.USER_ALREADY_CONNECTED,
        data: "User already connected",
      };
      return response;
    }

    delete fetchedUser.collabCount;
    delete fetchedUser.startDrawingTime;
    this.profileDatabaseService.updateUserConnection(fetchedUser.username, true); // Update user connection status in database
    fetchedUser.isConnected = true; // Manually update connection status of fetched user
    const response: IHttpResponse = {
      status: Status.HTTP_OK,
      data: fetchedUser as IUser,
    };
    return response;  
  }


  private async fetchUserByCredentials(username: string, password: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "username": username,
      "password": password
    };

    return this.users
      .findOne(filter)
      .then((fetchedUser: IUser) => {
        return fetchedUser;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  private async fetchUsername(username: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "username": username,
    };
    const options: FindOneOptions<any> = {
      projection:
      {
        username: 1,
        _id: 0 
      }
    };

    return this.users
      .findOne(filter, options)
      .then((fetchedUsername: string) => {
        return fetchedUsername;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async deleteUsers(): Promise<any> {
    return this.users
    .deleteMany({})
    .then((_: any) => {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: "deleted all elements in user collection"
      };
      return response;  
    })
  }
}
