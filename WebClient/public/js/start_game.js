var player_timeout;
var status_timeout;
var poll_interval;
$(function() {

    $("#enterGameForm input,#enterGameForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            // Prevent spam click and default submit behaviour
            $("#btnSubmit").attr("disabled", true);
            event.preventDefault();

            // get values from FORM
            var camp_name = $("input#camp_name").val();
            var player_name = $("input#player_name").val();

            $.ajax({
                url: "http://192.168.0.196:3000/enterGame",
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
                  // Depending on the response_code we will be populating the modal with either the host or member view.
                  // The only difference is that the host may start the game / options on the game.
                  // Both will have a list of the current players added and if they are ready.

                  // Check to see if the camp name is available
                  if (res.response_code=='alert_player'){
                    $('#success').html("<div class='alert alert-"+res.response_type + "'>");
                    $('#success > .alert-'+res.response_type).html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-'+res.response_type).append("<strong>"+res.response_desc);
                    $('#success > .alert-'+res.response_type).append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                  } else if(res.response_code=='success'){
                    // In this case we are going to populate the modal with the corresponding information.  The only thing that will be changed is the
                    // host/guest options.

                    // Check the response description tag
                    if (res.response_tag=="guest"){
                      $('#start_game_modal  #camp_name').html('You are a Guest in Camp ' + camp_name);

                    } else if (res.response_tag=="host"){
                      $('#start_game_modal  #camp_name').html('You are the Host of Camp ' + camp_name);
                      $('#start_game_message p').html('When all of the players have joined, please start the game.');
                      $('#start_game_message button').show();
                      bind_start_game_button(camp_name,player_name);

                    }
                   }


                  // $('#start_game_modal .modal-body').html(res.response_code);
                  $('#start_game_modal').modal('show');

                  // Now make a loop to check the player list every x seconds
                  doPoll(camp_name,player_name);
                  poll_interval = setInterval(function(){ doPoll(camp_name,player_name); }, 500);




                },
                error: function() {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append("<strong>Sorry " + player_name + ", it seems that game service is not responding. Please try again later!");
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
            });
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


function doPoll(camp_name,player_name){
  player_timeout =  setTimeout(function() {
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
          players = res.response_val;
          // Populate the player list
          var html = players.map(function (player) {
            return '<tr><td>' + player.name + '</td></tr>';
          }).join('');
          $('#start_game_modal  #players > tbody').html(html);


        },
        error: function() {
        }
      });
    },500);
     status_timeout = setTimeout(function() {
      $.ajax({
          url: "http://192.168.0.196:3000/getCampStatus",
          type: "POST",
          data: {
              camp_name: camp_name
          },
          crossDomain:true,
          dataType : 'jsonp',
          contentType: 'application/json',
          cache: false,
          success: function(res) {
            if (res.response_val.status == "Game is in session."){
              console.log("Game is in session.  Load the game page.")
              console.log(camp_name);
              console.log(player_name);

              clearTimeout(status_timeout);
              clearTimeout(player_timeout);
              clearInterval(poll_interval);
              $.ajax({
                  url: "/test",
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
              }
          },
          error: function() {
          }
        });
      },500);
}

function bind_start_game_button(camp_name,player_name){
  $('#start_game_message button').click(function(){
    $.ajax({
        url: "http://192.168.0.196:3000/startGameSession",
        type: "POST",
        data: {
            camp_name: camp_name,
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

};
