import React, { useState, useEffect, useRef } from 'react';

// Interactive cooking timer component
export class CookingTimer {
  constructor(name, duration, stepIndex) {
    this.name = name;
    this.duration = duration; // in seconds
    this.stepIndex = stepIndex;
    this.remainingTime = duration;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0;
    this.timerRef = null;
    this.audioContext = null;
    this.completed = false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.startTime = Date.now() - this.pausedTime;
      this.timerRef = setInterval(() => this.update(), 1000);
      this.playNotificationSound('timer-start');
    }
  }

  pause() {
    if (this.isRunning && !this.completed) {
      this.isPaused = true;
      this.isRunning = false;
      this.pausedTime = Date.now() - this.startTime;
      clearInterval(this.timerRef);
      this.playNotificationSound('timer-pause');
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.isRunning = true;
      this.startTime = Date.now() - this.pausedTime;
      this.timerRef = setInterval(() => this.update(), 1000);
      this.playNotificationSound('timer-resume');
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.completed = false;
    this.remainingTime = this.duration;
    this.pausedTime = 0;
    clearInterval(this.timerRef);
    this.playNotificationSound('timer-stop');
  }

  complete() {
    this.isRunning = false;
    this.completed = true;
    this.remainingTime = 0;
    clearInterval(this.timerRef);
    this.playNotificationSound('timer-complete');
    this.showCompletionNotification();
  }

  update() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.remainingTime = Math.max(0, this.duration - elapsed);

    if (this.remainingTime === 0) {
      this.complete();
    }

    // Check for milestone notifications (25%, 50%, 75%)
    const progress = (this.duration - this.remainingTime) / this.duration;
    const milestones = [0.25, 0.5, 0.75];
    const currentMilestone = milestones.find(m => 
      Math.abs(progress - m) < 0.01 && !this.notifiedMilestones?.includes(m)
    );

    if (currentMilestone) {
      this.notifiedMilestones = this.notifiedMilestones || [];
      this.notifiedMilestones.push(currentMilestone);
      this.playNotificationSound(`timer-milestone-${Math.round(currentMilestone * 100)}percent`);
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getProgress() {
    return ((this.duration - this.remainingTime) / this.duration) * 100;
  }

  // Audio notification system
  playNotificationSound(type) {
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        this.audioContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different tones for different timer events
        const frequencies = {
          'timer-start': 800,
          'timer-pause': 600,
          'timer-resume': 700,
          'timer-stop': 400,
          'timer-complete': 1000,
          'timer-milestone-25percent': 500,
          'timer-milestone-50percent': 600,
          'timer-milestone-75percent': 700
        };

        oscillator.frequency.setValueAtTime(
          frequencies[type] || 800, 
          this.audioContext.currentTime
        );
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);

      } catch (error) {
        console.log('Audio notification failed:', error);
      }
    }
  }

  showCompletionNotification() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
          body: `${this.name} has finished!`,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }
}

// Voice-guided cooking mode
export class VoiceGuidedCooking {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commands = new Map();
    this.setupVoiceRecognition();
  }

  setupVoiceRecognition() {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();
        
        this.processCommand(command);
      };

      this.recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          this.recognition.start(); // Restart if still supposed to be listening
        }
      };
    }
  }

  registerCommand(command, callback) {
    this.commands.set(command, callback);
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
      this.isListening = true;
      console.log('Voice recognition started');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('Voice recognition stopped');
    }
  }

  processCommand(command) {
    // Find matching commands
    for (const [registeredCmd, callback] of this.commands) {
      if (command.includes(registeredCmd)) {
        callback();
        break;
      }
    }
  }

  speak(text) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  getSupportedCommands() {
    return [
      'next step', 'previous step', 'pause timer', 'resume timer',
      'stop timer', 'help', 'start listening', 'stop listening'
    ];
  }
}

