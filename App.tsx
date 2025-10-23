import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useBookParser } from './hooks/useBookParser';
import { useKeyPress } from './hooks/useKeyPress';
import { useWindowSize } from './hooks/useWindowSize';
import type { Book, Page as PageType } from './types';
import BookViewer from './components/BookViewer';
import TableOfContents from './components/TableOfContents';
import Controls from './components/Controls';
import { LoadingIcon } from './components/icons/Icons';

const markdownToHtml = (text: string): string => {
    const lines = text.split('\n');
    let html = '';
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
        if (currentParagraph.length > 0) {
            let paragraphText = currentParagraph.join(' ');
            paragraphText = paragraphText.replace(/\*(.*?)\*/g, '<em>$1</em>');
            html += `<p class="mb-4">${paragraphText}</p>`;
            currentParagraph = [];
        }
    };

    lines.forEach((line) => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            flushParagraph();
            return;
        }
        
        if (trimmedLine.startsWith('# ')) {
            flushParagraph();
            html += `<h1 class="text-3xl md:text-4xl font-bold font-serif text-center my-8">${trimmedLine.substring(2)}</h1>`;
        } else if (trimmedLine.startsWith('## ')) {
            flushParagraph();
            html += `<h2 class="text-2xl md:text-3xl font-bold font-serif mt-8 mb-4">${trimmedLine.substring(3)}</h2>`;
        } else {
            currentParagraph.push(trimmedLine);
        }
    });

    flushParagraph();
    return html;
};


