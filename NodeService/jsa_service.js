// JSA Service: ================================================================
// Defines the web sockets and logic to serve the various clients

var environment = process.env.NODE_ENV;
if (environment=='DEV'){
  console.log('============== JSA Service DEV ================');
}else{
  console.log('========== JSA Service Production =============');
}

var express = require('express');             // Express framework
var Q = require('q');                         // Deferred promise
var common = require("./common/common.js");   // Common .js functions
var sqlite3 = require('sqlite3');             // Database module
var db = new sqlite3.Database('JustStayAlive.db');

// Segmented functionality
var enter_game_socket = require('./sockets/enter_game.js');
var start_game_socket = require('./sockets/start_game.js');
var update_player_action_class = require('./sockets/update_player_action.js');


// Set up the server and web sockets
var app = express();
var server = app.listen(3000)
var io = require('socket.io').listen(server);

// Update the CORS headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// Define the connections and socket logic
io.on('connection', function(socket){
  console.log('___ A user connected: ' + socket.id);
  socket.on('disconnected', function(){
    console.log('___ A user disconnected: ' + socket.id);
  });

  enter_game_socket.run_socket(io,socket,Q,db);
  start_game_socket.run_socket(io,socket,Q,db);
  update_player_action_class.run_socket(io,socket,Q,db);
});