// Interactive Timer Component
export const InteractiveTimer = ({ 
  timer, 
  onTimerChange, 
  onTimerComplete,
  stepIndex,
  stepName 
}) => {
  const [progress, setProgress] = useState(0);
  const [displayTime, setDisplayTime] = useState(timer.formatTime(timer.remainingTime));
  const [isRunning, setIsRunning] = useState(timer.isRunning);
  const [isPaused, setIsPaused] = useState(timer.isPaused);

  useEffect(() => {
    if (timer.isRunning && !timer.completed) {
      setIsRunning(true);
      setIsPaused(false);
    } else if (timer.isPaused) {
      setIsRunning(false);
      setIsPaused(true);
    } else {
      setIsRunning(false);
      setIsPaused(false);
    }

    setDisplayTime(timer.formatTime(timer.remainingTime));
    setProgress(timer.getProgress());
  }, [timer.remainingTime, timer.isRunning, timer.isPaused, timer.completed]);

  const handleStart = () => {
    timer.start();
    onTimerChange?.(timer);
  };

  const handlePause = () => {
    timer.pause();
    onTimerChange?.(timer);
  };

  const handleResume = () => {
    timer.resume();
    onTimerChange?.(timer);
  };

  const handleStop = () => {
    timer.stop();
    onTimerChange?.(timer);
  };

  return (
    <div className={`interactive-timer ${timer.completed ? 'completed' : ''} ${isRunning ? 'running' : ''} ${isPaused ? 'paused' : ''}`}>
      <div className="timer-header">
        <h3>{stepName} - Timer {stepIndex + 1}</h3>
        <div className="timer-status">
          {timer.completed && <span className="status-badge completed">✅ Complete</span>}
          {isRunning && !timer.completed && <span className="status-badge running">🔄 Running</span>}
          {isPaused && <span className="status-badge paused">⏸️ Paused</span>}
          {!isRunning && !isPaused && !timer.completed && <span className="status-badge stopped">⏹️ Stopped</span>}
        </div>
      </div>

      <div className="timer-display">
        <div className="time-display">{displayTime}</div>
        <div className="timer-name">{timer.name}</div>
      </div>

      <div className="timer-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {Math.round(progress)}% Complete
        </div>
      </div>

      <div className="timer-controls">
        {!isRunning && !timer.completed && (
          <button onClick={handleStart} className="control-button start">
            ▶️ Start
          </button>
        )}
        
        {isRunning && (
          <button onClick={handlePause} className="control-button pause">
            ⏸️ Pause
          </button>
        )}
        
        {isPaused && (
          <button onClick={handleResume} className="control-button resume">
            ▶️ Resume
          </button>
        )}
        
        <button onClick={handleStop} className="control-button stop">
            ⏹️ Stop
          </button>
      </div>

      {timer.completed && (
        <div className="completion-message">
          <h4>🎉 Timer Complete!</h4>
          <p>{stepName} has finished. Move to the next step!</p>
        </div>
      )}
    </div>
  );
};

// Voice Guide Component
export const VoiceGuide = ({ 
  currentStep, 
  totalSteps, 
  onVoiceCommand 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const voiceGuide = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setVoiceSupported(supported);
      
      if (supported) {
        voiceGuide.current = new VoiceGuidedCooking();
        
        // Register voice commands
        voiceGuide.current.registerCommand('next step', () => {
          onVoiceCommand?.('next');
        });
        
        voiceGuide.current.registerCommand('previous step', () => {
          onVoiceCommand?.('previous');
        });
        
        voiceGuide.current.registerCommand('pause timer', () => {
          onVoiceCommand?.('pause');
        });
        
        voiceGuide.current.registerCommand('resume timer', () => {
          onVoiceCommand?.('resume');
        });
        
        voiceGuide.current.registerCommand('stop timer', () => {
          onVoiceCommand?.('stop');
        });
        
        voiceGuide.current.registerCommand('help', () => {
          const commands = voiceGuide.current.getSupportedCommands();
          voiceGuide.current.speak(`Available commands: ${commands.join(', ')}`);
        });
      }
    }
  }, [onVoiceCommand]);

  const toggleVoiceListening = () => {
    if (voiceGuide.current) {
      if (isListening) {
        voiceGuide.current.stopListening();
        setIsListening(false);
      } else {
        voiceGuide.current.startListening();
        setIsListening(true);
        voiceGuide.current.speak(`Voice guide activated. You are on step ${currentStep + 1} of ${totalSteps}. Say "help" for available commands.`);
      }
    }
  };

  const announceCurrentStep = () => {
    if (voiceGuide.current) {
      voiceGuide.current.speak(`Step ${currentStep + 1}: ${currentStep.instruction}`);
    }
  };

  return (
    <div className="voice-guide">
      <div className="voice-header">
        <h3>🎤 Voice Guide</h3>
        <div className="voice-controls">
          <button 
            onClick={toggleVoiceListening}
            className={`voice-button ${isListening ? 'listening' : ''}`}
          >
            {isListening ? '🔴 Listening' : '🎤 Start Voice Guide'}
          </button>
          
          <button 
            onClick={announceCurrentStep}
            className="voice-button announce"
          >
            🔊 Announce Step
          </button>
        </div>
      </div>

      {voiceSupported && !isListening && (
        <div className="voice-instructions">
          <p>
            Click <span className="pill">Start Voice Guide</span> to enable voice commands:
          </p>
          <ul>
            <li><code>next step</code> - Move to next step</li>
            <li><code>previous step</code> - Move to previous step</li>
            <li><code>pause timer</code> - Pause current timer</li>
            <li><code>resume timer</code> - Resume current timer</li>
            <li><code>stop timer</code> - Stop current timer</li>
            <li><code>help</code> - List all commands</li>
          </ul>
        </div>
      )}

      {!voiceSupported && (
        <div className="voice-not-supported">
          <p>❌ Voice recognition is not supported in your browser.</p>
          <p>Please use Chrome, Edge, or Safari for voice guidance features.</p>
        </div>
      )}

      {isListening && (
        <div className="voice-listening">
          <div className="pulse-indicator"></div>
          <p>Listening for voice commands...</p>
        </div>
      )}
    </div>
  );
};

