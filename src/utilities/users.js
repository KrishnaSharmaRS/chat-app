const users = []

const addUser = ({ id, username, room }) => {
    // Clean the Provided Data:-
    username = username
    room = room

    // Validate the Given Data:-
    if (!username || !room) {
        return {
            error: "Username and Room are Required!"
        }
    }

    // Checking the Existing User:-
    const existingUser = users.find(user => {
        return user.room.toLowerCase() === room.toLowerCase() 
        &&
        user.username.toLowerCase() === username.toLowerCase();
    })

    if (existingUser) return {
        error: "This User is already in the same Room!"
    }

    // Store the User:-
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room.toLowerCase() === room.toLowerCase());
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}