// refreshGameview : Refreshes the visual display on the client side
function refreshGameview(req,res){
  var dataset={};
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_name = req.query.player_name;
  var player_list;
  var player_info;


  rgv_playerList(req,res).then(function(response){
    dataset.player_list = response.player_list;
    return rgv_communityInfo(req,res);
  }).then(function(response){
    dataset.community_info = response.community_info;
    return rgv_playerInfo(req,res);
  }).then(function(response){
    dataset.player_info = response.player_info;
    deferred.resolve(dataset);
  });

   return deferred.promise;

};
// Get player list
function rgv_playerInfo(req,res){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_name = req.query.player_name;
  var response={};
  db.serialize(function() {
    db.all("SELECT class,health,consumption,private_stockpile FROM player WHERE camp_name='"+camp_name+"' AND name='"+player_name+"'" , function(err, rows) {
      response.player_info=rows[0];
      player_info = rows[0];
      deferred.resolve(response);
    });
  });
  return deferred.promise;
};
function rgv_playerList(req,res){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var response={};
  db.serialize(function() {
    db.all("SELECT name,status FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      response.player_list=rows;
      deferred.resolve(response);
    });
  });
  return deferred.promise;
};
function rgv_communityInfo(req,res){
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var response={};
  db.serialize(function() {
    db.all("SELECT group_stockpile,turn_number FROM gamestate WHERE camp_name='"+camp_name+"'", function(err, rows) {
      response.community_info=rows[0];
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


app.get('/reset_database', function(req, res) {
  var db = new sqlite3.Database('JustStayAlive.db');
  console.log('Reset Database');
  db.serialize(function() {
    db.run("DELETE FROM gamestate");
    db.run("DELETE FROM player");

  });
});





function at_Heal(db,camp_name){
  console.log('Heal Turn')

  var deferred  = Q.defer();
  db.serialize(function() {
    db.all("SELECT action FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      // Loop over the action and look for a string 'heal_player'
      rows.forEach(function(element){
        var res = element.action.split(":");
        if (res.length==2){
          // Check for attack of heal:
          if (res[0]=='heal_player'){
            // Do the action
            db.all("SELECT health FROM player WHERE camp_name='"+camp_name+"' AND name='"+res[1]+"'" , function(err_heal, rows_heal) {
              db.run("UPDATE player SET health="+(rows_heal[0].health+2)+", action='', status='Advancing' WHERE  camp_name='" +camp_name+"' AND name='"+res[1]+"'" );
              deferred.resolve(response);
            });
          }
        }
      });
      deferred.resolve(response);
    });
  });
  return deferred.promise;
}
function at_Attack(db,camp_name){
  console.log('Attack Turn')

  var deferred  = Q.defer();
  db.serialize(function() {
    db.all("SELECT action FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      // Loop over the action and look for a string 'heal_player'
      rows.forEach(function(element){
        var res = element.action.split(":");
        if (res.length==2){
          // Check for attack of heal:
          if (res[0]=='attack_player'){
            // Do the action
            db.all("SELECT health FROM player WHERE camp_name='"+camp_name+"' AND name='"+res[1]+"'" , function(err_attack, rows_attack) {
              db.run("UPDATE player SET health="+(rows_attack[0].health-2)+", action='', status='Advancing' WHERE  camp_name='" +camp_name+"' AND name='"+res[1]+"'" );
              deferred.resolve(response);
            });
          }
        }
      });
      deferred.resolve(response);
    });
  });
  return deferred.promise;
}

function at_CollectPrivate(db,camp_name){
  console.log('Private Collect Turn')

  var deferred  = Q.defer();
  db.serialize(function() {
    db.all("SELECT action,name FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      // Loop over the action and look for a string 'heal_player'
      rows.forEach(function(element){
        var res = element.action.split(":");
        if (res.length==1){
          if (res[0]=='private_collect'){
            db.all("SELECT private_stockpile FROM player WHERE camp_name='"+camp_name+"' AND name='"+element.name+"'" , function(err_pc, rows_pc) {
              db.run("UPDATE player SET private_stockpile="+(rows_pc[0].private_stockpile+2)+", action='', status='Advancing' WHERE  camp_name='" +camp_name+"' AND name='"+element.name+"'" );
              deferred.resolve(response);
            });
          }
        }
      });
      deferred.resolve(response);
    });
  });
  return deferred.promise;
}

function at_CollectCommunity(db,camp_name){
  console.log('Group Collect Turn')

  var deferred  = Q.defer();
  db.serialize(function() {
    db.all("SELECT action,name FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      // Loop over the action and look for a string 'heal_player'
      rows.forEach(function(element){
        var res = element.action.split(":");
        if (res.length==1){
          if (res[0]=='community_collect'){
            db.all("SELECT group_stockpile FROM gamestate WHERE camp_name='"+camp_name+"'" , function(err_cc, rows_cc) {
              db.run("UPDATE gamestate SET group_stockpile="+(rows_cc[0].group_stockpile+8)+" WHERE  camp_name='" +camp_name+"'");
              db.run("UPDATE player SET action='', status='Advancing' WHERE  camp_name='" +camp_name+"' AND name='"+element.name+"'" );
              deferred.resolve(response);
            });
          }
        }
      });
      deferred.resolve(response);
    });
  });
  return deferred.promise;
}

function at_GroupConsumption(db,camp_name){
  console.log('Group Consumption Turn')

  var deferred  = Q.defer();
  db.serialize(function() {
    db.all("SELECT consumption FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      var total_consumption = 0;
      var num_players = rows.length;
      rows.forEach(function(element){
        total_consumption = total_consumption + element.consumption;
      });
      //Now take the total consumptions and find out the current group_stockpile
      db.all("SELECT group_stockpile FROM gamestate WHERE camp_name='"+camp_name+"'", function(err_1, rows_1) {
        var current_gs = rows_1[0].group_stockpile;

        // Find the difference
        var delta = current_gs-total_consumption;
        if (delta < 0){
          // We just ran out of food...
          current_gs = 0; // Food is set to zero
          // Find the consumption to give to each player_name
          delta = -Math.round(delta/num_players);
          // Now do the update to the gamestate
          db.run("UPDATE gamestate SET group_stockpile="+current_gs+" WHERE  camp_name='" +camp_name+"'",function(){
            // Now we need to call the private consumption method with the delta
            at_PrivateConsumption(db,camp_name,delta).then(function(){
              deferred.resolve(1);
            });
          });
        }else{
          db.run("UPDATE gamestate SET group_stockpile="+delta+" WHERE  camp_name='" +camp_name+"'",function(){
            // Now we need to call the private consumption method with the delta
            delta = 0; // Since the user does not need to dip into their stock.
            at_PrivateConsumption(db,camp_name,delta).then(function(){
              deferred.resolve(1);
            });
          });
        }
      });
    });
  });
  return deferred.promise;
}

