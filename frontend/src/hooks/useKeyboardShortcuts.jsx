import { useEffect, useCallback } from 'react';

/**
 * Custom hook for keyboard shortcuts in the Sentinel-Sea dashboard
 * 
 * Keyboard Shortcuts:
 * - Ctrl/Cmd + K: Toggle search/filter panel
 * - Ctrl/Cmd + E: Export data
 * - Ctrl/Cmd + A: Toggle analytics view
 * - Ctrl/Cmd + N: Next detection
 * - Ctrl/Cmd + P: Previous detection
 * - Escape: Close detail panels
 * - F: Toggle filters
 * - S: Focus search
 * - ?: Show help
 */
export const useKeyboardShortcuts = (handlers) => {
    const handleKeyDown = useCallback((event) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? event.metaKey : event.ctrlKey;

        // Ignore if user is typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            if (event.key === 'Escape' && handlers.onEscape) {
                event.target.blur();
                handlers.onEscape();
            }
            return;
        }

        // Ctrl/Cmd + K: Toggle search
        if (modifier && event.key === 'k') {
            event.preventDefault();
            handlers.onToggleSearch?.();
        }

        // Ctrl/Cmd + E: Export
        else if (modifier && event.key === 'e') {
            event.preventDefault();
            handlers.onExport?.();
        }

        // Ctrl/Cmd + A: Analytics
        else if (modifier && event.key === 'a') {
            event.preventDefault();
            handlers.onToggleAnalytics?.();
        }

        // Ctrl/Cmd + N: Next
        else if (modifier && event.key === 'n') {
            event.preventDefault();
            handlers.onNext?.();
        }

        // Ctrl/Cmd + P: Previous
        else if (modifier && event.key === 'p') {
            event.preventDefault();
            handlers.onPrevious?.();
        }

        // Escape: Close
        else if (event.key === 'Escape') {
            handlers.onEscape?.();
        }

        // F: Toggle filters
        else if (event.key === 'f' || event.key === 'F') {
            handlers.onToggleFilters?.();
        }

        // S: Focus search
        else if (event.key === 's' || event.key === 'S') {
            event.preventDefault();
            handlers.onFocusSearch?.();
        }

        // ?: Show help
        else if (event.key === '?') {
            handlers.onShowHelp?.();
        }

        // Arrow keys for navigation
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            handlers.onPrevious?.();
        }

        else if (event.key === 'ArrowDown') {
            event.preventDefault();
            handlers.onNext?.();
        }

    }, [handlers]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Help panel component
export const KeyboardShortcutsHelp = ({ onClose }) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? '⌘' : 'Ctrl';

    const shortcuts = [
        { key: `${modKey} + K`, description: 'Toggle search/filter panel' },
        { key: `${modKey} + E`, description: 'Export detection data' },
        { key: `${modKey} + A`, description: 'Toggle analytics dashboard' },
        { key: `${modKey} + N`, description: 'Next detection' },
        { key: `${modKey} + P`, description: 'Previous detection' },
        { key: 'F', description: 'Toggle advanced filters' },
        { key: 'S', description: 'Focus search input' },
        { key: '↑ / ↓', description: 'Navigate detections' },
        { key: 'Esc', description: 'Close panels / Clear focus' },
        { key: '?', description: 'Show this help' }
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] border border-zinc-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">Keyboard Shortcuts</h2>
                        <p className="text-sm text-zinc-500 mt-1">Navigate faster with these shortcuts</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Shortcuts List */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shortcuts.map((shortcut, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 bg-[#262626] rounded border border-zinc-800"
                            >
                                <span className="text-sm text-zinc-400">{shortcut.description}</span>
                                <kbd className="px-3 py-1.5 bg-[#1A1A1A] border border-zinc-700 rounded text-sm font-mono text-zinc-300">
                                    {shortcut.key}
                                </kbd>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800 bg-[#0F0F0F]">
                    <p className="text-xs text-zinc-500 text-center">
                        Press <kbd className="px-2 py-0.5 bg-zinc-800 rounded text-xs">?</kbd> to toggle this help panel
                    </p>
                </div>
            </div>
        </div>
    );
};
