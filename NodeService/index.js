// JSA_Service:  This is the web RESTful API that managed the game state of Just Stay Alive
//Building up the express framework
var express = require('express');
var app = express();

// We use nedb for the storage of the game state (NoSQL)
// The gamestate.db is the database file that updates each groups game under certain conditions.
// When a new game is created they should get a 4 character room name.  This will be the parent object.

// AFTER ROOM IS CREATED AND WE ARE WAITING FOR USERS TO JOIN, AS THEY JOIN THE RECORD IS UPDATED.  CURRENTLY ONLY ONE HAS JOINED
// They are given a random classID and based on this we keep the details of the game for each player
var gamestate_example =
{ group_name: "QRS4",
  game_status: {description:"Waiting for players to join.", code:1},
  turn_number:-1,
  group_details: {stockpile:100},
  number_of_players:3,
  player_details:[
    {name:"kyle",class_ID:2,current_health:100,current_consumption:20,private_stockpile:20,turn_status:0,
    turn_action:{}},
    {name:"ash",class_ID:1,current_health:90,current_consumption:23,private_stockpile:20,turn_status:1,
    turn_action:{name:"private_gather",value:"2"}}
  ],
  max_turns:10
};


var Datastore = require('nedb');
var db = new Datastore({
  filename: 'gamestate.db', // provide a path to the database file
  autoload: true, // automatically load the database
  timestampData: true // automatically add and manage the fields createdAt and updatedAt
});

//
//
// //Save this goal to the database.
// db.insert(gamestate_example, function(err, newGoal) {
//  if (err) console.log(err);
//  console.log(newGoal);
// });


//Actions:
//name:"private_gather",value:"2"}
//name:"group_gather",value:"2"}
//name:"heal",value:"2"}
//name:"attack",value:"2|kyle"}
//name:"class_skill",value:"class_ID"}


//STEPS:  Someone requests a new game locally:
  // 1. This calls POST -> createNewGame (ID from user random generated, # of players)
    // Checks for uniqueness or staleness then if not makes empty game state
    // Activity alerts the user that other players can join.  The host is given a random character and is taken to the main activity with a waiting dialog
    // Status Code is 1 which means people are able to join.
// Other user joins game:
  // Calls GET -> joinGame(ID)
  // Gives user a random class and adds to player list: calculates total number of players and if it is the number_of_players executes a POST callback.

  // POST -> startGame(ID):
    // Modifies the game state to make  game status to 0 ie. Game is closed for joining.
    // Callback calls POST for incrimentGameTurn:

// POST -> incrimentGameTurn(ID)
  // If turn is -1:
    // No event is set,only turn number is incremented and users are now allowed to play
  // Else
    // Check to see if everyone has played their turns
    // Increments the turn_number, generates a new event
    // Checks to see the max_turns and issues a fail if they are done.
    // Updates the stockpile
    // Updates player details based on their actions



 // When a user submits actions:
 // POST -> updateUserAction (ID, name, action, value)
  // Ipdates the users information for the turn
    // Issues call for GET nextTurnReady:
    // GET: nextTurnReady -> Checks to see if all users have submitted actions.  Returns true/false
    // GET: updateUserActvity -> Get the updated user data and will use the return to update local game state






// Let us check that we can save to the database.
// Define a goal.
// var goal = {
//   description: 'Do 10 minutes meditation every day',
// };
//

function isBigEnough(value) {
  return value >= 10;
}

app.get('/getGroupName', function(req, res) {
  var getGroupName = req.query.group_name;
  console.log(getGroupName);

  db.find({"player_details.name": getGroupName},function(err, goal) {
    // iterate over each element in the array
    var pd = goal[0].player_details;
    var out;
    for (var i = 0; i < pd.length; i++){
      // look for the entry with a matching `code` value
      if (pd[i].name == getGroupName){
        console.log(pd[i]);
        out = pd[i];
         // we found it
        // obj[i].name is the matched result
      }
    }


    if (err) res.send(err);
    res.json(out);
  });
});



app.get('/', function(req, res) {
  res.json({notes: "This is your notebook. Edit this to start saving your notes!"})
})
app.get('/goals', function(req, res) {
  db.find({}).sort({
    updatedAt: -1
  }).exec(function(err, goals) {
    if (err) res.send(err);
    res.json(goals);
  });
});

app.post('/goals', function(req, res) {
  var goal = {
    description: req.body.description,
  };
  db.insert(goal, function(err, goal) {
    if (err) res.send(err);
    res.json(goal);
  });
});


app.get('/goals/:id', function(req, res) {
  var goal_id = req.params.id;
  db.findOne({
    _id: goal_id
  }, {}, function(err, goal) {
    if (err) res.send(err);
    res.json(goal);
  });
});

// DELETE a goal.
// (Accessed at DELETE http://localhost:8080/goals/goal_id)
app.delete('/goals/:id', function(req, res) {
  var goal_id = req.params.id;
  db.remove({
    _id: goal_id
  }, {}, function(err, goal) {
    if (err) res.send(err);
    res.sendStatus(200);
  });
});


app.listen(3000)
var  bodyParser = require('body-parser'); // Middleware to read POST data

// Set up body-parser.
// To parse JSON:
app.use(bodyParser.json());
// To parse form data:
app.use(bodyParser.urlencoded({
  extended: true
}));
