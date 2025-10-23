import React from 'react';
import type { Page as PageType } from '../types';

const markdownToHtml = (text: string): string => {
    if (!text) return '';
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

const MarkdownRenderer: React.FC<{ text: string }> = ({ text = '' }) => {
    const html = markdownToHtml(text);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// This renders the content for one side of a sheet
const PageSideContent: React.FC<{ page?: PageType, fontSize: number }> = ({ page, fontSize }) => {
    if (!page) {
        return <div className="absolute inset-0 bg-white dark:bg-gray-800 shadow-lg" />;
    }
    return (
        <div className="absolute inset-0 p-8 md:p-12 overflow-hidden bg-white dark:bg-gray-800 shadow-lg flex flex-col">
            <div className="flex-grow flex flex-col justify-center" style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}>
                {page.type === 'image' ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <img src={page.content} alt={`Illustration for page ${page.pageNumber}`} className="max-w-full max-h-full object-contain" />
                    </div>
                ) : (
                    <MarkdownRenderer text={page.content} />
                )}
            </div>
            <div className="text-center text-sm text-gray-400 dark:text-gray-500 pt-4">
                {page.pageNumber > 0 && page.pageNumber}
            </div>
        </div>
    );
};

// This component now represents a single sheet of paper that flips
interface PageProps {
    frontPage: PageType;
    backPage?: PageType;
    isFlipped: boolean;
    zIndex: number;
    fontSize: number;
    isSinglePage: boolean;
}

const Page: React.FC<PageProps> = ({ frontPage, backPage, isFlipped, zIndex, fontSize, isSinglePage }) => {
    
    // Mobile / single page view
    if (isSinglePage) {
        return (
            <div className="absolute w-full h-full shadow-2xl">
                <PageSideContent page={frontPage} fontSize={fontSize} />
            </div>
        )
    }

    // Spread view (a flippable sheet)
    const transform = isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)';
        
    return (
        <div
            className="absolute w-1/2 h-full transition-transform duration-700 ease-in-out"
            style={{
                left: '50%',
                transformOrigin: 'left',
                transform,
                transformStyle: 'preserve-3d',
                zIndex,
            }}
        >
            {/* Front of the sheet (e.g., page 1, 3, 5...) */}
            <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                 <PageSideContent page={frontPage} fontSize={fontSize} />
            </div>
            {/* Back of the sheet (e.g., page 2, 4, 6...) */}
            <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <PageSideContent page={backPage} fontSize={fontSize} />
            </div>
        </div>
    );
};

export default Page;