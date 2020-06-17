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
        const { error, user } = addUser({ id: socket.id, username: username.trim(), room: room.trim().toLowerCase() });

        if (error) return callback(error)

        socket.join(user.room)

        socket.emit('message', generateMessage('ADMINISTRATOR', `Welcome ${user.username}`))
        socket.broadcast.to(user.room).emit('message', generateMessage('ADMINISTRATOR', `'${user.username}' joined this Room.`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    } )

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        // const filter = new Filter()

        // if (filter.isProfane(message)) return callback("Profanity is not Allowed!")

        io.to(user.room).emit('message', generateMessage(user.username, message))

        callback('Delivered')
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))

        callback('Delivered')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(user.username, `Bye everyone, I'm Leaving this Room!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("Server is running on PORT:" + port)
})