function at_PrivateConsumption(db,camp_name,need){
  console.log('Private Consumption Turn')
  var deferred  = Q.defer();
  db.serialize(function() {
    db.all("SELECT name,health,private_stockpile FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      rows.forEach(function(player){ // Loop over the players
        var current_stock = player.private_stockpile; // Current stock
        var curret_health = player.health;
        var name = player.name;

        current_stock = current_stock - need;
        if(current_stock<0){ // Bring the pain
          curret_health = curret_health + current_stock;
          current_stock = 0;
          if (curret_health<=0){// YOu dead
            db.run("UPDATE player SET status='DEAD', health="+curret_health+", private_stockpile="+current_stock+" WHERE  camp_name='" +camp_name+"' AND name='" +name+"'",function(){
              //deferred.resolve(1);
            });
          }else{
            console.log(curret_health)
            console.log(current_stock)
            console.log("UPDATE player SET health="+curret_health+", private_stockpile="+current_stock+" WHERE  camp_name='" +camp_name+"' AND name='" +name+"'")
            db.run("UPDATE player SET health="+curret_health+", private_stockpile="+current_stock+" WHERE  camp_name='" +camp_name+"' AND name='" +name+"'",function(){
              //deferred.resolve(1);
            });
          }
        }else{
          db.run("UPDATE player SET private_stockpile="+current_stock+" WHERE  camp_name='" +camp_name+"' AND name='" +name+"'",function(){
            //deferred.resolve(1);
          });
        }
      });
      deferred.resolve(1);

    });


  });
  return deferred.promise;
}
function at_StepTurn(db,camp_name){
  console.log('Stepping Turn')

  var deferred  = Q.defer();
  db.serialize(function() {
    db.all("SELECT turn_number FROM gamestate WHERE camp_name='"+camp_name+"'", function(err, rows) {
      var current_turn = rows[0].turn_number;
      current_turn = current_turn + 1;
      if (current_turn > 10){ // Game is complete
        db.run("UPDATE gamestate SET status='Game Over' WHERE camp_name='" +camp_name+"'", function(){
          db.run("UPDATE player SET status='WINNER!', action='' WHERE status='Advancing' AND camp_name='" +camp_name+"'",function(){
            deferred.resolve(1);
          });
        });
      }else{
        db.run("UPDATE gamestate SET turn_number="+current_turn+" WHERE camp_name='" +camp_name+"'", function(){
          db.run("UPDATE player SET status='Waiting', action='' WHERE status='Advancing' AND camp_name='" +camp_name+"'",function(){
            deferred.resolve(1);
          });
        });
      }

    });
  });
  return deferred.promise;
}



function advanceTurn(req,res){
  console.log('Advancing Turn')
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_name = req.query.player_name;

  // Steps for turn advancement:
  // 1. Heal first
  // 2. Collect private food
  // 3. Collect community food
  // 4. Apply group consumption
  // 5. Reduce private stockpile if not enough community food
  // 6. Reduce health if no food
  // 7. Apply attack

  at_Heal(db,camp_name).then(function(){
    return at_CollectPrivate(db,camp_name)
  }).then(function(){
    return at_CollectCommunity(db,camp_name)
  }).then(function(){
    return at_Attack(db,camp_name)
  }).then(function(){
    return at_GroupConsumption(db,camp_name)
  }).then(function(){
    return at_StepTurn(db,camp_name)
  }).then(function(){
    deferred.resolve(1);
  });
   return deferred.promise;

};


// function updatePlayerAction(req, res){
//   console.log('updatePlayerAction')
//   var deferred  = Q.defer();
//   var db = new sqlite3.Database('JustStayAlive.db');
//   var camp_name = req.query.camp_name;
//   var player_name = req.query.player_name;
//   var action = req.query.action;
//   db.serialize(function() {
//     db.run("UPDATE player SET status='Ready', action='" + action + "' WHERE name='"+player_name+"' AND camp_name='" +camp_name+"'",function(){
//       response = {response_code:"success",response_type:"success",response_desc:"", response_tag:""};
//       deferred.resolve(response);
//     });
//
//   });
//   return deferred.promise;
// };

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





var  bodyParser = require('body-parser'); // Middleware to read POST data

// Set up body-parser.
// To parse JSON:
app.use(bodyParser.json());
// To parse form data:
app.use(bodyParser.urlencoded({
  extended: true
}));
