import React from 'react';
import type { Page as PageType } from '../types';
import Page from './Page';

interface BookViewerProps {
    pages: PageType[];
    currentPage: number;
    fontSize: number;
    isSpreadView: boolean;
}

const BookViewer: React.FC<BookViewerProps> = ({ pages, currentPage, fontSize, isSpreadView }) => {
    const totalPages = pages.length;

    if (!isSpreadView) {
        const page = pages[currentPage];
        return (
            <div className="w-full h-full flex items-center justify-center" style={{ perspective: '2000px' }}>
                <div className="relative w-full h-full max-w-[80vw] max-h-[90vh] lg:max-w-lg aspect-[1/1.4]">
                    {page && <Page 
                        key={page.pageNumber}
                        frontPage={page}
                        isFlipped={false}
                        zIndex={1}
                        fontSize={fontSize}
                        isSinglePage={true}
                    />}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex items-center justify-center" style={{ perspective: '2000px' }}>
            <div className="relative w-full h-full max-w-[80vw] max-h-[90vh] lg:max-w-6xl aspect-[2/1.4]">
                {/* This is the book cover's inside-left, always static */}
                <div className="absolute w-1/2 h-full left-0 bg-white dark:bg-gray-800 shadow-inner"></div>

                {pages.map((page, index) => {
                    // We render sheets. A sheet is represented by its front page, which is always an odd-numbered page.
                    // index 0 is the blank cover page. page 1 is at index 1.
                    // Therefore, sheets correspond to indices 1, 3, 5, ...
                    if (index === 0 || index % 2 === 0) return null;

                    const frontPage = page;
                    const backPage = pages[index + 1]; // The corresponding even page

                    // A sheet is flipped if its front page number is less than the current page on the left.
                    // currentPage is the page number on the left (e.g., 0, 2, 4...).
                    // If currentPage is 2, the sheet with front page 1 (index 1) should be flipped.
                    const isFlipped = frontPage.pageNumber < currentPage;
                    const zIndex = isFlipped ? index : totalPages - index;
                    
                    return (
                        <Page 
                            key={frontPage.pageNumber}
                            frontPage={frontPage}
                            backPage={backPage}
                            isFlipped={isFlipped}
                            zIndex={zIndex}
                            fontSize={fontSize}
                            isSinglePage={false}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default BookViewer;