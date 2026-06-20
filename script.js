// --- 1. Mobile Menu Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const menuIcon = mobileMenuBtn.querySelector('i');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        if (mobileMenu.classList.contains('hidden')) {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        } else {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark');
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        });
    });

    // --- 2. Update File Input Text visually ---
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            fileNameDisplay.innerText = e.target.files[0].name;
            fileNameDisplay.classList.add('text-brand-accent');
        } else {
            fileNameDisplay.innerText = "Upload floor plans, AV specs, etc.";
            fileNameDisplay.classList.remove('text-brand-accent');
        }
    });
});


// --- 3. Voice Recording Logic ---
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let nativeExtension = 'webm'; // Default for Chrome/Firefox
let isRecording = false;

async function toggleRecording() {
    const recordStatusLabel = document.getElementById('record-status-label');
    const recordText = document.getElementById('record-text');
    const micIconBg = document.getElementById('mic-icon-bg');

    if (isRecording) {
        // Stop Recording
        mediaRecorder.stop();
        isRecording = false;
        
        recordStatusLabel.innerText = "Recorded";
        recordStatusLabel.classList.remove('animate-pulse', 'text-red-500');
        recordText.innerText = "Tap to record message";
        micIconBg.classList.remove('animate-pulse', 'bg-red-500/30');
    } else {
        // Start Recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            // Detect if the browser is Safari (uses mp4) or Chrome (uses webm)
            if (mediaRecorder.mimeType && mediaRecorder.mimeType.includes('mp4')) {
                nativeExtension = 'mp4';
            } else {
                nativeExtension = 'webm';
            }
            
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                // Use the browser's native MIME type so the server firewall doesn't block it
                audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Show the playback UI
                document.getElementById('audio-player').src = audioUrl;
                document.getElementById('record-ui').classList.add('hidden');
                document.getElementById('playback-ui').classList.remove('hidden');
                document.getElementById('playback-ui').classList.add('flex');
                
                // Release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            audioChunks = [];
            mediaRecorder.start();
            isRecording = true;
            
            // Update UI to recording state
            recordStatusLabel.innerText = "Recording...";
            recordStatusLabel.classList.add('animate-pulse', 'text-red-500');
            recordText.innerText = "Tap to stop recording";
            micIconBg.classList.add('animate-pulse', 'bg-red-500/30');

        } catch (err) {
            alert("Microphone access denied or not available. Please check your browser permissions.");
        }
    }
}

function deleteRecording() {
    audioBlob = null;
    audioChunks = [];
    isRecording = false;
    document.getElementById('audio-player').src = "";
    
    // Reset UI back to ready state
    document.getElementById('playback-ui').classList.add('hidden');
    document.getElementById('playback-ui').classList.remove('flex');
    document.getElementById('record-ui').classList.remove('hidden');
    document.getElementById('record-status-label').innerText = "Ready";
}


// --- 4. Form Submission Logic (AJAX with File & Blob support) ---
const form = document.getElementById('contact-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    
    submitBtn.disabled = true;
    submitText.innerText = "Sending Enquiry...";
    submitSpinner.classList.remove('hidden');

    const formData = new FormData(form);
    
    // FIX 1: If no physical file was selected, remove the empty file field
    const fileInput = document.getElementById('file-input');
    if (fileInput.files.length === 0) {
        formData.delete('attachment');
    }
    
    // FIX 2: Append the audio with its true native extension
    if (audioBlob) {
        formData.append('voice_enquiry', audioBlob, `voice_note.${nativeExtension}`);
    }

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.status === 400 || !data.success) {
            alert("Submission rejected. Reason: " + data.message);
            submitBtn.disabled = false;
            submitText.innerText = "Submit Enquiry";
            submitSpinner.classList.add('hidden');
            return;
        }
        
        // Success
        document.getElementById('success-overlay').classList.remove('hidden');
        document.getElementById('success-overlay').classList.add('flex');
        
        form.reset();
        deleteRecording();
        document.getElementById('file-name-display').innerText = "Upload floor plans, AV specs, etc.";
        document.getElementById('file-name-display').classList.remove('text-brand-accent');
        
    } catch (error) {
        alert("A network error occurred. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitText.innerText = "Submit Enquiry";
        submitSpinner.classList.add('hidden');
    }
});

document.getElementById('close-success-btn').addEventListener('click', () => {
    document.getElementById('success-overlay').classList.add('hidden');
    document.getElementById('success-overlay').classList.remove('flex');
});
