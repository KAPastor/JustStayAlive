// JSA_Service:  This is the web RESTful API that managed the game state of Just Stay Alive
//Building up the express framework
var express = require('express');
var app = express();

<<<<<<< HEAD
var sqlite3 = require('sqlite3');


app.get('/createGame', function(req, res) {
  // Open the database
  var db = new sqlite3.Database('JustStayAlive.db');
  // Grab the gameID and the player name
  var gameID = req.query.gameID;
  var playerName = req.query.playerName;

  // We will need to first determine if the game name is already taken, then if not
  // insert the new record into the database
  db.serialize(function() { // serialize
    //First see if the game exists
    var q_checkGameID = "SELECT * FROM gamestate WHERE gameID='"+gameID+"'";
    var gameID_available = true;
    db.all("SELECT * FROM gamestate WHERE gameID='"+gameID+"'", function(err, rows) {
      if (rows.length>0){
        gameID_available = false;
      }
      // Now we will check to see if the game state existed and return a message if so
      if (gameID_available){
        // If it is available then we can insert the new game into the database and add the playerName and give a class
        db.run("INSERT INTO gamestate VALUES ('"+gameID+"',0,0,100,2,10,'Game has been created and awaiting other players to join.')");
        // Add the player to the game (NEED TO GET A CLASS)
        class_details = getRandomClass()
        db.run("INSERT INTO player VALUES ('"+gameID+"','"+playerName+"','"+class_details.name+"',"+class_details.health+","+
          class_details.consumption+","+class_details.private_stockpile+",0,0)");
        res.json({response_code:1,class:{name:class_details.name,health:class_details.health,consumption:class_details.consumption,private_stockpile:class_details.private_stockpile}});
      }else{// If the game ID was taken...
        res.json({response_code:0,response_desc:"Game ID is taken."});
      }
    });
  });
});

