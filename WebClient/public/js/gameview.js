poll_interval = setInterval(function(){ refresh_gameview(camp_name,player_name); }, 500);


function refresh_gameview(){
  $.ajax({
      url: "http://192.168.0.196:3000/getPlayerList",
      type: "POST",
      data: {
          camp_name: camp_name,
      },
      crossDomain:true,
      dataType : 'jsonp ',
      contentType: 'application/json',
      cache: false,
      success: function(res) {
        console.log(res.response_val)
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
