// JSA Gameview ================================================================
// Gameplay logic
// var jsa_socket = io(base_ajax_url);

// Set up all of the socket .on methods
jsa_socket.on('gameview_update', function(res){
  // Refreshes the players view with updated results
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
});

// Updates the community portion of the gameview
jsa_socket.on('update_community', function(res){
  // Depending on what the return looks like we will update those sections
  console.log(res);
  if ('player_list' in res.response){
    console.log('updating the community player_list')
    player_list = res.response.player_list.map(function (player) {return player.name});

    var html = res.response.player_list.map(function (player) {
      return '<tr><td>' + player.name + '</td><td>' + player.status + '</td></tr>';
    }).join('');
    $('#players > tbody').html(html);
  }

});


// Global variables
var current_day=0;
var player_list;


$(document).ready(function(){
  // Private collection button: ================================================
  $('#private_collect').click(function(){
    $(':button').prop('disabled', true);
    var data = {camp_name: camp_name,player_name: player_name,action: 'private_collect'}
    jsa_socket.emit('update_player_action', data);
  });

  $('#community_collect').click(function(){
    $(':button').prop('disabled', true);
    var data = {camp_name: camp_name,player_name: player_name,action: 'community_collect'}
    jsa_socket.emit('update_player_action', data);
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
      var data = {camp_name: camp_name,player_name: player_name,action: action_string}
      jsa_socket.emit('update_player_action', data);
    });
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
      heal_player = $(this).text();
      action_string = 'heal_player:' + heal_player;
      $(':button').prop('disabled', true);
      $('#gameview_modal').modal('hide');
      var data = {camp_name: camp_name,player_name: player_name,action: action_string}
      jsa_socket.emit('update_player_action', data);
    });
    $('#gameview_modal').modal('show');
  });
});