app.get('/joinGame', function(req, res) {
  // Open the database
  var db = new sqlite3.Database('JustStayAlive.db');
  // Grab the gameID and the player name
  var gameID = req.query.gameID;
  var playerName = req.query.playerName;

  // We will need to first determine if the game name is already taken, then if not
  // insert the new record into the database
  db.serialize(function() { // serialize
    //First see if the game exists
    var q_checkGameID = "SELECT * FROM gamestate WHERE gameID='"+gameID+"'";
    var gameID_available = false;
    db.all("SELECT * FROM gamestate WHERE gameID='"+gameID+"'", function(err, rows) {
      if (rows.length>0){
        gameID_available = true;
      }
      // Now we will check to see if the game state existed and return a message if so
      if (gameID_available){
        // Check to see if the player name is taken
        db.all("SELECT * FROM player WHERE name='"+playerName+"'", function(err, rows) {
          if (rows.length>0){
            res.json({response_code:10,response_desc:"Player name is taken."});
          }else{
            // Add the player to the game (NEED TO GET A CLASS)
            class_details = getRandomClass()
            db.run("INSERT INTO player VALUES ('"+gameID+"','"+playerName+"','"+class_details.name+"',"+class_details.health+","+
              class_details.consumption+","+class_details.private_stockpile+",0,0)");
            res.json({response_code:1,class:{name:class_details.name,health:class_details.health,consumption:class_details.consumption,private_stockpile:class_details.private_stockpile}});
          }
        });
      }else{// If the game ID was taken...
        res.json({response_code:0,response_desc:"Game ID is not available."});
=======
// We use nedb for the storage of the game state (NoSQL)
// The gamestate.db is the database file that updates each groups game under certain conditions.
// When a new game is created they should get a 4 character room name.  This will be the parent object.

// AFTER ROOM IS CREATED AND WE ARE WAITING FOR USERS TO JOIN, AS THEY JOIN THE RECORD IS UPDATED.  CURRENTLY ONLY ONE HAS JOINED
// They are given a random classID and based on this we keep the details of the game for each player
var gamestate_example =
{ group_name: "QRS4",
  game_status: {description:"Waiting for players to join.", code:1},
  turn_number:-1,
  group_details: {stockpile:100},
  number_of_players:3,
  player_details:[
    {name:"kyle",class_ID:2,current_health:100,current_consumption:20,private_stockpile:20,turn_status:0,
    turn_action:{}},
    {name:"ash",class_ID:1,current_health:90,current_consumption:23,private_stockpile:20,turn_status:1,
    turn_action:{name:"private_gather",value:"2"}}
  ],
  max_turns:10
};


var Datastore = require('nedb');
var db = new Datastore({
  filename: 'gamestate.db', // provide a path to the database file
  autoload: true, // automatically load the database
  timestampData: true // automatically add and manage the fields createdAt and updatedAt
});

//
//
// //Save this goal to the database.
// db.insert(gamestate_example, function(err, newGoal) {
//  if (err) console.log(err);
//  console.log(newGoal);
// });


//Actions:
//name:"private_gather",value:"2"}
//name:"group_gather",value:"2"}
//name:"heal",value:"2"}
//name:"attack",value:"2|kyle"}
//name:"class_skill",value:"class_ID"}


//STEPS:  Someone requests a new game locally:
  // 1. This calls POST -> createNewGame (ID from user random generated, # of players)
    // Checks for uniqueness or staleness then if not makes empty game state
    // Activity alerts the user that other players can join.  The host is given a random character and is taken to the main activity with a waiting dialog
    // Status Code is 1 which means people are able to join.
// Other user joins game:
  // Calls GET -> joinGame(ID)
  // Gives user a random class and adds to player list: calculates total number of players and if it is the number_of_players executes a POST callback.

  // POST -> startGame(ID):
    // Modifies the game state to make  game status to 0 ie. Game is closed for joining.
    // Callback calls POST for incrimentGameTurn:

// POST -> incrimentGameTurn(ID)
  // If turn is -1:
    // No event is set,only turn number is incremented and users are now allowed to play
  // Else
    // Check to see if everyone has played their turns
    // Increments the turn_number, generates a new event
    // Checks to see the max_turns and issues a fail if they are done.
    // Updates the stockpile
    // Updates player details based on their actions



 // When a user submits actions:
 // POST -> updateUserAction (ID, name, action, value)
  // Ipdates the users information for the turn
    // Issues call for GET nextTurnReady:
    // GET: nextTurnReady -> Checks to see if all users have submitted actions.  Returns true/false
    // GET: updateUserActvity -> Get the updated user data and will use the return to update local game state






// Let us check that we can save to the database.
// Define a goal.
// var goal = {
//   description: 'Do 10 minutes meditation every day',
// };
//

function isBigEnough(value) {
  return value >= 10;
}

app.get('/getGroupName', function(req, res) {
  var getGroupName = req.query.group_name;
  console.log(getGroupName);

  db.find({"player_details.name": getGroupName},function(err, goal) {
    // iterate over each element in the array
    var pd = goal[0].player_details;
    var out;
    for (var i = 0; i < pd.length; i++){
      // look for the entry with a matching `code` value
      if (pd[i].name == getGroupName){
        console.log(pd[i]);
        out = pd[i];
         // we found it
        // obj[i].name is the matched result
>>>>>>> parent of d8423b4... create join and check all
      }
    }


    if (err) res.send(err);
    res.json(out);
  });
});

<<<<<<< HEAD
app.get('/allPlayersJoined', function(req, res) {
  // Open the database
  var db = new sqlite3.Database('JustStayAlive.db');
  // Grab the gameID and the player name
  var gameID = req.query.gameID;
  db.serialize(function() { // serialize
    // See if the number of players in the player table is the same as the num_players
    db.all("SELECT num_players FROM gamestate WHERE gameID='"+gameID+"'", function(err, rows) {
      number_of_players = rows[0].num_players;
      db.all("SELECT COUNT(*) FROM player WHERE gameID='"+gameID+"'", function(err, rows) {
        ready_players = rows[0]['COUNT(*)'];
        if (ready_players == number_of_players){
          res.json({response_code:-1,response_desc:"READY TO PLAY"});
        }else{
          res.json({response_code:-2,waiting_on:number_of_players-ready_players});
        }
      });
    });
=======

app.get('/checkGameID', function(req, res) {
  var gameID = req.query.game_ID;
  console.log(gameID);

  db.find({"group_name": gameID},function(err, result) {
    console.log(result);
    if (result.length!=0) {
    //do something
    result = "1";
  }else {
    result = "0";
  }
    if (err) res.send(err);
    res.json(result);
>>>>>>> parent of d8423b4... create join and check all
  });
});

app.get('/checkPlayerGameState', function(req, res) {
  // Open the database
  var db = new sqlite3.Database('JustStayAlive.db');
  // Grab the gameID and the player name
  var gameID = req.query.gameID;
  var playerName = req.query.playerName;
  db.serialize(function() { // serialize
    // Need everything the player is allowed to see on their own screen.
    // Health, Consumption, private_stockpile, other player names, group stockpile
    gamestateObj = {};
    db.all("SELECT group_stockpile FROM gamestate WHERE gameID='"+gameID+"'", function(err, rows) {
      gamestateObj['group_stockpile'] = rows[0].group_stockpile;
      db.all("SELECT * FROM player WHERE gameID='"+gameID+"' AND name='"+playerName+"'", function(err, rows) {
        gamestateObj['health'] = rows[0].health;
        gamestateObj['consumption'] = rows[0].consumption;
        gamestateObj['private_stockpile'] = rows[0].private_stockpile;
        db.all("SELECT name FROM player WHERE gameID='"+gameID+"'", function(err, rows) {
          var player_array = [];
          rows.forEach(function (row) {
            player_array.push(row.name);
          });
          gamestateObj['player_list'] = player_array;
          res.json(gamestateObj);
        });
      });
    });
  });
});



app.get('/', function(req, res) {
  res.json({notes: "This is your notebook. Edit this to start saving your notes!"})
})
app.get('/goals', function(req, res) {
  db.find({}).sort({
    updatedAt: -1
  }).exec(function(err, goals) {
    if (err) res.send(err);
    res.json(goals);
  });
});

app.post('/goals', function(req, res) {
  var goal = {
    description: req.body.description,
  };
  db.insert(goal, function(err, goal) {
    if (err) res.send(err);
    res.json(goal);
  });
});


app.get('/goals/:id', function(req, res) {
  var goal_id = req.params.id;
  db.findOne({
    _id: goal_id
  }, {}, function(err, goal) {
    if (err) res.send(err);
    res.json(goal);
  });
});

// DELETE a goal.
// (Accessed at DELETE http://localhost:8080/goals/goal_id)
app.delete('/goals/:id', function(req, res) {
  var goal_id = req.params.id;
  db.remove({
    _id: goal_id
  }, {}, function(err, goal) {
    if (err) res.send(err);
    res.sendStatus(200);
  });
});


app.listen(3000)
var  bodyParser = require('body-parser'); // Middleware to read POST data

// Set up body-parser.
// To parse JSON:
app.use(bodyParser.json());
// To parse form data:
app.use(bodyParser.urlencoded({
  extended: true
}));