const App: React.FC = () => {
    const { book: initialBook, rawPages, loading, error } = useBookParser('/book.md');
    const [book, setBook] = useState<Book | null>(null);
    const [pages, setPages] = useState<PageType[]>([]);
    const [paginating, setPaginating] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);
    const [isTocOpen, setIsTocOpen] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [fontSize, setFontSize] = useState(16);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const { width } = useWindowSize();
    const isSpreadView = useMemo(() => width >= 1024, [width]);

    const pageIncrement = isSpreadView ? 2 : 1;

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        const paginate = () => {
            if (loading || !rawPages.length || !initialBook) return;

            setPaginating(true);
            
            const measureRoot = document.createElement('div');
            measureRoot.style.position = 'fixed';
            measureRoot.style.left = '-9999px';
            measureRoot.style.top = '0';
            measureRoot.style.visibility = 'hidden';
            measureRoot.style.pointerEvents = 'none';

            const viewerWidth = Math.min(width * 0.8, 1152);
            const viewerHeight = viewerWidth / 2 * 1.4;
            const pageContentWidth = (viewerWidth / 2) - (width >= 768 ? 96 : 64);
            const pageContentHeight = viewerHeight - (width >= 768 ? 96 : 64);
            
            const measureDiv = document.createElement('div');
            measureDiv.className = 'dark:text-gray-100'; // Match theme for accurate font rendering
            measureDiv.style.width = `${pageContentWidth}px`;
            measureDiv.style.height = `${pageContentHeight}px`;
            measureDiv.style.fontSize = `${fontSize}px`;
            measureDiv.style.lineHeight = '1.7';
            measureDiv.style.fontFamily = 'Georgia, serif';

            measureRoot.appendChild(measureDiv);
            document.body.appendChild(measureRoot);

            const finalPages: PageType[] = [];
            const updatedChapters = JSON.parse(JSON.stringify(initialBook.chapters));
            
            for (const rawPage of rawPages) {
                if (rawPage.type === 'image') {
                    finalPages.push({
                        type: 'image',
                        content: rawPage.content,
                        pageNumber: 0 // placeholder
                    });
                    continue;
                }
                
                if (rawPage.isChapterStart) {
                    const chapter = updatedChapters.find((c: { title: string; }) => c.title === rawPage.chapterTitle);
                    if (chapter) {
                        // +1 to account for the blank cover page to be added
                        chapter.startPage = finalPages.length + 1;
                    }
                }

                // Check if the whole raw page fits
                measureDiv.innerHTML = markdownToHtml(rawPage.content);
                if (measureDiv.scrollHeight <= measureDiv.clientHeight) {
                    finalPages.push({ type: 'text', content: rawPage.content, pageNumber: 0 });
                    continue;
                }
                
                // If not, split it line by line
                const lines = rawPage.content.split('\n');
                let currentPageLines: string[] = [];

                for (const line of lines) {
                    const testLines = [...currentPageLines, line];
                    measureDiv.innerHTML = markdownToHtml(testLines.join('\n'));

                    if (measureDiv.scrollHeight > measureDiv.clientHeight && currentPageLines.length > 0) {
                        finalPages.push({
                            type: 'text',
                            content: currentPageLines.join('\n'),
                            pageNumber: 0,
                        });
                        currentPageLines = line.trim() === '' ? [] : [line];
                    } else {
                        currentPageLines.push(line);
                    }
                }
                
                if (currentPageLines.length > 0 && currentPageLines.some(l => l.trim() !== '')) {
                    finalPages.push({
                        type: 'text',
                        content: currentPageLines.join('\n'),
                        pageNumber: 0
                    });
                }
            }

            document.body.removeChild(measureRoot);
            
            finalPages.forEach((p, i) => p.pageNumber = i + 1);

            const bookWithCover: PageType[] = [
                { type: 'text', content: '', pageNumber: 0 }, // Blank cover page
                ...finalPages
            ];

            setPages(bookWithCover);
            setBook({ ...initialBook, chapters: updatedChapters });
            setPaginating(false);
        }

        const timeoutId = setTimeout(paginate, 100);
        return () => clearTimeout(timeoutId);

    }, [rawPages, initialBook, fontSize, width, loading]);

    const totalPages = pages.length;

    const goToNextPage = useCallback(() => {
        setCurrentPage(prev => Math.min(prev + pageIncrement, totalPages > 0 ? totalPages - 1 : 0));
    }, [pageIncrement, totalPages]);

    const goToPrevPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - pageIncrement, 0));
    }, [pageIncrement]);

    useKeyPress('ArrowRight', goToNextPage);
    useKeyPress('ArrowLeft', goToPrevPage);

    const goToPage = (pageNumber: number) => {
        let targetPage = pageNumber;
        if (isSpreadView && targetPage > 0 && targetPage % 2 !== 0) {
            targetPage -= 1;
        }
        setCurrentPage(Math.max(0, targetPage));
        setIsTocOpen(false);
    };

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    if (loading || paginating) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-700 dark:text-gray-300">
                <LoadingIcon className="w-12 h-12 animate-spin mr-4" />
                <span className="text-2xl font-serif">{loading ? 'Loading book...' : 'Paginating...'}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                <p>Error loading book: {error}</p>
            </div>
        );
    }
    
    if (!book) return null;

    return (
        <div className="w-full h-screen flex flex-col antialiased text-gray-900 dark:text-gray-100 overflow-hidden">
            <TableOfContents 
                book={book} 
                isOpen={isTocOpen} 
                onClose={() => setIsTocOpen(false)} 
                onNavigate={goToPage}
                currentPage={currentPage}
                isSpreadView={isSpreadView}
            />
            <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
                 <BookViewer 
                    pages={pages} 
                    currentPage={currentPage} 
                    fontSize={fontSize} 
                    isSpreadView={isSpreadView}
                />
            </main>
            <Controls
                currentPage={currentPage}
                totalPages={totalPages}
                onNext={goToNextPage}
                onPrev={goToPrevPage}
                onTocToggle={() => setIsTocOpen(prev => !prev)}
                theme={theme}
                onThemeToggle={toggleTheme}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                isFullscreen={isFullscreen}
                onFullscreenToggle={toggleFullscreen}
                isSpreadView={isSpreadView}
            />
        </div>
    );
};

export default App;
