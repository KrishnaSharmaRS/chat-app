const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = document.querySelector('#message-input');
const $sendMessageButton = document.querySelector("#send-message-button");
const $sendLocationButton = document.querySelector("#location-button");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;

socket.on('welcome', (message) => {
    console.log(message)
})

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationMessageTemplate, {
        url
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
    event.preventDefault()
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