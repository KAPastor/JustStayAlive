$(document).ready(function(){
  // Now for the click actions of the  buttons
  $('#private_collect').click(function(){
    $(':button').prop('disabled', true);

    // Give the player state and tell it to update the state and action.
    // If the method determines you are the last person it advances the turn for all players
    $.ajax({
        // url: "http://localhost:3000/updatePlayerAction",
        url: "http://159.203.1.198/jsa_service/updatePlayerAction",
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

  $('#community_collect').click(function(){
    $(':button').prop('disabled', true);
    $.ajax({
        // url: "http://localhost:3000/updatePlayerAction",
        url: "http://159.203.1.198/jsa_service/updatePlayerAction",
        type: "POST",
        data: {
            camp_name: camp_name,
            player_name: player_name,
            action: 'community_collect'
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


  $('#attack_player').click(function(){
    // Pop up a modal to select who to attack
    var pl = player_list.map(function (player) {
      return '<button class="btn btn-info btn-block action-button" type="button">'+player+'</button>';
    }).join('');
    $('#gameview_modal_desc').html(pl);

    $('#gameview_modal_title').text('Select a player to attack.');

    // Bind the click events:
    $('.action-button').click(function(){
      attack_player = $(this).text();
      action_string = 'attack_player:' + attack_player;
      $(':button').prop('disabled', true);
      $('#gameview_modal').modal('hide');

      $.ajax({
          // url: "http://localhost:3000/updatePlayerAction",
          url: "http://159.203.1.198/jsa_service/updatePlayerAction",
          type: "POST",
          data: {
              camp_name: camp_name,
              player_name: player_name,
              action: action_string
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
    })
    $('#gameview_modal').modal('show');
  });

  $('#heal_player').click(function(){
    // Pop up a modal to select who to attack
    var pl = player_list.map(function (player) {
      return '<button class="btn btn-info btn-block action-button" type="button">'+player+'</button>';
    }).join('');
    $('#gameview_modal_desc').html(pl);

    $('#gameview_modal_title').text('Select a player to heal.');

    // Bind the click events:
    $('.action-button').click(function(){
      attack_player = $(this).text();
      action_string = 'heal_player:' + attack_player;
      $(':button').prop('disabled', true);
      $('#gameview_modal').modal('hide');

      $.ajax({
          url: "http://localhost:3000/updatePlayerAction",
          type: "POST",
          data: {
              camp_name: camp_name,
              player_name: player_name,
              action: action_string
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
    })
    $('#gameview_modal').modal('show');
  });


});

poll_interval = setInterval(function(){ refresh_gameview(camp_name,player_name); }, 500);

var current_day=0;
var player_list;
function refresh_gameview(){
  $.ajax({
      // url: "http://localhost:3000/refreshGameview",
      url: "http://159.203.1.198/jsa_service/refreshGameview",
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
        player_list = res.player_list.map(function (player) {return player.name});




        var html = res.player_list.map(function (player) {
          return '<tr><td>' + player.name + '</td><td>' + player.status + '</td></tr>';
        }).join('');
        $('#players > tbody').html(html);
      },
      error: function() {
      }
    });
}
