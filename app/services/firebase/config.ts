let admin = require("firebase-admin");
const serviceAccount = require("../../../colorimage-94768-firebase-adminsdk-lp0db-682fa143aa.json");
  
const drawingApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://colorimage-94768-default-rtdb.firebaseio.com",
    },
    "drawingApp");

const lobbyApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://colorimage-lobby.firebaseio.com"
    },
    "lobbyApp");

const drawingsDB = admin.database(drawingApp);
const lobbiesDB = admin.database(lobbyApp);

export { admin, drawingsDB, lobbiesDB}