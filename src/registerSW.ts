import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

// Register service worker with auto-update
export function initializePWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Show a toast notification when a new version is available
      toast.info('New version available!', {
        description: 'Click to update and get the latest features.',
        duration: Infinity,
        action: {
          label: 'Update',
          onClick: () => {
            updateSW(true); // Force update
          }
        },
        cancel: {
          label: 'Later',
          onClick: () => {
            toast.dismiss();
          }
        }
      });
    },
    onOfflineReady() {
      // Notify user that the app is ready to work offline
      toast.success('App ready for offline use!', {
        description: 'You can now use Cal AI without an internet connection.',
        duration: 5000
      });
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);

      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
      // Don't show error toast as it might confuse users
      // PWA features simply won't be available
    }
  });

  return updateSW;
}

// Check if app is running as installed PWA
export function isRunningAsPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Prompt user to install PWA (if supported and not already installed)
export function promptPWAInstall() {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show install button or notification
    toast.info('Install Cal AI', {
      description: 'Add Cal AI to your home screen for quick access and offline use.',
      duration: 10000,
      action: {
        label: 'Install',
        onClick: async () => {
          if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
              toast.success('Thanks for installing Cal AI!');
            }

            // Clear the deferred prompt
            deferredPrompt = null;
          }
        }
      }
    });
  });

  // Track successful installation
  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    toast.success('Cal AI installed!', {
      description: 'You can now access Cal AI from your home screen.',
      duration: 5000
    });
    deferredPrompt = null;
  });
}
