import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Map Style Switcher - Toggle between Dark, Satellite, and Terrain views
 */
const MapStyleSwitcher = ({ currentStyle, onStyleChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const styles = [
        {
            id: 'dark',
            name: 'Dark',
            icon: '🌙',
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        },
        {
            id: 'satellite',
            name: 'Satellite',
            icon: '🛰️',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        },
        {
            id: 'terrain',
            name: 'Terrain',
            icon: '🗺️',
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        },
        {
            id: 'light',
            name: 'Light',
            icon: '☀️',
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        }
    ];

    const currentStyleObj = styles.find(s => s.id === currentStyle) || styles[0];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white hover:bg-zinc-100 text-zinc-800 px-3 py-2 rounded shadow-lg border border-zinc-300 font-semibold text-sm transition-colors flex items-center gap-2"
                title="Change map style"
            >
                <span>{currentStyleObj.icon}</span>
                <span>{currentStyleObj.name}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>

                    {/* Dropdown */}
                    <div className="absolute top-full mt-2 left-0 bg-white border border-zinc-300 rounded shadow-2xl z-20 overflow-hidden min-w-[140px]">
                        {styles.map(style => (
                            <button
                                key={style.id}
                                onClick={() => {
                                    onStyleChange(style.id, style.url);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 ${style.id === currentStyle
                                        ? 'bg-orange-500 text-white font-semibold'
                                        : 'text-zinc-700 hover:bg-zinc-100'
                                    }`}
                            >
                                <span>{style.icon}</span>
                                <span>{style.name}</span>
                                {style.id === currentStyle && (
                                    <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MapStyleSwitcher;
