/**
 * UI Navigation Module
 * 
 * Handles screen transitions, modal management, and UI helper functions.
 * Provides consistent navigation between screens and DOM manipulation utilities.
 * 
 * @module ui
 */

const UI = (function() {
    'use strict';
    
    // Screen element cache
    let _screens = {};
    
    /**
     * Cache all screen elements
     */
    function _cacheScreens() {
        const screenIds = [
            'homeScreen', 'quizScreen', 'resultsScreen', 'historyScreen',
            'guidedScreen', 'interviewSimScreen', 'interviewPackScreen',
            'voiceInterviewScreen', 'viResultsScreen', 'replayScreen',
            'subtopicScreen'
        ];
        
        screenIds.forEach(id => {
            _screens[id] = document.getElementById(id);
        });
    }
    
    /**
     * Show loading overlay
     * @param {boolean} show - Whether to show or hide
     * @param {string} text - Optional loading text
     */
    function showLoading(show, text = 'Loading…') {
        const overlay = document.getElementById('loadingOverlay');
        const textEl = document.getElementById('loadingText');
        if (!overlay) return;
        
        if (textEl) textEl.textContent = text;
        overlay.style.display = show ? 'flex' : 'none';
    }
    
    /**
     * Show a specific screen by ID
     * @param {string} screenId - ID of screen element
     */
    function showScreen(screenId) {
        // Hide all screens
        Object.values(_screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        
        // Show target screen
        if (_screens[screenId]) {
            _screens[screenId].classList.add('active');
        } else {
            const screen = document.getElementById(screenId);
            if (screen) screen.classList.add('active');
        }
        
        window.scrollTo(0, 0);
    }
    
    /**
     * Get current active screen ID
     * @returns {string|null} Current screen ID
     */
    function getCurrentScreen() {
        for (const [id, screen] of Object.entries(_screens)) {
            if (screen && screen.classList.contains('active')) {
                return id;
            }
        }
        return null;
    }
    
    // Modals management
    let _activeModal = null;
    
    /**
     * Open a modal
     * @param {string} modalId - ID of modal element
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        _activeModal = modalId;
        modal.style.display = 'flex';
    }
    
    /**
     * Close current modal
     */
    function closeModal() {
        if (_activeModal) {
            const modal = document.getElementById(_activeModal);
            if (modal) modal.style.display = 'none';
            _activeModal = null;
        }
    }
    
    /**
     * Handle modal background click to close
     * @param {Event} e - Click event
     * @param {string} modalId - Modal ID to close on background click
     */
    function handleModalBgClick(e, modalId) {
        if (e.target === document.getElementById(modalId)) {
            closeModal();
        }
    }
    
    // Toast/Notification system
    let _toastTimeout = null;
    
    /**
     * Show a temporary toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in ms (default 3000)
     */
    function showToast(message, type = 'info', duration = 3000) {
        // Create or get toast container
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        const colors = {
            success: 'var(--correct)',
            error: 'var(--wrong)',
            warning: 'var(--warn)',
            info: 'var(--accent)'
        };
        
        toast.style.cssText = `
            background: var(--surface);
            border-left: 3px solid ${colors[type] || colors.info};
            padding: 12px 20px;
            border-radius: 0;
            font-size: 12px;
            font-family: 'DM Mono', monospace;
            color: var(--text);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: fadeUp 0.2s ease;
            max-width: 300px;
        `;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    }
    
    // Confirmation dialog
    /**
     * Show a confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Function} onConfirm - Callback when confirmed
     * @param {Function} onCancel - Optional callback when cancelled
     */
    function confirm(message, onConfirm, onCancel) {
        // Use native confirm for simplicity
        if (window.confirm(message)) {
            if (onConfirm) onConfirm();
        } else {
            if (onCancel) onCancel();
        }
    }
    
    // Scroll utilities
    /**
     * Scroll to top of current screen
     */
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Scroll element into view
     * @param {HTMLElement} element - Element to scroll to
     */
    function scrollToElement(element) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Escape HTML for safe rendering
    /**
     * Escape HTML special characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // Initialize UI
    function init() {
        _cacheScreens();
    }
    
    // Public API
    return {
        init: init,
        showScreen: showScreen,
        getCurrentScreen: getCurrentScreen,
        openModal: openModal,
        closeModal: closeModal,
        handleModalBgClick: handleModalBgClick,
        showToast: showToast,
        confirm: confirm,
        scrollToTop: scrollToTop,
        scrollToElement: scrollToElement,
        escapeHtml: escapeHtml,
        showLoading: showLoading
    };
})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
} else {
    window.UI = UI;
}