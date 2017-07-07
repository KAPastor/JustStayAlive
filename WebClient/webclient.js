//=================== JSA WebClient ============================================
// Interacts with the JSA_Service to actually run the game
//==============================================================================
var express = require("express");
var app     = express();
var path    = require("path");
var bodyParser = require('body-parser');

// Setup the environment details
var environment = process.env.NODE_ENV;
var base_ajax_url;
if (environment=='DEV'){
  console.log('============== JSA WebClient DEV ================');
  base_ajax_url = 'http://localhost:3000';
}else{
  console.log('============== JSA WebClient Production ================');
  base_ajax_url = 'http://159.203.1.198/jsa_service';
}
console.log("___ Running on Port 3001");

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Render the main page where the user can log into a game state.
app.get('/',function(req,res){
  res.render('index',{base_ajax_url:base_ajax_url});
});

// Loads the gameview state to the user by prerendering the page.
app.post('/load_gamview',function(req,res){
  res.render('gameview', {camp_name: req.body.camp_name,
    player_name: req.body.player_name})
    // player_session_ID: req.body.camp_name});
});

app.listen(3001);
