const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = document.querySelector('#message-input');
const $sendMessageButton = document.querySelector("#send-message-button");
const $sendLocationButton = document.querySelector("#location-button");
const $messages = document.querySelector("#messages");

$messageInput.focus()

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('welcome', (message) => {
    console.log(message)
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('D MMM YYYY || hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format('D MMM YYYY || hh:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()
    // Disable Send Button-
    if (!$messageInput.value) return;
    $sendMessageButton.setAttribute('disabled', 'disabled')


    const message = event.target.elements.message.value;

    socket.emit('sendMessage', message, (response) => {
        $sendMessageButton.removeAttribute('disabled')
        $messageInput.value = '';
        $messageInput.focus()
        console.log("The Message was Delivered. RESPONSE: " + response);
    })
})

$sendLocationButton.addEventListener('click', (event) => {
    if (!navigator.geolocation) return alert("Sorry, GeoLocation is'nt Supported by your Browser.")
    $sendLocationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("Location Shared.")
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})