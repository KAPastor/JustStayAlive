Array.prototype.allValuesSame = function() {

    for(var i = 1; i < this.length; i++)
    {
        if(this[i] !== this[0])
            return false;
    }

    return true;
}


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
                class_details.consumption+","+class_details.private_stockpile+",'Waiting','')");
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

        db.run("INSERT INTO gamestate VALUES ('"+camp_name+"','accepting_guests',0,50,2,10,'Game has been created and awaiting other players to join.')");

        db.run("INSERT INTO player VALUES ('"+camp_name+"','"+player_name+"','"+class_details.name+"',"+class_details.health+","+
         class_details.consumption+","+class_details.private_stockpile+",'Waiting','')");
        response = {response_code:"success",response_type:"success",response_desc:"You have joined the camp as a host.", response_tag:"host"};
        deferred.resolve(response);
      }
    });
  });
  return deferred.promise;
}
 app.get('/enterGame', function(req, res) {
   class_details = {};
   class_details.name = "Warrior";
   class_details.health = 100;
   class_details.consumption = 20;
   class_details.private_stockpile = 0;
   enterGame(res,req).then(function(response){
     res.jsonp(response);
   });
 });
// =============================================================================


app.get('/updatePlayerAction', function(req, res) {
  updatePlayerAction(req,res).then(function(response){
    // Check to see if all are ready and incriment the turn
    return checkAllReady(req, res);
  }).then(function(response){
    res.jsonp(response);
  });
});
function checkAllReady(req,res){
  console.log('checkAllReady')
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  db.serialize(function() {
    db.all("SELECT status FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      var valueArr = rows.map(function(item){ return item.status});
      var ready_array = valueArr.filter(function(item){
        return item=='Ready' || item=='DEAD';
      });
      if (ready_array.length == valueArr.length){
        advanceTurn(req,res).then(function(response){
          response = 1;
          deferred.resolve(response);
        });
      }
    });
  });
  return deferred.promise;
};
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


function updatePlayerAction(req, res){
  console.log('updatePlayerAction')
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = req.query.camp_name;
  var player_name = req.query.player_name;
  var action = req.query.action;
  db.serialize(function() {
    db.run("UPDATE player SET status='Ready', action='" + action + "' WHERE name='"+player_name+"' AND camp_name='" +camp_name+"'",function(){
      response = {response_code:"success",response_type:"success",response_desc:"", response_tag:""};
      deferred.resolve(response);
    });

  });
  return deferred.promise;
};

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

// function updateMainGameState(){
//   // Need to do all of the calculations based on user actions.  ALSO RESET THE PLAYER TURN AND ACTION
//   // Action list:
//   // GroupGather -> Adds 4 resources to the public stockpile
//   // PrivateGather -> Adds 2 resources to the public stockpile
//   // Attack:PlayerName -> Removes 2 health from a player
//   // Heal:PlayerName -> Adds 2 health to a player
//   // Special -> Applies the special skill.
//
//
//   var totalGroupGather = 0;
//   var playerNewHealth;
//   var playerNewStockpile;
//   var groupNewStockpile;
//
//   // Loop over the players and update the game states:
//   db.all("SELECT * FROM player WHERE gameID='"+gameID+"'", function(err, players) {
//     // For each player let us look at what happens
//     players.forEach(function (player) {
//       // The values of the gather and attack should come from the class properties later.
//       groupGatherValue = 4;
//       privateGatherValue = 2;
//       attackValue = 2;
//       healValue = 2;
//
//       // Get the current player infro
//       playerNewHealth = player.health;
//       playerNewStockpile = player.private_stockpile;
//
//
//       // Grab the action
//       var action = player.action;
//       var action_split = action.split(":");
//       var player_action = action_split[0];
//       var action_value = '';
//       if (action_split>1){
//         action_value = action_split[1];
//       }
//
//       switch (player_action) {
//         case GroupGather:
//           // Add to the totalGroupGather
//           totalGroupGather = totalGroupGather + groupGatherValue;
//           //db.run("UPDATE player SET turn_status=0, action='' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
//           break;
//         case PrivateGather:
//           // Add to the private stockpile
//           var new_stockpile = player.private_stockpile + privateGatherValue;
//           //db.run("UPDATE player SET turn_status=0, action='',private_stockpile="+new_stockpile+"  WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
//           break;
//         case Attack:
//           // Reduce the health of the player attacked
//           var attack_current_health;
//           db.all("SELECT health FROM player WHERE gameID='"+gameID+"' AND name='"+action_value+"'", function(err, players) {
//               attack_current_health = players[0].health;
//               var new_health = attack_current_health - attackValue;
//               db.run("UPDATE player SET health="+new_health+"  WHERE gameID='"+gameID+"' AND name='"+action_value+"'");
//               // Now update the game state for the player
//               //db.run("UPDATE player SET turn_status=0, action='' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
//           });
//
//           break;
//         case Heal:
//           // Increase the health of the player healed
//           var heal_current_health;
//           db.all("SELECT health FROM player WHERE gameID='"+gameID+"' AND name='"+action_value+"'", function(err, players) {
//               heal_current_health = players[0].health;
//               var new_health = heal_current_health + healValue;
//               db.run("UPDATE player SET health="+new_health+"  WHERE gameID='"+gameID+"' AND name='"+action_value+"'");
//               // Now update the game state for the player
//               //db.run("UPDATE player SET turn_status=0, action='' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
//           });
//           break;
//         default:
//       }
//
//       // Now we need to calculate the new health and stuff based on consumption
//       // Need the current group stockpile, pricate stockpile and consumption and health
//       db.all("SELECT * FROM gamestate WHERE gameID='"+gameID+"'", function(err, rows) {
//         groupNewStockpile = parseInt(rows[0].group_stockpile);
//         // Since we currently have access to the player data here we first remove from the private_stockpile
//         playerNewStockpile = playerNewStockpile - player.consumption;
//         console.log(playerNewStockpile);
//         if (playerNewStockpile<0){
//           groupNewStockpile = groupNewStockpile + playerNewStockpile;
//           if (groupNewStockpile<0){
//             playerNewHealth = playerNewHealth + groupNewStockpile;
//           }
//         }
//         // After all of this is done we update
//         db.run("UPDATE player SET turn_status=0, action='',health="+playerNewHealth+",private_stockpile="+playerNewStockpile+" WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
//         db.run("UPDATE gamestate SET group_stockpile="+groupNewStockpile+", WHERE gameID='"+gameID+"'");
//       });
//     });
//
//     res.json({update_status:1});
//   });
// }
//
// // Applies the action
// app.get('/commitPlayerTurn', function(req, res) {
//   // Open the database
//   var db = new sqlite3.Database('JustStayAlive.db');
//   // Grab the gameID and the player name
//   var gameID = req.query.gameID;
//   var playerName = req.query.playerName;
//   var action = req.query.action;
//
//   db.serialize(function() { // serialize
//     // Update the player action and turn_status
//     db.run("UPDATE player SET turn_status=1, action='"+actionID+"' WHERE gameID='"+gameID+"' AND name='"+playerName+"'");
//     res.json({update:1});
//   });
// });





app.listen(3000)
var  bodyParser = require('body-parser'); // Middleware to read POST data

// Set up body-parser.
// To parse JSON:
app.use(bodyParser.json());
// To parse form data:
app.use(bodyParser.urlencoded({
  extended: true
}));
