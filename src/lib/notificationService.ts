// Centralized notification service for sound and browser notifications

class NotificationService {
  private audioContext: AudioContext | null = null;
  private isAudioUnlocked = false;

  // Initialize audio context on user interaction
  initAudio() {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume on user interaction for mobile
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      this.isAudioUnlocked = true;
    } catch (error) {
      console.log('AudioContext not supported');
    }
  }

  // Unlock audio on first user interaction (required for mobile)
  unlockAudio() {
    if (this.isAudioUnlocked) return;
    
    this.initAudio();
    
    if (this.audioContext) {
      // Play silent sound to unlock
      const buffer = this.audioContext.createBuffer(1, 1, 22050);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      source.start(0);
      this.isAudioUnlocked = true;
    }
  }

  // Play notification chime sound
  playSound() {
    try {
      if (!this.audioContext) {
        this.initAudio();
      }
      
      if (!this.audioContext) return;

      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;
      
      // Three-tone pleasant chime
      const tones = [
        { freq: 880, delay: 0, duration: 0.15, gain: 0.4 },      // A5
        { freq: 1318.5, delay: 0.1, duration: 0.25, gain: 0.4 }, // E6
        { freq: 1760, delay: 0.2, duration: 0.3, gain: 0.3 },    // A6
      ];

      tones.forEach(({ freq, delay, duration, gain: gainValue }) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.setValueAtTime(gainValue, currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + delay + duration);
        
        oscillator.start(currentTime + delay);
        oscillator.stop(currentTime + delay + duration);
      });
    } catch (error) {
      console.log('Failed to play sound:', error);
    }
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return 'Notification' in window;
  }

  // Get current permission status
  getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'default';
    }
  }

  // Show browser notification
  showNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        requireInteraction: false,
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return null;
    }
  }

  // Combined: play sound + show notification
  notify(title: string, body: string, tag?: string) {
    this.playSound();
    this.showNotification(title, { body, tag });
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Initialize on user interaction
if (typeof window !== 'undefined') {
  const unlockHandler = () => {
    notificationService.unlockAudio();
  };

  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, unlockHandler, { once: true, passive: true });
  });
}
