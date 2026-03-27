/**
 * Timer Module
 * 
 * Manages the quiz session timer, display updates, and visual feedback.
 * Provides start, stop, and update operations with optional expiry callback.
 * 
 * @module timer
 * @requires None — pure module with no external dependencies
 */

const Timer = (function() {
    'use strict';
    
    // Private state
    let _secondsRemaining = 0;
    let _intervalId = null;
    let _onExpiry = null;
    let _onTick = null;
    let _totalSeconds = 0;
    
    // DOM element references
    let _displayEl = null;
    let _barFillEl = null;
    
    /**
     * Format seconds into MM:SS format
     * @param {number} seconds - Seconds to format (0-3599)
     * @returns {string} Formatted time string
     */
    function _formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Determine timer status class based on remaining time
     * @param {number} remaining - Seconds remaining
     * @param {number} total - Total seconds
     * @returns {string} CSS class: 'ok', 'warn', or 'danger'
     */
    function _getStatusClass(remaining, total) {
        const pctLeft = remaining / total;
        if (pctLeft < 0.25) return 'danger';
        if (pctLeft < 0.5) return 'warn';
        return 'ok';
    }
    
    /**
     * Get color CSS variable for timer bar based on remaining time
     * @param {number} remaining - Seconds remaining
     * @param {number} total - Total seconds
     * @returns {string} CSS variable name
     */
    function _getBarColor(remaining, total) {
        const pctLeft = remaining / total;
        if (pctLeft < 0.25) return 'var(--timer-danger)';
        if (pctLeft < 0.5) return 'var(--timer-warn)';
        return 'var(--timer-ok)';
    }
    
    /**
     * Update timer display and progress bar
     * Calls _onTick callback if provided
     */
    function _updateDisplay() {
        if (!_displayEl) return;
        
        const formatted = _formatTime(_secondsRemaining);
        const statusClass = _getStatusClass(_secondsRemaining, _totalSeconds);
        const barColor = _getBarColor(_secondsRemaining, _totalSeconds);
        const pctLeft = (_secondsRemaining / _totalSeconds) * 100;
        
        _displayEl.textContent = formatted;
        _displayEl.className = `timer-display ${statusClass}`;
        
        if (_barFillEl) {
            _barFillEl.style.width = `${pctLeft}%`;
            _barFillEl.style.background = barColor;
        }
        
        // Notify on each tick
        if (_onTick && typeof _onTick === 'function') {
            _onTick(_secondsRemaining);
        }
    }
    
    /**
     * Timer tick — decrement seconds and update
     */
    function _tick() {
        if (_secondsRemaining <= 0) {
            stop();
            if (_onExpiry && typeof _onExpiry === 'function') {
                _onExpiry();
            }
            return;
        }
        
        _secondsRemaining--;
        _updateDisplay();
    }
    
    // Public API
    return {
        /**
         * Initialize timer with DOM element references
         * @param {Object} options - Configuration options
         * @param {HTMLElement} options.displayElement - Element to show time
         * @param {HTMLElement} options.barFillElement - Progress bar fill element
         * @returns {Object} Timer instance
         */
        init: function(options) {
            _displayEl = options.displayElement || null;
            _barFillEl = options.barFillElement || null;
            return this;
        },
        
        /**
         * Start the timer
         * @param {number} seconds - Total seconds for the session
         * @param {Function} onExpiry - Callback when timer reaches zero
         * @param {Function} onTick - Optional callback on each second (receives remaining seconds)
         */
        start: function(seconds, onExpiry, onTick) {
            stop(); // Clear any existing interval
            
            _totalSeconds = seconds;
            _secondsRemaining = seconds;
            _onExpiry = onExpiry || null;
            _onTick = onTick || null;
            
            _updateDisplay();
            _intervalId = setInterval(() => _tick(), 1000);
        },
        
        /**
         * Stop the timer
         */
        stop: function() {
            if (_intervalId) {
                clearInterval(_intervalId);
                _intervalId = null;
            }
        },
        
        /**
         * Pause the timer (alias for stop)
         */
        pause: function() {
            this.stop();
        },
        
        /**
         * Resume the timer from current remaining time
         */
        resume: function() {
            if (_intervalId) return; // Already running
            if (_secondsRemaining <= 0) return;
            
            _intervalId = setInterval(() => _tick(), 1000);
        },
        
        /**
         * Get current remaining seconds
         * @returns {number} Seconds remaining
         */
        getRemaining: function() {
            return _secondsRemaining;
        },
        
        /**
         * Get total session seconds
         * @returns {number} Total seconds
         */
        getTotal: function() {
            return _totalSeconds;
        },
        
        /**
         * Check if timer is currently running
         * @returns {boolean} True if timer is active
         */
        isRunning: function() {
            return _intervalId !== null;
        },
        
        /**
         * Manually update the display (useful after restoring state)
         * @param {number} remaining - Current seconds remaining
         * @param {number} total - Total seconds for the session
         */
        restore: function(remaining, total) {
            _secondsRemaining = remaining;
            _totalSeconds = total;
            _updateDisplay();
        },
        
        /**
         * Reset timer to initial state
         * @param {number} seconds - Total seconds for the session
         */
        reset: function(seconds) {
            stop();
            _totalSeconds = seconds;
            _secondsRemaining = seconds;
            _updateDisplay();
        }
    };
})();

// Export for module usage (if using ES modules, otherwise attach to window)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timer;
} else {
    window.Timer = Timer;
}