// Step-by-step Recipe Timer
export const RecipeStepTimer = ({ recipe, onStepComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTimers, setActiveTimers] = useState([]);
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);

  const handleTimerComplete = (timer) => {
    onTimerComplete?.(timer);
    onStepComplete?.(currentStep);
  };

  const handleVoiceCommand = (command) => {
    switch (command) {
      case 'next':
        if (currentStep < recipe.instructions.length - 1) {
          setCurrentStep(prev => prev + 1);
        }
        break;
      case 'previous':
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
        }
        break;
      case 'pause':
        // Pause all active timers
        activeTimers.forEach(timer => timer.pause());
        break;
      case 'resume':
        // Resume all active timers
        activeTimers.forEach(timer => timer.resume());
        break;
      case 'stop':
        // Stop all active timers
        activeTimers.forEach(timer => timer.stop());
        setActiveTimers([]);
        break;
    }
  };

  const addTimer = (name, duration) => {
    const timer = new CookingTimer(name, duration, currentStep);
    setActiveTimers(prev => [...prev, timer]);
    return timer;
  };

  return (
    <div className="recipe-step-timer">
      <div className="step-navigation">
        <button 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
          className="nav-button"
        >
          ← Previous Step
        </button>
        
        <div className="step-info">
          <h3>Step {currentStep + 1} of {recipe.instructions.length}</h3>
          <p>{recipe.instructions[currentStep]}</p>
        </div>
        
        <button 
          onClick={() => setCurrentStep(prev => Math.min(recipe.instructions.length - 1, prev + 1))}
          disabled={currentStep === recipe.instructions.length - 1}
          className="nav-button"
        >
          Next Step →
        </button>
      </div>

      <div className="timers-container">
        <h4>Active Timers</h4>
        <div className="timers-grid">
          {activeTimers.map((timer, index) => (
            <InteractiveTimer
              key={index}
              timer={timer}
              onTimerChange={() => {}}
              onTimerComplete={handleTimerComplete}
              stepIndex={currentStep}
              stepName={timer.name}
            />
          ))}
        </div>
        
        {activeTimers.length === 0 && (
          <div className="no-timers">
            <p>No active timers for this step.</p>
            <button 
              onClick={() => {
                const timer = addTimer('Step Timer', 300); // 5 minutes default
                timer.start();
              }}
              className="add-timer-button"
            >
              + Add Timer
            </button>
          </div>
        )}
      </div>

      <VoiceGuide
        currentStep={currentStep}
        totalSteps={recipe.instructions.length}
        onVoiceCommand={handleVoiceCommand}
      />

      <div className="recipe-progress">
        <h4>Recipe Progress</h4>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / recipe.instructions.length) * 100}%` }}
          ></div>
        </div>
        <p>{currentStep + 1} of {recipe.instructions.length} steps completed</p>
      </div>
    </div>
  );
};

export default RecipeStepTimer;
