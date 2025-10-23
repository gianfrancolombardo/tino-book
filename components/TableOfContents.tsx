import React from 'react';
import type { Book } from '../types';
import { TocIcon, CloseIcon } from './icons/Icons';

interface TableOfContentsProps {
    book: Book;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: number) => void;
    currentPage: number;
    isSpreadView: boolean;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ book, isOpen, onClose, onNavigate, currentPage, isSpreadView }) => {
    
    const isChapterActive = (startPage: number, nextChapterStartPage: number | undefined) => {
        const endPage = nextChapterStartPage ? nextChapterStartPage : Infinity;
        const rightVisiblePage = isSpreadView && currentPage > 0 ? currentPage + 1 : currentPage;
        return startPage <= rightVisiblePage && endPage > currentPage;
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
            <aside className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold font-serif flex items-center">
                        <TocIcon className="w-6 h-6 mr-3" />
                        Contents
                    </h2>
                    <button onClick={onClose} aria-label="Close table of contents" className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-6 overflow-y-auto h-[calc(100%-70px)]">
                    <h3 className="font-serif text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{book.title}</h3>
                    <ul>
                        {book.chapters.map((chapter, index) => {
                            const nextChapter = book.chapters[index+1];
                            const isActive = isChapterActive(chapter.startPage, nextChapter?.startPage);
                            return(
                                <li key={index} className="mb-2">
                                    <button
                                        onClick={() => onNavigate(chapter.startPage)}
                                        className={`w-full text-left p-2 rounded transition-colors ${
                                            isActive 
                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {chapter.title}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default TableOfContents;
