import { injectable } from "inversify";
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
import { DbConnection } from "./db";
import { DATABASE_NAME } from "../../const/database_url";
import { IUser } from "../../models/user";
let moment = require('moment-timezone');
moment.locale("fr");

@injectable()
export class ProfileDatabaseService {
  public users: Collection<string>;
  
  public constructor() {
    this.fetchCollection();
  }
  public fetchCollection() {
    const DATABASE_COLLECTION = "USER";
    DbConnection.GetInstance()
    .then((client: MongoClient) => {
      this.users = client
        .db(DATABASE_NAME)
        .collection(DATABASE_COLLECTION);

        console.log("ProfileDatabaseService is ready");
      })
      .catch(() => {
        console.error("Fetching error, exiting process..");
        process.exit(1);
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

  public async fetchIdByUsername(username: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "username": username,
    };

    return this.users
      .findOne(filter)
      .then((fetchedUser: IUser) => {
        return fetchedUser._id;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async fetchUsernameById(userId: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId),
    };

    return this.users
      .findOne(filter)
      .then((fetchedUser: IUser) => {
        return fetchedUser.username;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  private async fetchPrivacyById(userId: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId),
    };

    return this.users
      .findOne(filter)
      .then((fetchedUser: IUser) => {
        return fetchedUser.privacy;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async fetchEmailById(userId: string): Promise<any> {

    const privacy = await this.fetchPrivacyById(userId);

    // cant fetch email if in private mode
    if (privacy)
      return;

    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId),
    };

    return this.users
      .findOne(filter)
      .then((fetchedUser: IUser) => {
        return fetchedUser.email;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async fetchAvatarById(userId: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId),
    };

    return this.users
      .findOne(filter)
      .then((fetchedUser: IUser) => {
        return fetchedUser.avatar;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async getAvatars(): Promise<any> {
    let pairs : any = [];

    await this.users.find({})
    .forEach( (document) => {
      pairs.push({_id: document._id, avatar: document.avatar});
    })
    .catch((error: Error) => {
      throw error;
    });
  
    const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: pairs,
      };
      return response;
  }
  
  // Update user connection in database when is connected/disconnected 
  public updateUserConnection(username: string, value: boolean): void {
    const filter : FilterQuery<string> = {
      "username": username
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"isConnected": value}
    };

    this.users.findOneAndUpdate(filter, options);
  }
   
  public async updateUsername(username: string, newUsername: string): Promise<IHttpResponse> {

    const fetchedUsername = await this.fetchUsername(newUsername);

    if (fetchedUsername != null) {
      const response: IHttpResponse = {
          status: Status.ALREADY_EXISTS,
          data: "username is already taken",
      };
      return response;
    }


    const filter : FilterQuery<string> = {
      "username": username
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"username": newUsername}
    };

    return this.users

      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: newUsername,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updatePassword(username: string, newPassword: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "username": username
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"password": newPassword}
    };

    return this.users
      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: newPassword,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateAvatar(userId: string, newAvatar: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"avatar": newAvatar}
    };

    return this.users
      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: newAvatar,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updatePrivacy(username: string, newPrivacy: boolean): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "username": username
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"privacy": newPrivacy}
    };

    return this.users
      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: newPrivacy,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateEmail(username: string, newEmail: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "username": username
    };
    const options: MatchKeysAndValues<string> = {
      $set: {"email": newEmail}
    };

    return this.users
      .findOneAndUpdate(filter, options)
      .then(() => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: newEmail,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateDrawingCount(userId: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $inc: { "stats.drawingCount": 1 },
    };

    return this.users
      .findOneAndUpdate(filter, options, {returnOriginal: false})
      .then((result) => {
          return result.value.stats.drawingCount
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateOwnedDrawingCount(userId: string, op: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };

    let num : number = op == "+" ? 1 : -1;
    const options: MatchKeysAndValues<string> = {
      $inc: { "stats.ownedDrawingCount": num },
    };

    return this.users
      .findOneAndUpdate(filter, options, {returnOriginal: false})
      .then((result) => {
        return result.value.stats.ownedDrawingCount
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateAlbumCount(userId: string, op: string): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };

    const options: MatchKeysAndValues<string> = {
      $inc: { "stats.albumCount": op == "+" ? 1 : - 1 },
    };

    return this.users
      .findOneAndUpdate(filter, options, {returnOriginal: false})
      .then((result) => {
       return result.value.stats.albumCount
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateCompetitionScore(userId: string, score: number): Promise<IHttpResponse> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };

    const options: MatchKeysAndValues<string> = {
      $inc: { "stats.score": score },
    };

    return this.users
      .findOneAndUpdate(filter, options, {returnOriginal: false})
      .then((result) => {
       return result.value.stats.score
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  // used for the calculation of mean drawing time
  private async updateCollabCount(userId: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $inc: { "stats.collabCount": 1 },
    };

    return this.users
      .findOneAndUpdate(filter, options, {returnOriginal: false})
      .then((result) => {
        return result.value.stats.collabCount;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  // used for the calculation of total drawing time
  public async updateStartDrawingTime(userId: string): Promise<any> {

    // get time now 
    const currentDatetime = new Date();

    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $set: { "stats.startDrawingTime": currentDatetime },
    };

    return this.users
      .findOneAndUpdate(filter, options, {returnOriginal: false})
      .then((result) => {
        return result.value.stats.startDrawingTime;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  private async getStartDrawingTime(userId: string): Promise<any> {

    // get time now 
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: FindOneOptions<any> = {
      projection:
      {
        stats: 1,
        _id: 0 
      }
    };

    return this.users
      .findOne(filter, options)
      .then((result) => {
        return result.stats.startDrawingTime;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  private async updateTotalDrawingTime(userId: string, time: number): Promise<any> {
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $inc: { "stats.totalDrawingTime": time },
    };

    return this.users
      .findOneAndUpdate(filter, options, {returnOriginal: false})
      .then((result) => {
        return result.value.stats.totalDrawingTime;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  private getMinutesBetweenDates(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    return (diff / 60000);
}

  public async updateDrawingTimeStats(userId: string): Promise<any> {

    // get time now 
    const endDrawingTime = new Date();

    // get start time
    const startDrawingTime: number = await this.getStartDrawingTime(userId);

    let differenceMinutes = this.getMinutesBetweenDates(startDrawingTime, endDrawingTime);

    const newCollabCount : number = await this.updateCollabCount(userId);

    const newTotalDrawingTime : number = await this.updateTotalDrawingTime(userId, +differenceMinutes)

    const newMeanDrawingTime : number = newTotalDrawingTime/newCollabCount;


    // update meanDrawingtime
    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $set: { "stats.meanDrawingTime": newMeanDrawingTime },
    };

    return this.users.findOneAndUpdate(filter, options, {returnOriginal: false});
  }


  public async updateLogonHistory(userId: string): Promise<any> {

    const currentDatetime = moment().tz('America/Montreal').format("dddd Do MMMM YYYY HH[h]mm");

    const activity = {
      type: "connect",
      date: currentDatetime,
      drawingId: "",
      drawingName: "",
      lobbyName: "",
      rank: "",
    }

    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $addToSet: { "stats.activityHistory": activity },
    };

    return this.users.findOneAndUpdate(filter, options, {returnOriginal: false});
  }


  public async updateLogoutHistory(userId: string): Promise<any> {

    const currentDatetime = moment().tz('America/Montreal').format("dddd Do MMMM YYYY HH[h]mm");

    const activity = {
      type: "disconnect",
      date: currentDatetime,
      drawingId: "",
      drawingName: "",
      lobbyName: "",
      rank: ""
    }

    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $addToSet: { "stats.activityHistory": activity },
    };

    return this.users.findOneAndUpdate(filter, options, {returnOriginal: false});
  }


  public async updateDrawingEditHistory(userId: string, drawingId: string, drawingName: string): Promise<any> {

    const currentDatetime = moment().tz('America/Montreal').format("dddd Do MMMM YYYY HH[h]mm");

    const activity = {
      type: "drawing",
      date: currentDatetime,
      drawingId: drawingId,
      drawingName: drawingName,
      lobbyName: "",
      rank: ""
    }

    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $addToSet: { "stats.activityHistory": activity },
    };

    return this.users.findOneAndUpdate(filter, options, {returnOriginal: false});
  }

  private async getLastCompetitionActivityDate(userId, lobbyName) {

    let lastDate: any;
    await this.users.find({})
    .forEach( (user) => {
      if (user._id == userId && user.stats) {
        user.stats.activityHistory.forEach(function (activity) {
          if (activity.type == "competition" && activity.lobbyName == lobbyName) {
            lastDate = activity.date;
          }
        });
      }
    });

    return lastDate;
  }


  public async updateCompetitionHistory(userId: string, lobbyName: string, rank: number): Promise<any> {

    const currentDatetime = moment().tz('America/Montreal').format("dddd Do MMMM YYYY HH[h]mm");

    // to stop multiple emits from clients
    const lastDate = await this.getLastCompetitionActivityDate(userId, lobbyName);
    if (lastDate != undefined) {
      let indexLastDate = lastDate.lastIndexOf("h");
      let minutesLastdate =  +(lastDate[indexLastDate+ 1] + lastDate[indexLastDate + 2]);
      let indexcurrentDatetime = currentDatetime.lastIndexOf("h");
      let minutescurrentDatetime =  +(currentDatetime[indexcurrentDatetime+ 1] + currentDatetime[indexcurrentDatetime + 2]);
      if (minutescurrentDatetime - minutesLastdate <= 1)
        return;
    }
  

    const newActivity = {
      type: "competition",
      date: currentDatetime,
      drawingId: "",
      drawingName: "",
      lobbyName: lobbyName,
      rank: rank,
    }
    

    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: MatchKeysAndValues<string> = {
      $addToSet: { "stats.activityHistory": newActivity },
    };

    return this.users.findOneAndUpdate(filter, options);
  }

  public async getCompetitionRankings(): Promise<any> {
    let rankings : any = [];

    await this.users.find({})
    .forEach( (user) => {
      if (user.stats != undefined && user.stats.score > 0)
        rankings.push({userId: user._id, username: user.username, score: user.stats.score});
    })
    .catch((error: Error) => {
      throw error;
    });

    // sort by score
    rankings.sort((player1: any, player2: any) => {
      return player2.score - player1.score;
    });
  
    const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: rankings,
    };
    return response;
  }


  public async getUserStats(userId: string): Promise<any> {

    const filter : FilterQuery<string> = {
      "_id": ObjectId(userId)
    };
    const options: FindOneOptions<any> = {
      projection:
      {
        stats: 1,
        _id: 0 
      }
    };

    return this.users
      .findOne(filter, options)
      .then((result) => {
        delete result.stats.collabCount;
        delete result.stats.startDrawingTime;
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: result.stats,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }
}