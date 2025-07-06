const socket = io('http://localhost:3000'); // Connect to the signaling server
let peerConnection = new RTCPeerConnection(); // Use 'let' so we can reset it later
const roomId = 'telemedicine-room'; // Shared room ID

// Video elements
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const joinButton = document.getElementById('join-video-call');
const stopButton = document.getElementById('stop-video-call');

// Messaging Elements
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-message');
const messagesContainer = document.getElementById('messages');

// Send Message
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('doctor-message', message);
        displayMessage(`You (Doctor): ${message}`, 'sent');
        messageInput.value = ''; // Clear input
    }
});

// Receive Messages from Patient
socket.on('patient-message', (message) => {
    displayMessage(`Patient: ${message}`, 'received');
});

// Function to display messages
function displayMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerText = text;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}

// Track for the doctor's local media stream
let localStream = null;

// Access the doctor's camera and microphone
async function startMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // Add tracks to the PeerConnection
        localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    } catch (error) {
        console.error('Error accessing media devices:', error);
    }
}

// Send ICE candidates to the signaling server
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit('signal', { roomId, data: event.candidate });
    }
};

// Display the remote video stream (patient's webcam)
peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
};

// Handle signaling data (offer, answer, ICE candidates)
socket.on('signal', async ({ sender, data }) => {
    if (data.type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Send the answer back to the patient
        socket.emit('signal', { roomId, data: peerConnection.localDescription });
    } else if (data.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
    }
});

// Join the room
socket.emit('join-room', roomId);

// Handle the "Join Video Call" button click
joinButton.addEventListener('click', async () => {
    if (!localStream) {
        await startMedia(); // Start the media if not started
    }

    // Create and send the offer to the patient
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signal', { roomId, data: peerConnection.localDescription });

    // Enable the "Stop Video Call" button
    stopButton.disabled = false;
    joinButton.disabled = true;
});

// Handle the "Stop Video Call" button click
stopButton.addEventListener('click', () => {
    // Stop all tracks in the local stream
    if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
        localVideo.srcObject = null;
    }

    // Close the PeerConnection
    if (peerConnection) {
        peerConnection.close();
    }

    remoteVideo.srcObject = null;

    // Reinitialize the global PeerConnection
    peerConnection = new RTCPeerConnection();

    // Reattach event listeners
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', { roomId, data: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Reset buttons
    stopButton.disabled = true;
    joinButton.disabled = false;
});


// Get elements
const doctorNameElement = document.getElementById('doctorName');
const doctorPrescriptionElement = document.getElementById('doctorPrescription');
const saveButton = document.getElementById('save-prescription');

// Save the doctor's prescription
saveButton.addEventListener('click', () => {
    const doctorName = doctorNameElement.value;
    const doctorPrescription = doctorPrescriptionElement.value;

    if (doctorName && doctorPrescription) {
        localStorage.setItem('doctorName', doctorName);
        localStorage.setItem('doctorPrescription', doctorPrescription);
        alert('Prescription saved successfully!');
    } else {
        alert('Please fill in both the doctor\'s name and the prescription!');
    }
});
