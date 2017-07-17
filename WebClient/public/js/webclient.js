// JSA Webclient ===============================================================
// Defines all things related to the webclient, excluding the gameplay

// Setup the socket.io communication with the JSA service
var jsa_socket = io(base_ajax_url);

// Define the .on events from the jsa service
jsa_socket.on('enter_game', function(res){
  // Depending on the response_code we will be populating the modal with either the host or member view.
  // The only difference is that the host may start the game / options on the game.
  // Both will have a list of the current players added and if they are ready.
  // Check to see if the camp name is available
  if (res.response.response_code=='alert_player'){
    $('#success').html("<div class='alert alert-"+res.response.response_type + "'>");
    $('#success > .alert-'+res.response.response_type).html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
        .append("</button>");
    $('#success > .alert-'+res.response.response_type).append("<strong>"+res.response_desc);
    $('#success > .alert-'+res.response.response_type).append('</div>');
    //clear all fields
    $('#contactForm').trigger("reset");
  } else if(res.response.response_code=='success'){
    // In this case we are going to populate the modal with the corresponding information.  The only thing that will be changed is the
    // host/guest options.
    // Check the response description tag
    if (res.response.response_tag=="guest"){
      $('#start_game_modal  #camp_name').html('You are a Guest in Camp ' + res.data.camp_name);
    } else if (res.response.response_tag=="host"){
      $('#start_game_modal  #camp_name').html('You are the Host of Camp ' + res.data.camp_name);
      $('#start_game_message p').html('When all of the players have joined, please start the game.');
      $('#start_game_message button').show();
      bind_start_game_button(res.data.camp_name,res.data.player_name);
    }
    $('#start_game_modal').modal('show');

    // At this point we will be looking for the lobby to be updated
   }
});

jsa_socket.on('update_lobby', function(res){
  console.log('__ Received lobby update')
  players = res.response.response_val;
  console.log(res)
  // Populate the player list
  var html = players.map(function (player) {
    return '<tr><td>' + player.name + '</td></tr>';
  }).join('');
  $('#start_game_modal  #players > tbody').html(html);
});

jsa_socket.on('start_game', function(res){
  console.log('__ Starting game')
  camp_name = res.data.camp_name
  player_name = res.data.player_name

  // Load the gameview
  $.ajax({
      url: "/load_gameview",
      type: "POST",
      data: JSON.stringify({
          camp_name: camp_name,
          player_name: player_name
      }),
      dataType : 'html',
      contentType: 'application/json',
      cache: false,
      success: function(res) {
        console.log(res)
        var newDoc = document.open("text/html", "replace");
        newDoc.write(res);
        newDoc.close();
      },
      error: function() {
      }
    });
});

$(function() { // When the DOM is ready to go we run the following code
    $("#enterGameForm input,#enterGameForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            // Prevent spam click and default submit behaviour
            $("#btnSubmit").attr("disabled", true);
            event.preventDefault();
            var camp_name = $("input#camp_name").val();
            var player_name = $("input#player_name").val();
            var data = {
                camp_name: camp_name,
                player_name: player_name
            }
            jsa_socket.emit('enter_game', data);
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });
    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});

// When clicking on Full hide fail/success boxes
$('#name').focus(function() {
    $('#success').html('');
});



function bind_start_game_button(camp_name,player_name){
  $('#start_game_message button').click(function(){
    var data = {
        camp_name: camp_name,
        player_name: player_name
    }

    console.log(data)
    jsa_socket.emit('start_game',data);
  });

};
