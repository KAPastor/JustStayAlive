var start_game_class = new Object();

start_game_class.startGameSession = function (data,Q,db) {
  var deferred  = Q.defer();
  var camp_name = data.camp_name;
  db.serialize(function() {
    db.run("UPDATE gamestate SET status='Game is in session.' WHERE camp_name='"+camp_name+"'");
    response = {response_code:"success",response_type:"success",response_desc:"Game has started."};
    deferred.resolve(response);
  });
  return deferred.promise;
}


start_game_class.run_socket = function (io,socket,Q,db) {
  socket.on('start_game', function (data) {
    console.log(data)
    start_game_class.startGameSession(data,Q,db).then(function(response){
      var passback = {data:data,response:response};
      console.log('___ Emitting start game');
      console.log(passback)
      io.to(passback.data.camp_name).emit('start_game',passback);
    });

  });
};

module.exports = start_game_class;
