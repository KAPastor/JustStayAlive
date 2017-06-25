poll_interval = setInterval(function(){ refresh_gameview(camp_name,player_name); }, 1000);


function refresh_gameview(){
  $.ajax({
      url: "http://192.168.0.196:3000/refreshGameview",
      type: "POST",
      data: {
          camp_name: camp_name,
          player_name: player_name
      },
      crossDomain:true,
      dataType : 'jsonp ',
      contentType: 'application/json',
      cache: false,
      success: function(res) {
        // Update the status of the gameview
        $('#player_food').html('Private Food: '+res.player_info.private_stockpile);
        $('#player_health').html('Health: '+res.player_info.health);
        $('#player_consumption').html('Consumption: '+res.player_info.consumption + '/Turn');
        $('#player_class').html('Class: '+res.player_info.class);

        $('#community_food').html('Community Food: '+res.community_info.group_stockpile);
        $('#community_day').html('Day: '+res.community_info.turn_number);

        // Update the player list
        var html = res.player_list.map(function (player) {
          return '<tr><td>' + player.name + '</td><td>' + player.status + '</td></tr>';
        }).join('');
        $('#players > tbody').html(html);
      },
      error: function() {
      }
    });
}

//
// player_timeout =  setTimeout(function() {
//   $.ajax({
//       url: "http://192.168.0.196:3000/getPlayerList",
//       type: "POST",
//       data: {
//           camp_name: camp_name,
//       },
//       crossDomain:true,
//       dataType : 'jsonp ',
//       contentType: 'application/json',
//       cache: false,
//       success: function(res) {
//         players = res.response_val;
//         // Populate the player list
//         var html = players.map(function (player) {
//           return '<tr><td>' + player.name + '</td></tr>';
//         }).join('');
//         $('#start_game_modal  #players > tbody').html(html);
//
//
//       },
//       error: function() {
//       }
//     });
//   },500);
