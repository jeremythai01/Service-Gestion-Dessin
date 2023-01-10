import { DATABASE_URL } from "../../const/database_url";
import { MongoClient } from "mongodb";

// Singleton class
export namespace DbConnection {

    var db = null;

    async function DbConnect() {
        try {
            const URL = DATABASE_URL;
            let _db = await MongoClient.connect(URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
              });
            return _db
        } catch (e) {
            return e;
        }
    }

   export async function GetInstance() {
        try {
            if (db != null) {
                console.log(`db connection is already alive`);
                return db;
            } else {
                db = await DbConnect();
                return db; 
            }
        } catch (e) {
            return e;
        }
    }
}