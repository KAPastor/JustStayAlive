// JSA_Service:  This is the web RESTful API that managed the game state of Just Stay Alive
//Building up the express framework
var express = require('express');
var Q = require('q');

var app = express();

var sqlite3 = require('sqlite3');

function getRandomClass(){

  return {name:"Warrior",health:100,consumption:20,private_stockpile:0};
}



app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

 app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   next();
 });

// refreshGameview : Refreshes the visual display on the client side
function refreshGameview(req,res){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_name = req.query.player_name;
  var player_list;
  var player_info;

   rgv_playerList(req,res).then(function(player_list){
     db.serialize(function() {
       // Now we will get the players current status (class,health,consumption,private_stockpile)
       db.all("SELECT class,health,consumption,private_stockpile FROM player WHERE camp_name='"+camp_name+"' AND name='"+player_name+"'" , function(err, rows) {
         console.log(rows);
         player_info = rows[0];
         response = {response_code:"success",response_type:"success",response_desc:"Good",player_info:player_info,player_list:player_list};
         deferred.resolve(response);
       });
     });
   });
   return deferred.promise;

};
// Get player list
function rgv_playerList(req,res){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  db.serialize(function() {
    db.all("SELECT name,status FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      response =rows;
      deferred.resolve(response);
    });
  });
  return deferred.promise;
};
// Get player list
function rgv_communityInfo(req,res){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  db.serialize(function() {
    db.all("SELECT group_stockpile,turn_number FROM gamestate WHERE camp_name='"+camp_name+"'", function(err, rows) {
      response=rows[0];
      deferred.resolve(response);
    });
  });
  return deferred.promise;
};

app.get('/refreshGameview', function(req, res) {
  refreshGameview(req,res).then(function(response){
    res.jsonp(response);
  });
});
//==============================================================================









 // enterGame: Checks and enters the camp as either a host or guest and returns the appropriate info.
function enterGame(res,req){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_name = req.query.player_name;
  var response={response_code:"alert_player",response_type:"danger",response_desc:"Unassigned."};
  db.serialize(function() { // serialize
    // ==== Check to see if the camp name already exists =====
    db.all("SELECT * FROM gamestate WHERE camp_name='"+camp_name+"'", function(err, rows) {
      if (rows.length==1){ // If this is true then the camp name already exists
        // Now we check to see the game status and if it is open for guests we can go ahead and add a guest.
        if (rows[0].status == "accepting_guests"){ // The game has been created but is still accepting guest players
          // Check to see if your player name has been taken already
          db.all("SELECT * FROM player WHERE camp_name='"+camp_name+"' AND name='" + player_name + "'", function(err, rows) {
             if (rows.length==1){ // In the name is taken send the message back:
               response = {response_code:"alert_player",response_type:"warning",response_desc:"That player name is already in the camp. Please try another name."};
               deferred.resolve(response);
             }else{ //Add the player to the camp
               db.run("INSERT INTO player VALUES ('"+camp_name+"','"+player_name+"','"+class_details.name+"',"+class_details.health+","+
                class_details.consumption+","+class_details.private_stockpile+",0,0)");
               response = {response_code:"success",response_type:"success",response_desc:"You have joined the camp as a guest.", response_tag:"guest"};
               deferred.resolve(response);
             }
          });
        }else{
          response = {response_code:"alert_player",response_type:"warning",response_desc:"The camp has closed it's doors to guests.  Please try another camp."};
          deferred.resolve(response);

        }
      }else{ // In this case the game does not exist and the player will be the host. We need to make a new game state here.
        // Create the game state and add host as first player
        db.run("INSERT INTO gamestate VALUES ('"+camp_name+"','accepting_guests',0,100,2,10,'Game has been created and awaiting other players to join.')");

        db.run("INSERT INTO player VALUES ('"+camp_name+"','"+player_name+"','"+class_details.name+"',"+class_details.health+","+
         class_details.consumption+","+class_details.private_stockpile+",0,0)");
        response = {response_code:"success",response_type:"success",response_desc:"You have joined the camp as a host.", response_tag:"host"};
        deferred.resolve(response);
      }
    });
  });
  return deferred.promise;
}
 app.get('/enterGame', function(req, res) {
   class_details = {};
   class_details.name = "test";
   class_details.health = 1;
   class_details.consumption = 1;
   class_details.private_stockpile = 10;
   enterGame(res,req).then(function(response){
     res.jsonp(response);
   });
 });
// =============================================================================

// getCampStatus ---------------------------------------------------------------
function getCampStatus(res,req){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_list=[];
  db.serialize(function() {
    db.all("SELECT status FROM gamestate WHERE camp_name='"+camp_name+"'", function(err, rows) {
      response = {response_code:"success",response_type:"success", response_val:rows[0]};
      deferred.resolve(response);
    });
  });
  return deferred.promise;
}
app.get('/getCampStatus', function(req, res) {
  getCampStatus(res,req).then(function(response){
    res.jsonp(response);
  });
});
// =============================================================================




// getPlayerList ---------------------------------------------------------------
function getPlayerList(res,req){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_list=[];
  db.serialize(function() {
    db.all("SELECT name FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      response = {response_code:"success",response_type:"success",response_desc:"", response_val:rows};
      deferred.resolve(response);
    });
  });
  return deferred.promise;
}
app.get('/getPlayerList', function(req, res) {
  getPlayerList(res,req).then(function(response){
    res.jsonp(response);
  });
});
// =============================================================================

// startGameSession ---------------------------------------------------------------
function startGameSession(res,req){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_list=[];
  db.serialize(function() {
    db.run("UPDATE gamestate SET status='Game is in session.' WHERE camp_name='"+camp_name+"'");
    response = {response_code:"success",response_type:"success",response_desc:"Game has started."};
    deferred.resolve(response);
  });
  return deferred.promise;
}
app.get('/startGameSession', function(req, res) {
  startGameSession(res,req).then(function(response){
    res.jsonp(response);
  });
});
// =============================================================================












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
