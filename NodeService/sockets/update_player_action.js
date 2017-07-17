var update_player_action_class = new Object();

update_player_action_class.update_player = function (socket,data,Q,db) {
  var deferred  = Q.defer();
  var camp_name = data.camp_name;
  var player_name = data.player_name;
  var action = data.action;
  console.log(data)
  db.serialize(function() {
    db.run("UPDATE player SET status='Ready', action='" + action + "' WHERE name='"+player_name+"' AND camp_name='" +camp_name+"'",function(){
      response = {response_code:"success",response_type:"success",response_desc:"", response_tag:""};
      deferred.resolve(response);
    });
  });
  return deferred.promise;
};

update_player_action_class.check_all_ready = function (io,socket,data,Q,db) {
  var deferred  = Q.defer();
  var camp_name = data.camp_name;
  db.serialize(function() {
    db.all("SELECT name,status FROM player WHERE camp_name='"+camp_name+"'", function(err, rows) {
      var status_array = rows.map(function(item){ return item.status});

      var response = {player_list:rows};
      var passback = {data:{camp_name:data.camp_name},response:response};

      console.log(passback)
      console.log('___ Updating the community')
      io.to(passback.data.camp_name).emit('update_community',passback);

      var ready_array = status_array.filter(function(item){
        return item=='Ready' || item=='DEAD';
      });

      // if (ready_array.length == valueArr.length){
      //   advanceTurn(req,res).then(function(response){
      //     response = 1;
      //     deferred.resolve(response);
      //   });
      // }

    });
  });
  return deferred.promise;
};


update_player_action_class.run_socket = function (io,socket,Q,db) {
  socket.on('update_player_action', function (data) {
    // The first thing to do is to update the current state of the player
    update_player_action_class.update_player(socket,data,Q,db).then(function(response){
      return update_player_action_class.check_all_ready(io,socket,data,Q,db);
    });
  });
};

module.exports = update_player_action_class;
