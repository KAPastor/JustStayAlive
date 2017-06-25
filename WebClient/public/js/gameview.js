$(document).ready(function(){
  // Now for the click actions of the  buttons
  $('#private_collect').click(function(){
    $(':button').prop('disabled', true);

    // Give the player state and tell it to update the state and action.
    // If the method determines you are the last person it advances the turn for all players
    $.ajax({
        url: "http://192.168.0.196:3000/updatePlayerAction",
        type: "POST",
        data: {
            camp_name: camp_name,
            player_name: player_name,
            action: 'private_collect'
        },
        crossDomain:true,
        dataType : 'jsonp ',
        contentType: 'application/json',
        cache: false,
        success: function(res) {
        },
        error: function() {
        }
      });

  });
});

poll_interval = setInterval(function(){ refresh_gameview(camp_name,player_name); }, 1000);

var current_day=0;
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

        if (current_day!=res.community_info.turn_number){
          current_day=res.community_info.turn_number;
          $(':button').prop('disabled', false);
        }

        var html = res.player_list.map(function (player) {
          return '<tr><td>' + player.name + '</td><td>' + player.status + '</td></tr>';
        }).join('');
        $('#players > tbody').html(html);
      },
      error: function() {
      }
    });
}
