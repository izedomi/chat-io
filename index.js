const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

usernames = [];
typingUsers = [];

app.get('/', (req, res) => {
    console.log("route started...");
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    console.log("io connection created")

    //listens for an event to create new chat user
    socket.on('new user', function(username){
        console.log('new user: ' + username);
      
        //user already exists
        // -1 means does not exist
        if(usernames.indexOf(username) != -1){
           io.sockets.emit('user taken', username);
           return;
        }

        //user does not exist
        socket.username = username;
        usernames.push(socket.username)
        io.sockets.emit('chat room', usernames)

    })
    
    //listen for a new chat, sends new message event
    socket.on('new chat', function(msg) {
        io.sockets.emit('new message', {username: socket.username, message: msg})
    });

    socket.on('typing', function(flag){
        
        console.log(flag);

        let index = typingUsers.indexOf(socket.username);
        console.log(index);

        if(index == -1 && flag == 'focus'){
            typingUsers.push(socket.username) 
        }


        if(index != -1 && flag == 'blur'){
            typingUsers.splice(index, 1);
        }

        io.sockets.emit('new user typing', typingUsers)
       
    });



    socket.on('disconnect', function(data){
        if(!socket.username){
            return;
        }
        usernames.splice(usernames.indexOf(socket.username), 1);
        io.sockets.emit('chat room', usernames);
    })
    
});



var port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("server started...")
});