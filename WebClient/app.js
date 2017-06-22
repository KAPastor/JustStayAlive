var express = require("express");
var app     = express();
var path    = require("path");
var bodyParser = require('body-parser');

// var dblite = require("dblite");
// var db = dblite("web.db");
// db.close();




app.use("/public", express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/',function(req,res){

  res.render('index');
});


app.post('/test',function(req,res){
  console.log(req.body)
  res.render('gameview', {camp_name: req.body.camp_name,player_name: req.body.player_name});
});


//
// app.get('/check_solution',function(req,res){
//     check_solution(function(solution,pin){
//
//       if (solution.toLowerCase() == req.query.userSolution.toLowerCase() ){
//         res.json({"response":pin});
//       }else{
//         res.json({"response":"You hear nothing."});
//       }
//     });
// });
//
//
//
//
// function check_solution(cb){
//   db.query("SELECT password,pin FROM signal_solution", function(err, rows) {
//         rows.forEach(function (row) {
//           pwd = row[0];
//           pin = row[1];
//         });
//         cb(pwd,pin);
//     });
// }







app.listen(3001);

console.log("Running at Port 3001");
