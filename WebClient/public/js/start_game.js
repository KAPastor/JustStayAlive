$(function() {

    $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
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
                  }


                  // $('#start_game_modal .modal-body').html(res.response_code);
                  $('#start_game_modal').modal('show');
                  console.log(res)




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
