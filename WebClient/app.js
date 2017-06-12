var express = require("express");
var app     = express();
var path    = require("path");

// var dblite = require("dblite");
// var db = dblite("web.db");
// db.close();




app.use("/public", express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){

  res.sendFile(path.join(__dirname+'/views/index.html'));
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
