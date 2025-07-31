// ZenTime - Enhanced App

let currentUser = { stats: { workouts: 0, meditations: 0, totalMinutes: 0 } };

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
    }, 2000);

    initializeApp();
});

function initializeApp() {
    initializeNavigation();
    initializeAnimations();
    initializeStats();
    initializeAI();
    addEventListeners();
    loadUserData();
}

function initializeNavigation() {
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('animate');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .quick-action-card, .stat-item').forEach(el => {
        observer.observe(el);
    });
}

function initializeStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => statsObserver.observe(stat));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * target);
        element.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(updateCounter);
    }
    requestAnimationFrame(updateCounter);
}

function initializeAI() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Disable input while processing
    chatInput.disabled = true;
    chatInput.value = '';
    
    addChatMessage(message, 'user');
    showTypingIndicator();
    
    try {
        const response = await getAIResponse(message);
        hideTypingIndicator();
        addChatMessage(response, 'ai');
    } catch (error) {
        hideTypingIndicator();
        addChatMessage('I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or feel free to ask me about fitness, meditation, or wellness topics!', 'ai');
        console.error('Chat error:', error);
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        chatInput.focus();
    }
}

async function getAIResponse(message) {
    const GEMINI_API_KEY = 'AIzaSyChvstP-mGvGCLs8iYl1xl6srP66l_DxK4';
    
    // Enhanced prompt for better AI responses
    const prompt = `You are ZenTime AI Coach, a futuristic fitness and meditation expert with advanced knowledge in wellness, nutrition, and mental health. 

User Message: "${message}"

Please provide:
1. Helpful, encouraging, and practical advice
2. Specific, actionable recommendations
3. Motivational support
4. Science-backed information when relevant

Keep responses concise (2-4 sentences) but informative. Be friendly, supportive, and professional. Focus on fitness, meditation, wellness, nutrition, mental health, or general health topics.

If the user asks about something outside your expertise, politely redirect them to fitness/wellness topics.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: prompt }] 
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 150
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from API');
        }
        
    } catch (error) {
        console.error('AI Response Error:', error);
        
        // Enhanced fallback responses based on message content
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('fitness')) {
            return "For your fitness goals, I recommend starting with 20-30 minutes of moderate exercise 3-4 times per week. Focus on compound movements like squats, push-ups, and planks. Remember to warm up properly and listen to your body!";
        } else if (lowerMessage.includes('meditation') || lowerMessage.includes('mindfulness') || lowerMessage.includes('stress')) {
            return "Meditation is excellent for mental wellness! Start with just 5 minutes daily, focusing on your breath. Find a quiet space, sit comfortably, and let thoughts pass without judgment. Consistency matters more than duration.";
        } else if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('food')) {
            return "For optimal nutrition, focus on whole foods, plenty of vegetables, lean proteins, and healthy fats. Stay hydrated with 8-10 glasses of water daily. Small, sustainable changes lead to lasting results!";
        } else if (lowerMessage.includes('sleep') || lowerMessage.includes('rest') || lowerMessage.includes('recovery')) {
            return "Quality sleep is crucial for recovery and performance! Aim for 7-9 hours nightly, maintain a consistent sleep schedule, and create a relaxing bedtime routine. Your body needs rest to grow stronger.";
        } else {
            return "I'm here to support your wellness journey! Whether it's fitness, meditation, nutrition, or mental health, I'm ready to help. What specific area would you like to focus on today?";
        }
    }
}

function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
            <small class="text-muted">AI Coach is thinking...</small>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
}

function startQuickWorkout() {
    showWorkoutModal();
}

function showWorkoutModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-activity me-2"></i>Quick HIIT Workout
                    </h5>
                    <button type="button" class="btn-close" onclick="closeModal()"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="workout-timer mb-4">
                        <div class="timer-display" id="workoutTimer">10:00</div>
                        <div class="exercise-name" id="currentExercise">Jumping Jacks</div>
                    </div>
                    <div class="workout-progress mb-4">
                        <div class="progress">
                            <div class="progress-bar" id="workoutProgress" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="workout-controls">
                        <button class="btn btn-primary me-2" onclick="startWorkoutTimer()">
                            <i class="bi bi-play"></i> Start
                        </button>
                        <button class="btn btn-danger" onclick="closeModal()">
                            <i class="bi bi-stop"></i> Stop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
}

function startWorkoutTimer() {
    let timeRemaining = 600;
    const exercises = ['Jumping Jacks', 'Push-ups', 'Mountain Climbers', 'Squats', 'Burpees'];
    let currentExercise = 0;
    
    const timer = setInterval(() => {
        timeRemaining--;
        
        const timerDisplay = document.getElementById('workoutTimer');
        const progressBar = document.getElementById('workoutProgress');
        const exerciseName = document.getElementById('currentExercise');
        
        if (timerDisplay) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (progressBar) {
            const progress = ((600 - timeRemaining) / 600) * 100;
            progressBar.style.width = `${progress}%`;
        }
        
        if (timeRemaining % 120 === 0 && currentExercise < exercises.length - 1) {
            currentExercise++;
            if (exerciseName) {
                exerciseName.textContent = exercises[currentExercise];
                showExerciseTransition(exercises[currentExercise]);
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timer);
            showWorkoutComplete();
        }
    }, 1000);
}

function showExerciseTransition(exercise) {
    const transition = document.createElement('div');
    transition.className = 'exercise-transition';
    transition.innerHTML = `
        <div class="transition-content">
            <h3>${exercise}</h3>
            <div class="transition-animation"></div>
        </div>
    `;
    document.body.appendChild(transition);
    setTimeout(() => transition.remove(), 2000);
}

function showWorkoutComplete() {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body text-center">
                    <i class="bi bi-trophy text-warning" style="font-size: 3rem;"></i>
                    <h4 class="mt-3">Workout Complete!</h4>
                    <p>Great job! You burned approximately 80 calories.</p>
                    <div class="achievement-badge">
                        <i class="bi bi-star-fill"></i>
                        <span>Workout Warrior</span>
                    </div>
                    <button class="btn btn-primary" onclick="closeModal()">Continue</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    currentUser.stats.workouts++;
    currentUser.stats.totalMinutes += 10;
    saveUserData();
}

function startMeditation() {
    showMeditationModal();
}

function showMeditationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-heart me-2"></i>Mindfulness Meditation
                    </h5>
                    <button type="button" class="btn-close" onclick="closeModal()"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="meditation-visual mb-4">
                        <div class="breathing-circle" id="meditationCircle">
                            <div class="circle-text">Breathe</div>
                        </div>
                    </div>
                    <div class="meditation-timer mb-4">
                        <div class="timer-display" id="meditationTimer">05:00</div>
                        <div class="instruction-text" id="meditationInstruction">Inhale...</div>
                    </div>
                    <div class="meditation-controls">
                        <button class="btn btn-primary me-2" onclick="startMeditationTimer()">
                            <i class="bi bi-play"></i> Start
                        </button>
                        <button class="btn btn-danger" onclick="closeModal()">
                            <i class="bi bi-stop"></i> Stop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
}

function startMeditationTimer() {
    let timeRemaining = 300;
    let isInhaling = true;
    
    const timer = setInterval(() => {
        timeRemaining--;
        
        const timerDisplay = document.getElementById('meditationTimer');
        if (timerDisplay) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timer);
            showMeditationComplete();
        }
    }, 1000);
    
    const circle = document.getElementById('meditationCircle');
    const instruction = document.getElementById('meditationInstruction');
    
    const breathingInterval = setInterval(() => {
        if (timeRemaining <= 0) {
            clearInterval(breathingInterval);
            return;
        }
        
        if (isInhaling) {
            circle.classList.add('inhale');
            circle.classList.remove('exhale');
            instruction.textContent = 'Inhale...';
            } else {
            circle.classList.add('exhale');
            circle.classList.remove('inhale');
            instruction.textContent = 'Exhale...';
        }
        
        isInhaling = !isInhaling;
    }, 4000);
}

function showMeditationComplete() {
    closeModal();
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-body text-center">
                    <i class="bi bi-heart text-success" style="font-size: 3rem;"></i>
                    <h4 class="mt-3">Meditation Complete!</h4>
                    <p>Great job! You've taken time for mindfulness.</p>
                    <div class="achievement-badge">
                        <i class="bi bi-heart-fill"></i>
                        <span>Zen Master</span>
                    </div>
                    <button class="btn btn-primary" onclick="closeModal()">Continue</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    currentUser.stats.meditations++;
    currentUser.stats.totalMinutes += 5;
    saveUserData();
}

function openMusicPlayer() {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-music-note me-2"></i>AI-Powered Music Player
                    </h5>
                    <button type="button" class="btn-close" onclick="closeModal()"></button>
                </div>
                <div class="modal-body text-center">
                    <div class="music-player">
                        <div class="now-playing mb-4">
                            <div class="album-cover mx-auto mb-3">
                                <i class="bi bi-music-note-beamed"></i>
                            </div>
                            <h5>AI-Generated Workout Mix</h5>
                            <p class="text-muted">ZenTime AI</p>
                        </div>
                        <div class="player-controls mb-4">
                            <button class="btn btn-outline-primary me-2">
                                <i class="bi bi-skip-backward"></i>
                            </button>
                            <button class="btn btn-primary btn-lg me-2">
                                <i class="bi bi-play-fill"></i>
                            </button>
                            <button class="btn btn-outline-primary">
                                <i class="bi bi-skip-forward"></i>
                            </button>
                        </div>
                        <div class="ai-music-features mb-4">
                            <h6>AI Features</h6>
                            <div class="feature-buttons">
                                <button class="btn btn-sm btn-outline-success me-2">
                                    <i class="bi bi-lightning"></i> Energy Boost
                                </button>
                                <button class="btn btn-sm btn-outline-info me-2">
                                    <i class="bi bi-heart"></i> Calm Mode
                                </button>
                                <button class="btn btn-sm btn-outline-warning">
                                    <i class="bi bi-graph-up"></i> Focus Flow
                                </button>
                            </div>
                        </div>
                        <div class="playlist">
                            <h6>AI-Curated Playlists</h6>
                            <div class="list-group">
                                <div class="list-group-item">High-Intensity Workout Mix</div>
                                <div class="list-group-item">Meditation & Relaxation</div>
                                <div class="list-group-item">Focus & Productivity</div>
                                <div class="list-group-item">Recovery & Cool Down</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
}

function openProgressTracker() {
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="bi bi-graph-up me-2"></i>AI-Powered Progress Analytics
                    </h5>
                    <button type="button" class="btn-close" onclick="closeModal()"></button>
                </div>
                <div class="modal-body">
                    <div class="progress-stats">
                        <div class="row text-center">
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <h3>${currentUser.stats.workouts}</h3>
                                    <p>Workouts</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <h3>${currentUser.stats.meditations}</h3>
                                    <p>Meditations</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <h3>${currentUser.stats.totalMinutes}</h3>
                                    <p>Total Minutes</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <h3>0</h3>
                                    <p>Voice Commands</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ai-insights mt-4">
                        <h6>AI Insights</h6>
                        <div class="insight-card">
                            <i class="bi bi-lightbulb"></i>
                            <p>Based on your patterns, you perform best in the morning. Try scheduling workouts before 10 AM.</p>
                        </div>
                        <div class="insight-card">
                            <i class="bi bi-graph-up"></i>
                            <p>Your meditation consistency has improved by 25% this week. Keep it up!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
}

function closeModal() {
    const modal = document.querySelector('.modal.show');
    if (modal) {
        modal.remove();
        document.body.classList.remove('modal-open');
    }
}

function saveUserData() {
    localStorage.setItem('zenTimeUserData', JSON.stringify(currentUser));
}

function loadUserData() {
    const savedData = localStorage.getItem('zenTimeUserData');
    if (savedData) {
        currentUser = { ...currentUser, ...JSON.parse(savedData) };
    }
}

function addEventListeners() {
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Message character counter
    const messageInput = document.getElementById('message');
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            const maxLength = 500;
            const currentLength = this.value.length;
            const remaining = maxLength - currentLength;
            
            // Update character counter
            const counter = this.parentNode.querySelector('.form-text');
            if (counter) {
                counter.textContent = `${remaining} characters remaining`;
                counter.style.color = remaining < 50 ? '#dc3545' : '#6c757d';
            }
            
            // Disable if over limit
            if (currentLength > maxLength) {
                this.value = this.value.substring(0, maxLength);
            }
        });
    }
    
    window.startQuickWorkout = startQuickWorkout;
    window.startMeditation = startMeditation;
    window.openMusicPlayer = openMusicPlayer;
    window.openProgressTracker = openProgressTracker;
    window.openAIChat = openAIChat;
    window.sendMessage = sendMessage;
    window.closeModal = closeModal;
}

function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Basic validation
    if (!data.firstName || !data.lastName || !data.email || !data.subject || !data.message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
                    return;
                }
                
    // Simulate form submission
    alert('Sending message...');
    
    setTimeout(() => {
        alert('Thank you for your message! We\'ll get back to you soon.');
        form.reset();
        
        // Reset character counter
        const counter = form.querySelector('.form-text');
        if (counter) {
            counter.textContent = 'Maximum 500 characters';
            counter.style.color = '#6c757d';
        }
    }, 1000);
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
    e.target.reset();
}

function openAIChat() {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.focus();
} 