document.addEventListener('DOMContentLoaded', () => {
    const startButtons = document.querySelectorAll('.start-btn');
    const stopButton = document.querySelector('.stop-btn');
    const timerDisplay = document.querySelector('.timer-display');
    const alarmSound = document.getElementById('alarmSound');
    let activeTimer = null;
    let timeLeft = 0;

    // Create alarm notification element
    const alarmNotification = document.createElement('div');
    alarmNotification.className = 'alarm-notification';
    alarmNotification.innerHTML = `
        <h3>Time's Up! 🎉</h3>
        <p>Your egg is ready!</p>
    `;
    document.body.appendChild(alarmNotification);

    // Initialize audio
    alarmSound.volume = 1.0;
    alarmSound.load();

    // Function to initialize audio with user interaction
    function initializeAudio() {
        return new Promise((resolve) => {
            const playAudio = () => {
                alarmSound.play()
                    .then(() => {
                        alarmSound.pause();
                        alarmSound.currentTime = 0;
                        resolve();
                    })
                    .catch(error => {
                        console.log("Audio initialization failed:", error);
                        // Try again on next click
                        document.addEventListener('click', playAudio, { once: true });
                    });
            };
            document.addEventListener('click', playAudio, { once: true });
        });
    }

    // Initialize audio on first click
    initializeAudio();

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function playAlarmSound() {
        // Reset and play the sound
        alarmSound.currentTime = 0;
        alarmSound.play().catch(error => {
            console.log("Audio playback failed:", error);
            // Try to initialize audio again
            initializeAudio().then(() => {
                alarmSound.play();
            });
        });
    }

    function stopAlarmSound() {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }

    function showAlarm() {
        // Play sound
        playAlarmSound();
        
        // Show notification
        alarmNotification.classList.add('show');
        
        // Add alarm animation to timer display
        timerDisplay.classList.add('alarm-active');
        
        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        // Hide notification and stop sound after 5 seconds
        setTimeout(() => {
            alarmNotification.classList.remove('show');
            timerDisplay.classList.remove('alarm-active');
            stopAlarmSound();
        }, 5000);
    }

    function startTimer(duration) {
        if (activeTimer) {
            clearInterval(activeTimer);
        }

        // Reset any existing alarm states
        timerDisplay.classList.remove('alarm-active');
        alarmNotification.classList.remove('show');
        stopAlarmSound();

        timeLeft = duration * 60;
        timerDisplay.textContent = formatTime(timeLeft);
        stopButton.style.display = 'inline-block';

        activeTimer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = formatTime(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(activeTimer);
                showAlarm();
                stopButton.style.display = 'none';
                
                // Create browser notification if supported
                if ('Notification' in window) {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification('Egg Timer', {
                                body: 'Your egg is ready!',
                                icon: 'https://cdn-icons-png.flaticon.com/512/1046/1046874.png'
                            });
                        }
                    });
                }
            }
        }, 1000);
    }

    startButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.egg-card');
            const duration = parseInt(card.dataset.time);
            startTimer(duration);
        });
    });

    stopButton.addEventListener('click', () => {
        if (activeTimer) {
            clearInterval(activeTimer);
            activeTimer = null;
            timerDisplay.textContent = '00:00';
            stopButton.style.display = 'none';
            timerDisplay.classList.remove('alarm-active');
            alarmNotification.classList.remove('show');
            stopAlarmSound();
        }
    });

    // Request notification permission on page load
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}); 