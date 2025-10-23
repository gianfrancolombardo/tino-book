import React from 'react';
import { 
    PrevIcon, NextIcon, TocIcon, SunIcon, MoonIcon, 
    FontSizeIcon, FullscreenEnterIcon, FullscreenExitIcon 
} from './icons/Icons';

interface ControlsProps {
    currentPage: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    onTocToggle: () => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    isFullscreen: boolean;
    onFullscreenToggle: () => void;
    isSpreadView: boolean;
}

const IconButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string; disabled?: boolean }> = ({ onClick, children, 'aria-label': ariaLabel, disabled = false }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        className="p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
        {children}
    </button>
);

const Controls: React.FC<ControlsProps> = ({ currentPage, totalPages, onPrev, onNext, onTocToggle, theme, onThemeToggle, fontSize, onFontSizeChange, isFullscreen, onFullscreenToggle, isSpreadView }) => {
    
    const actualTotalPages = totalPages > 0 ? totalPages - 1 : 0;
    
    const pageDisplay = isSpreadView ?
        (currentPage === 0 ? `1 / ${actualTotalPages}` : `${currentPage}-${currentPage+1} / ${actualTotalPages}`)
        : `${currentPage} / ${actualTotalPages}`;
        
    const progress = totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0;

    return (
        <footer className="w-full bg-white dark:bg-gray-800 shadow-t-lg p-3 z-30">
            <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
                <div 
                    className="h-1 bg-blue-500 rounded-full" 
                    style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                ></div>
            </div>
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div className="w-1/3">
                    <IconButton onClick={onTocToggle} aria-label="Toggle table of contents">
                        <TocIcon className="w-6 h-6" />
                    </IconButton>
                </div>
                
                <div className="w-1/3 flex items-center justify-center space-x-4">
                    <IconButton onClick={onPrev} aria-label="Previous page" disabled={currentPage === 0}>
                        <PrevIcon className="w-6 h-6" />
                    </IconButton>
                    <span className="text-sm font-mono w-24 text-center text-gray-500 dark:text-gray-400">
                        {pageDisplay}
                    </span>
                    <IconButton onClick={onNext} aria-label="Next page" disabled={currentPage >= totalPages - (isSpreadView ? 2 : 1)}>
                        <NextIcon className="w-6 h-6" />
                    </IconButton>
                </div>

                <div className="w-1/3 flex items-center justify-end space-x-2">
                    <div className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <FontSizeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        <input
                            type="range"
                            min="12"
                            max="24"
                            step="1"
                            value={fontSize}
                            onChange={(e) => onFontSizeChange(Number(e.target.value))}
                            className="w-20"
                            aria-label="Adjust font size"
                        />
                    </div>
                    <IconButton onClick={onThemeToggle} aria-label="Toggle theme">
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </IconButton>
                    <IconButton onClick={onFullscreenToggle} aria-label="Toggle fullscreen">
                        {isFullscreen ? <FullscreenExitIcon className="w-6 h-6" /> : <FullscreenEnterIcon className="w-6 h-6" />}
                    </IconButton>
                </div>
            </div>
        </footer>
    );
};

export default Controls;
