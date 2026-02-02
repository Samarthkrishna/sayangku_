document.addEventListener('DOMContentLoaded', function() {
    // Game state
    let foundItems = [];
    const totalItems = 5;
    const foundCountElement = document.getElementById('foundCount');
    const finalReveal = document.getElementById('finalReveal');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const ctx = confettiCanvas.getContext('2d');
    const videoElement = document.getElementById('customVideo');
    const videoTitleElement = document.getElementById('videoTitle');
    const currentVideoElement = document.getElementById('currentVideo');
    
    // DOM Elements
    const localUploadBox = document.getElementById('localUploadBox');
    const localVideoUpload = document.getElementById('localVideoUpload');
    const youtubeLinkInput = document.getElementById('youtubeLink');
    const loadYoutubeBtn = document.getElementById('loadYoutubeBtn');
    const resetVideoBtn = document.getElementById('resetVideoBtn');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const muteBtn = document.getElementById('muteBtn');
    
    // Initialize canvas
    function resizeCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Check for saved video
    function loadSavedVideo() {
        const savedVideoType = localStorage.getItem('videoType');
        const savedVideoData = localStorage.getItem('videoData');
        const savedVideoName = localStorage.getItem('videoName');
        
        if (savedVideoType && savedVideoData) {
            if (savedVideoType === 'local') {
                // Load local video
                videoElement.src = savedVideoData;
                videoElement.controls = true;
                currentVideoElement.textContent = savedVideoName || "Your Custom Video";
                videoTitleElement.textContent = savedVideoName || "Your video song is ready!";
            } else if (savedVideoType === 'youtube') {
                // Load YouTube
                loadYouTubeVideo(savedVideoData, savedVideoName);
            }
        } else {
            currentVideoElement.textContent = "No video added yet";
            videoTitleElement.textContent = "Find all 5 items to unlock your video song!";
        }
    }
    
    // Load YouTube video
    function loadYouTubeVideo(videoId, videoName = null) {
        if (videoName) {
            currentVideoElement.textContent = videoName;
            videoTitleElement.textContent = videoName;
        }
        
        // Extract video ID from different URL formats
        if (videoId.includes('youtu.be/')) {
            videoId = videoId.split('youtu.be/')[1].split('?')[0];
        } else if (videoId.includes('youtube.com/watch?v=')) {
            videoId = videoId.split('v=')[1].split('&')[0];
        } else if (videoId.includes('youtube.com/shorts/')) {
            videoId = videoId.split('shorts/')[1].split('?')[0];
        }
        
        // Create YouTube iframe
        const iframe = document.createElement('iframe');
        iframe.width = '100%';
        iframe.height = '450';
        iframe.src = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0`;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        
        // Replace video element with iframe
        videoElement.style.display = 'none';
        const videoContainer = document.querySelector('.video-player');
        videoContainer.innerHTML = '';
        videoContainer.appendChild(iframe);
        
        // Save to localStorage
        localStorage.setItem('videoType', 'youtube');
        localStorage.setItem('videoData', videoId);
        localStorage.setItem('videoName', videoName || "YouTube Video");
    }
    
    // Load saved video on start
    loadSavedVideo();
    
    // Item click handler
    document.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            
            if (foundItems.includes(itemId)) return;
            
            foundItems.push(itemId);
            this.classList.add('found');
            this.querySelector('.hint').textContent = 'Found! 🎉';
            
            const fragment = document.querySelector(`.fragment[data-fragment="${itemId}"]`);
            fragment.classList.add('revealed');
            
            foundCountElement.textContent = foundItems.length;
            playFoundSound();
            
            if (foundItems.length === totalItems) {
                setTimeout(() => {
                    finalReveal.classList.add('show');
                    startConfetti();
                    playCelebrationSound();
                    
                    setTimeout(() => {
                        finalReveal.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 500);
                }, 800);
            }
        });
    });
    
    // Sound effects (same as before)
    function playFoundSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 523.25;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log("Audio not supported");
        }
    }
    
    function playCelebrationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99];
            
            notes.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 1);
                }, index * 100);
            });
        } catch (e) {
            console.log("Audio not supported");
        }
    }
    
    // Replay button
    document.getElementById('replayBtn').addEventListener('click', function() {
        foundItems = [];
        foundCountElement.textContent = '0';
        
        document.querySelectorAll('.item').forEach(item => {
            item.classList.remove('found');
            item.querySelector('.hint').textContent = 'Click me';
        });
        
        document.querySelectorAll('.fragment').forEach(fragment => {
            fragment.classList.remove('revealed');
        });
        
        finalReveal.classList.remove('show');
        confettiParticles.length = 0;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // VIDEO UPLOAD FUNCTIONS
    
    // Local video upload
    localUploadBox.addEventListener('click', function() {
        localVideoUpload.click();
    });
    
    localVideoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check if it's a video file
            if (!file.type.startsWith('video/')) {
                alert('Please upload a video file (MP4, WebM, OGG, etc.)');
                return;
            }
            
            // Check file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                alert('Video file is too large. Please use a file under 50MB.');
                return;
            }
            
            // Create a local URL for the file
            const fileURL = URL.createObjectURL(file);
            
            // Reset to video element (in case YouTube was loaded before)
            const videoContainer = document.querySelector('.video-player');
            videoContainer.innerHTML = '<video id="customVideo" controls poster="poster.jpg">Your browser does not support the video tag.</video>';
            videoElement = document.getElementById('customVideo');
            
            // Update video player
            videoElement.src = fileURL;
            videoElement.controls = true;
            
            // Update display
            const videoName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
            currentVideoElement.textContent = videoName;
            videoTitleElement.textContent = `Now playing: ${videoName}`;
            
            // Save to localStorage
            localStorage.setItem('videoType', 'local');
            localStorage.setItem('videoData', fileURL);
            localStorage.setItem('videoName', videoName);
            
            // Show success animation
            const originalHTML = localUploadBox.innerHTML;
            localUploadBox.innerHTML = '<i class="fas fa-check-circle"></i><p>Video uploaded successfully!</p>';
            localUploadBox.style.borderColor = '#48bb78';
            localUploadBox.style.background = 'rgba(72, 187, 120, 0.1)';
            
            setTimeout(() => {
                localUploadBox.innerHTML = originalHTML;
                localUploadBox.style.borderColor = 'rgba(255, 158, 229, 0.4)';
                localUploadBox.style.background = 'rgba(255, 255, 255, 0.02)';
            }, 2000);
        }
    });
    
    // YouTube video load
    loadYoutubeBtn.addEventListener('click', function() {
        const youtubeLink = youtubeLinkInput.value.trim();
        
        if (!youtubeLink) {
            alert('Please enter a YouTube link');
            return;
        }
        
        if (!youtubeLink.includes('youtube.com') && !youtubeLink.includes('youtu.be')) {
            alert('Please enter a valid YouTube link');
            return;
        }
        
        // Extract video name from input or use default
        let videoName = "YouTube Video";
        if (youtubeLink.includes('youtube.com/watch?v=')) {
            const params = new URLSearchParams(youtubeLink.split('?')[1]);
            videoName = params.get('v') || "YouTube Video";
        }
        
        // Load YouTube video
        loadYouTubeVideo(youtubeLink, videoName);
        
        // Clear input
        youtubeLinkInput.value = '';
        
        // Show success
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Loaded!';
        btn.style.background = 'linear-gradient(45deg, #48bb78, #38a169)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'linear-gradient(45deg, #ff0000, #cc0000)';
        }, 2000);
    });
    
    // YouTube link on Enter key
    youtubeLinkInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loadYoutubeBtn.click();
        }
    });
    
    // Reset video button
    resetVideoBtn.addEventListener('click', function() {
        localStorage.removeItem('videoType');
        localStorage.removeItem('videoData');
        localStorage.removeItem('videoName');
        
        // Reset video player
        const videoContainer = document.querySelector('.video-player');
        videoContainer.innerHTML = '<video id="customVideo" controls poster="poster.jpg">Your browser does not support the video tag.</video>';
        videoElement = document.getElementById('customVideo');
        videoElement.src = '';
        
        currentVideoElement.textContent = "No video added yet";
        videoTitleElement.textContent = "Find all 5 items to unlock your video song!";
        
        // Reset YouTube input
        youtubeLinkInput.value = '';
        
        alert('Video has been reset. You can now add a new video.');
    });
    
    // Video control buttons
    playBtn.addEventListener('click', function() {
        if (videoElement.paused) {
            videoElement.play();
        }
    });
    
    pauseBtn.addEventListener('click', function() {
        if (!videoElement.paused) {
            videoElement.pause();
        }
    });
    
    fullscreenBtn.addEventListener('click', function() {
        if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen();
        } else if (videoElement.webkitRequestFullscreen) {
            videoElement.webkitRequestFullscreen();
        } else if (videoElement.mozRequestFullScreen) {
            videoElement.mozRequestFullScreen();
        }
    });
    
    muteBtn.addEventListener('click', function() {
        videoElement.muted = !videoElement.muted;
        muteBtn.innerHTML = videoElement.muted ? 
            '<i class="fas fa-volume-mute"></i> Unmute' : 
            '<i class="fas fa-volume-up"></i> Mute';
    });
    
    // Confetti system (same as before)
    const confettiParticles = [];
    const confettiColors = ['#ff9ee5', '#c77dff', '#9d4edd', '#7b2cbf', '#ffd6ff'];
    
    function createConfettiParticle() {
        return {
            x: Math.random() * confettiCanvas.width,
            y: -10,
            size: Math.random() * 12 + 6,
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 3 + 2,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            shape: Math.random() > 0.5 ? 'circle' : 'rectangle',
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 6 - 3,
            sway: Math.random() * 0.05
        };
    }
    
    function startConfetti() {
        for (let i = 0; i < 200; i++) {
            confettiParticles.push(createConfettiParticle());
        }
        animateConfetti();
    }
    
    function animateConfetti() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        for (let i = 0; i < confettiParticles.length; i++) {
            const p = confettiParticles[i];
            
            p.x += p.speedX + Math.sin(Date.now() * 0.001 + p.x) * p.sway;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            p.speedY += 0.05;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            
            if (p.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            }
            
            ctx.restore();
            
            if (p.y > confettiCanvas.height || p.x < -50 || p.x > confettiCanvas.width + 50) {
                if (Math.random() > 0.9 && confettiParticles.length < 250) {
                    confettiParticles.push(createConfettiParticle());
                }
                confettiParticles.splice(i, 1);
                i--;
            }
        }
        
        if (confettiParticles.length > 0) {
            requestAnimationFrame(animateConfetti);
        }
    }
    
    // Initial animations
    setTimeout(() => {
        document.querySelectorAll('.item').forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 500);
            }, index * 200);
        });
    }, 1000);
});
