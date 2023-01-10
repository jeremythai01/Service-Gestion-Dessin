import { injectable } from "inversify";
import {
  Collection,
  FilterQuery,
  FindOneOptions,
  MongoClient,
} from "mongodb";
import { IHttpResponse } from "../../models/response";
import { Status } from "../../const/status";
import { IChannel } from "../../models/channel";
import { IMessage } from "../../models/message";
import { DATABASE_NAME } from "../../const/database_url";
import { DbConnection } from "./db";
import 'reflect-metadata';

@injectable()
export class ChannelDatabaseService {
  private channels: Collection<string>;

  public constructor() {
    this.fetchCollection();
  }
  
  public fetchCollection(): void {
    const DATABASE_COLLECTION = "CHANNEL";
    DbConnection.GetInstance()
    .then((client: MongoClient) => {
      this.channels = client
        .db(DATABASE_NAME)
        .collection(DATABASE_COLLECTION);
      console.log("ChannelDatabaseService is ready");
      })
      .catch(() => {
        console.error("Fetching error, exiting process..");
        process.exit(1);
      });
  }


  private async fetchChannelName(channelName: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "channelName": channelName
    };
    const options: FindOneOptions<any> = {
      projection:
      {
        channelName: 1,
        _id: 0 
      }
    };

    return this.channels
      .findOne(filter, options)
      .then((fetchedChannelName: any) => {
        return fetchedChannelName;
      })
      .catch((error: Error) => {
        console.log("getChannel failed. Error: " + error);
        throw error;
      });
  }


  public async getChannels(): Promise<any> {
    const filter : FilterQuery<string> = {};
    const options: FindOneOptions<any> = {
      projection:
      {
        _id: 0 
      }
    };

    return this.channels
      .find(filter, options)
      .toArray()
      .then((channels: any) => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: channels,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }


  public async getHistoryChannel(channelName: string): Promise<any> {
    const filter = {
      "channelName": channelName
    };
    const options: FindOneOptions<any> = {
      projection:
      {
        messageHistory: 1, 
        _id: 0 
      }
    };

    return this.channels
      .findOne(filter, options)
      .then((history: any) => {
        const response: IHttpResponse = {
          status: Status.HTTP_OK,
          data: history,
        };
        return response;
      })
      .catch((error: Error) => {
        throw error;
      });
  }

  public async updateHistoryChannel(channelName: string, message: IMessage): Promise<any> {
    const filter = {
      "channelName": channelName
    };
    const options: FindOneOptions<any> = {
      $addToSet: 
      { 
        messageHistory: message
      } 
    };

    this.channels.findOneAndUpdate(filter, options);
  }

  public async updatePreviousMessageSender(oldUsername: string, newUsername: string): Promise<any> {

    this.channels.find({})
    .forEach( (document) => {
      document.messageHistory.forEach(function (message) {
        if (message.sender == oldUsername)
          message.sender = newUsername;
      });
      this.channels.save(document); // overwrite document
    });
  }


  public async createChannel(channelToAdd: IChannel): Promise<IHttpResponse> {
    const fetchedChannelName = await this.fetchChannelName(channelToAdd.channelName);

    // We can create channel because no channel was found with specified name
    if (fetchedChannelName == null) {      
      return this.channels
        .insertOne(channelToAdd)
        .then(() => {
          const response: IHttpResponse = {
            status: Status.HTTP_OK,
            data: "New channel created"
          };
          return response;
        })
        .catch((error: Error) => {
          throw error;
        });
    }

    // Channel name was found in database
    const response: IHttpResponse = {
      status: Status.ALREADY_EXISTS,
      data: "Channel already exists"
    };
    return response;
  }


  public async deleteChannel(channelName: string): Promise<any> {
    const filter : FilterQuery<string> = {
      "channelName": channelName
    };
    return this.channels.deleteOne(filter);
  }


  public async deleteChannels(): Promise<any> {
    return this.channels
    .deleteMany({})
    .then((_: any) => {
      const response: IHttpResponse = {
        status: Status.HTTP_OK,
        data: "deleted all elements in channel collection"
      };
      return response;
    })
    .catch((error: Error) => {
      throw error;
    });
  }
}