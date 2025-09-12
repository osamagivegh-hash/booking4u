// State Preservation Utility
// This utility helps preserve form state and scroll position to prevent data loss

class StatePreservation {
  constructor() {
    this.formStates = new Map();
    this.scrollPositions = new Map();
    this.isPreserving = false;
    
    this.setupPreservation();
  }

  setupPreservation() {
    // Preserve scroll position on page unload
    window.addEventListener('beforeunload', () => {
      this.saveScrollPosition();
    });

    // Restore scroll position on page load
    window.addEventListener('load', () => {
      this.restoreScrollPosition();
    });

    // Preserve form states on input changes
    this.setupFormPreservation();
  }

  setupFormPreservation() {
    // Use event delegation to capture form input changes
    document.addEventListener('input', (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        this.saveFormState(event.target);
      }
    });

    document.addEventListener('change', (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        this.saveFormState(event.target);
      }
    });
  }

  saveFormState(element) {
    if (!element.form) return;

    const formId = element.form.id || element.form.action || 'default-form';
    const formData = new FormData(element.form);
    const formState = {};

    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
      formState[key] = value;
    }

    // Store form state
    this.formStates.set(formId, {
      data: formState,
      timestamp: Date.now()
    });

    // Also store in sessionStorage for persistence across page reloads
    try {
      sessionStorage.setItem(`form-state-${formId}`, JSON.stringify(formState));
    } catch (error) {
      console.warn('Could not save form state to sessionStorage:', error);
    }
  }

  restoreFormState(formId) {
    try {
      // Try to restore from sessionStorage first
      const savedState = sessionStorage.getItem(`form-state-${formId}`);
      if (savedState) {
        const formData = JSON.parse(savedState);
        const form = document.getElementById(formId) || document.querySelector(`form[action="${formId}"]`);
        
        if (form) {
          // Restore form values
          Object.entries(formData).forEach(([name, value]) => {
            const element = form.querySelector(`[name="${name}"]`);
            if (element) {
              if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = value === 'on' || value === element.value;
              } else {
                element.value = value;
              }
            }
          });
          
          console.log('🔧 Form state restored for:', formId);
          return true;
        }
      }
    } catch (error) {
      console.warn('Could not restore form state:', error);
    }
    return false;
  }

  saveScrollPosition() {
    const scrollPosition = {
      x: window.scrollX || window.pageXOffset,
      y: window.scrollY || window.pageYOffset,
      timestamp: Date.now()
    };

    this.scrollPositions.set(window.location.pathname, scrollPosition);

    try {
      sessionStorage.setItem('scroll-position', JSON.stringify(scrollPosition));
    } catch (error) {
      console.warn('Could not save scroll position:', error);
    }
  }

  restoreScrollPosition() {
    try {
      const savedPosition = sessionStorage.getItem('scroll-position');
      if (savedPosition) {
        const position = JSON.parse(savedPosition);
        
        // Only restore if the position is recent (within 5 minutes)
        if (Date.now() - position.timestamp < 300000) {
          setTimeout(() => {
            window.scrollTo(position.x, position.y);
            console.log('🔧 Scroll position restored:', position);
          }, 100);
          return true;
        }
      }
    } catch (error) {
      console.warn('Could not restore scroll position:', error);
    }
    return false;
  }

  // Method to clear saved states (useful for successful form submissions)
  clearFormState(formId) {
    this.formStates.delete(formId);
    try {
      sessionStorage.removeItem(`form-state-${formId}`);
    } catch (error) {
      console.warn('Could not clear form state:', error);
    }
  }

  clearScrollPosition() {
    this.scrollPositions.clear();
    try {
      sessionStorage.removeItem('scroll-position');
    } catch (error) {
      console.warn('Could not clear scroll position:', error);
    }
  }

  // Method to prevent page reloads from causing data loss
  preventDataLoss() {
    this.isPreserving = true;
    
    // Override window.location.reload to preserve state
    const originalReload = window.location.reload;
    window.location.reload = function() {
      console.warn('🔧 Page reload prevented to preserve form data');
      // Don't actually reload, just show a warning
      return false;
    };

    // Restore original reload after a delay
    setTimeout(() => {
      window.location.reload = originalReload;
      this.isPreserving = false;
    }, 1000);
  }

  // Method to get current form states (for debugging)
  getFormStates() {
    return Array.from(this.formStates.entries()).map(([id, state]) => ({
      id,
      timestamp: state.timestamp,
      fieldCount: Object.keys(state.data).length
    }));
  }
}

// Create global instance
const statePreservation = new StatePreservation();

// Export for use in components
export default statePreservation;

// Make available globally
if (typeof window !== 'undefined') {
  window.statePreservation = statePreservation;
}
