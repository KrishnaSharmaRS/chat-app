const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const { generateMessage, generateLocationMessage } = require('./src/utilities/messages');
const { getUser, addUser, removeUser, getUsersInRoom } = require('./src/utilities/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "./public")

app.use(express.json())
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log("New WebSocket Connection.")

    
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username: username.trim(), room: room.trim() });

        if (error) return callback(error)

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined this Room.`))

        callback()
    } )

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', generateMessage(message))

        callback('Delivered')
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`))

        callback('Delivered')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has LEFT!`))
        }
    })
})

server.listen(port, () => {
    console.log("Server is running on PORT:" + port)
})