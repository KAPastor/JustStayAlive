var enter_game_class = new Object();


enter_game_class.generate_gamestate = function (data,Q,sqlite3) {
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = data.camp_name;
  var player_name = data.player_name;
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
};

enter_game_class.send_player_list = function (data,Q,sqlite3) {
  console.log('___ ___ Send player list');
  var deferred  = Q.defer();
  var db = new sqlite3.Database('JustStayAlive.db');
  var camp_name = data.camp_name;
  var player_list=[];
  db.serialize(function() {
    db.all("SELECT name FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      response = {response_code:"success",response_type:"success",response_desc:"", response_val:rows};
      deferred.resolve(response);
    });
  });
  return deferred.promise;
}


enter_game_class.run_socket = function (socket,Q,sqlite3) {
  socket.on('enter_game', function (data) {
    class_details = {};
    class_details.name = "Warrior";
    class_details.health = 100;
    class_details.consumption = 20;
    class_details.private_stockpile = 0;

    enter_game_class.generate_gamestate(data,Q,sqlite3).then(function(response){
      console.log('___ ___ Executed game enter');
      socket.emit('enter_game',response,function(){
        enter_game_class.send_player_list(data,Q,sqlite3).then(function(response){
          socket.emit('update_lobby',response);
        });
      });
    });

  });
};

module.exports = enter_game_class;
