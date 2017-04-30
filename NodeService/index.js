// JSA_Service:  This is the web RESTful API that managed the game state of Just Stay Alive
//Building up the express framework
var express = require('express');
var app = express();

var sqlite3 = require('sqlite3');

function getRandomClass(){

  return {name:"Warrior",health:100,consumption:20,private_stockpile:0};
}
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
    if (err) res.send(err);
    res.json(out);
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

app.get('/checkAllTurnsPlayed', function(req, res) {
  // Open the database
  var db = new sqlite3.Database('JustStayAlive.db');
  // Grab the gameID and the player name
  var gameID = req.query.gameID;
  db.serialize(function() { // serialize
    // Check the turn status of all players and if none are zero return true
    db.all("SELECT turn_status FROM player WHERE gameID='"+gameID+"'", function(err, rows) {
      rows.forEach(function (row) {
        if (row.turn_status==0){
          res.json({turn_status:0});
        }
      });

      // Do all of the main shit
      updateMainGameState();
      res.json({turn_status:1});
    });
  });
});

function updateMainGameState(){
  // Need to do all of the calculations based on user actions.  ALSO RESET THE PLAYER TURN AND ACTION
  // Action list:
  // GroupGather -> Adds 4 resources to the public stockpile
  // PrivateGather -> Adds 2 resources to the public stockpile
  // Attack:PlayerName -> Removes 2 health from a player
  // Heal:PlayerName -> Adds 2 health to a player
  // Special -> Applies the special skill.


  var totalGroupGather = 0;
  var playerNewHealth;
  var playerNewStockpile;
  var groupNewStockpile;

  // Loop over the players and update the game states:
  db.all("SELECT * FROM player WHERE gameID='"+gameID+"'", function(err, players) {
    // For each player let us look at what happens
    players.forEach(function (player) {
      // The values of the gather and attack should come from the class properties later.
      groupGatherValue = 4;
      privateGatherValue = 2;
      attackValue = 2;
      healValue = 2;

      // Get the current player infro
      playerNewHealth = player.health;
      playerNewStockpile = player.private_stockpile;


      // Grab the action
      var action = player.action;
      var action_split = action.split(":");
      var player_action = action_split[0];
      var action_value = '';
      if (action_split>1){
        action_value = action_split[1];
      }

      switch (player_action) {
        case GroupGather:
          // Add to the totalGroupGather
          totalGroupGather = totalGroupGather + groupGatherValue;
          //db.run("UPDATE player SET turn_status=0, action='' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
          break;
        case PrivateGather:
          // Add to the private stockpile
          var new_stockpile = player.private_stockpile + privateGatherValue;
          //db.run("UPDATE player SET turn_status=0, action='',private_stockpile="+new_stockpile+"  WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
          break;
        case Attack:
          // Reduce the health of the player attacked
          var attack_current_health;
          db.all("SELECT health FROM player WHERE gameID='"+gameID+"' AND name='"+action_value+"'", function(err, players) {
              attack_current_health = players[0].health;
              var new_health = attack_current_health - attackValue;
              db.run("UPDATE player SET health="+new_health+"  WHERE gameID='"+gameID+"' AND name='"+action_value+"'");
              // Now update the game state for the player
              //db.run("UPDATE player SET turn_status=0, action='' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
          });

          break;
        case Heal:
          // Increase the health of the player healed
          var heal_current_health;
          db.all("SELECT health FROM player WHERE gameID='"+gameID+"' AND name='"+action_value+"'", function(err, players) {
              heal_current_health = players[0].health;
              var new_health = heal_current_health + healValue;
              db.run("UPDATE player SET health="+new_health+"  WHERE gameID='"+gameID+"' AND name='"+action_value+"'");
              // Now update the game state for the player
              //db.run("UPDATE player SET turn_status=0, action='' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
          });
          break;
        default:
      }

      // Now we need to calculate the new health and stuff based on consumption
      // Need the current group stockpile, pricate stockpile and consumption and health
      db.all("SELECT * FROM gamestate WHERE gameID='"+gameID+"'", function(err, rows) {
        groupNewStockpile =rows[0].group_stockpile;
        // Since we currently have access to the player data here we first remove from the private_stockpile
        playerNewStockpile = playerNewStockpile - player.consumption;
        console.log(playerNewStockpile);
        if (playerNewStockpile<0){
          groupNewStockpile = groupNewStockpile + playerNewStockpile;
          if (groupNewStockpile<0){
            playerNewHealth = playerNewHealth + groupNewStockpile;
          }
        }
        // After all of this is done we update
        db.run("UPDATE player SET turn_status=0, action='',health="+playerNewHealth+",private_stockpile="+playerNewStockpile+" WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
        db.run("UPDATE gamestate SET group_stockpile="+groupNewStockpile+", WHERE gameID='"+gameID+"'");
      });
    });

    res.json({update_status:1});
  });
}

// Applies the action
app.get('/commitPlayerTurn', function(req, res) {
  // Open the database
  var db = new sqlite3.Database('JustStayAlive.db');
  // Grab the gameID and the player name
  var gameID = req.query.gameID;
  var playerName = req.query.playerName;
  var action = req.query.action;

  db.serialize(function() { // serialize
    // Update the player action and turn_status
    db.run("UPDATE player SET turn_status=1, action='"+actionID+"' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
    res.json({update:1});
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
