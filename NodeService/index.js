// JSA_Service:  This is the web RESTful API that managed the game state of Just Stay Alive
//Building up the express framework
var express = require('express');
var app = express();

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
      }
    });
  });
});

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




function getRandomClass(){
  n = Math.floor(Math.random() * (2 - 0)) + 0;
  var class_details = [
    {name:"Warrior",health:100,consumption:20,private_stockpile:20},
    {name:"Thief",health:80,consumption:10,private_stockpile:0}
  ];

  return class_details[n];
}


app.listen(3000)
var  bodyParser = require('body-parser'); // Middleware to read POST data

// Set up body-parser.
// To parse JSON:
app.use(bodyParser.json());
// To parse form data:
app.use(bodyParser.urlencoded({
  extended: true
}));
