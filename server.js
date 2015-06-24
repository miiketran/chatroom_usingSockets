// require express and path
var express = require("express");
var path = require("path");
// create the express app
var app = express();
var messages = [];
var users = {};
var guest_counter = 1;
// static content 
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route to render the index.ejs view
app.get('/', function(req, res) {
 res.render("index");
})
// tell the express app to listen on port 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})

var io=require("socket.io").listen(server);
io.sockets.on("connection", function(socket){
  socket.on("got_a_new_user", function(data){
    if(data.name == ""){
      data.name = "Guest"+guest_counter;
      guest_counter++;
      users[socket.id] = data.name;
    } else{
      users[socket.id] = data.name;
    }
    socket.emit("user_name", {name: data.name});
    io.emit("update_users", {users: users});
    var new_message = data.name + " has joined the chat";
    socket.emit("initial_messages", {messages: messages});
    // messages.push(new_message);
    socket.broadcast.emit("new_user", {message: new_message});
    
  })
  console.log("We are using sockets");
  console.log(socket.id);

  socket.on("message_submit", function(data){
    console.log(data.message);
    messages.push(data.message);
    io.emit("new_message", {message: data.message});
  })
  socket.on("disconnect", function(){
    var new_message = users[socket.id] + " has disconnected.";
    // messages.push(new_message);
    delete users[socket.id];
    io.emit("update_users", {users: users});
    socket.broadcast.emit("user_disconnected", {message: new_message});
    

  })

});