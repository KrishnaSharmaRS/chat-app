const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "./public")

app.use(express.json())
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log("New WebSocket Connection.")
    socket.emit('welcome', 'Welcome New User.')
    socket.broadcast.emit('message', 'New User Joined')

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', message)

        callback('Delivered')
    })

    socket.on('sendLocation', ( { latitude, longitude }, callback) => {
        io.emit('locationMessage', `https://google.com/maps?q=${latitude},${longitude}`)

        callback('Delivered')
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has Left.')
    })
})

server.listen(port, () => {
    console.log("Server is running on PORT:" + port)
})