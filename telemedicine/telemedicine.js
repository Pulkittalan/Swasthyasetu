const socket = io('http://localhost:3000'); // Connect to the signaling server
let peerConnection; // Define peerConnection dynamically
const roomId = 'telemedicine-room'; // Shared room ID

// Video elements
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const startButton = document.getElementById('start-video-call');
const stopButton = document.getElementById('stop-video-call');
// Messaging Elements
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-message');
const messagesContainer = document.getElementById('messages');

// Send Message
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('patient-message', message);
        displayMessage(`You (Patient): ${message}`, 'sent');
        messageInput.value = ''; // Clear input
    }
});

// Receive Messages from Doctor
socket.on('doctor-message', (message) => {
    displayMessage(`Doctor: ${message}`, 'received');
});


// Function to display messages
function displayMessage(text, type) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.innerText = text;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
}


// Local media stream reference
let localStream;

// Initialize media and peer connection
function initializeCall() {
    peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', { roomId, data: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0];
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            localStream = stream;
            localVideo.srcObject = stream;
            stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
        })
        .catch((error) => console.error('Error accessing media devices:', error));
}

startButton.addEventListener('click', async () => {
    initializeCall();
    socket.emit('join-room', roomId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signal', { roomId, data: peerConnection.localDescription });

    startButton.disabled = true;
    stopButton.disabled = false;
});

stopButton.addEventListener('click', () => {
    if (peerConnection) peerConnection.close();
    if (localStream) localStream.getTracks().forEach((track) => track.stop());

    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    socket.emit('leave-room', roomId);

    startButton.disabled = false;
    stopButton.disabled = true;
});

socket.on('signal', async ({ sender, data }) => {
    if (peerConnection) {
        if (data.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('signal', { roomId, data: peerConnection.localDescription });
        } else if (data.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        } else if (data.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
    }
});

socket.on('user-disconnected', () => {
    remoteVideo.srcObject = null;
});
//phone call js 

const { jsPDF } = window.jspdf;

// Get elements
const doctorNameElement = document.getElementById('doctorName');
const doctorPrescriptionElement = document.getElementById('doctorPrescription');
const downloadButton = document.getElementById('download-pdf');

// Load the saved prescription from local storage
window.addEventListener('load', () => {
    const doctorName = localStorage.getItem('doctorName');
    const doctorPrescription = localStorage.getItem('doctorPrescription');

    if (doctorName && doctorPrescription) {
        doctorNameElement.textContent = `Doctor's Name: ${doctorName}`;
        doctorPrescriptionElement.textContent = doctorPrescription;
    } else {
        doctorNameElement.textContent = 'No prescription found!';
        doctorPrescriptionElement.textContent = 'Please ask the doctor for a prescription.';
    }
});

// Download the prescription as PDF when the button is clicked
downloadButton.addEventListener('click', () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text('Prescription', 10, 10);

    // Add Doctor's Name and Prescription Text
    const doctorName = localStorage.getItem('doctorName');
    const doctorPrescription = localStorage.getItem('doctorPrescription');
    
    doc.setFontSize(12);
    doc.text(`Doctor's Name: ${doctorName}`, 10, 20);
    doc.text('Doctor\'s Prescription:', 10, 30);
    doc.text(doctorPrescription, 10, 40);

    // Save the PDF
    doc.save('prescription.pdf');
});
