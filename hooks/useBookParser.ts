import { useState, useEffect } from 'react';
import type { Book, RawPage } from '../types';

export const useBookParser = (filePath: string) => {
    const [book, setBook] = useState<Book | null>(null);
    const [rawPages, setRawPages] = useState<RawPage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const parseMarkdown = (markdown: string) => {
            const parsedBook: Book = { title: 'Untitled Book', chapters: [] };
            const parsedRawPages: RawPage[] = [];
            
            // Use '---' as a hard page break delimiter
            const rawPageBlocks = markdown.split(/\n---\n/);
            
            const imageRegex = /^\s*\!\[.*?\]\((.*?)\)\s*$/;
            let titleFound = false;

            for (const block of rawPageBlocks) {
                const content = block.trim();
                if (!content) continue;

                const imageMatch = content.match(imageRegex);
                if (imageMatch) {
                    let imagePath = imageMatch[1].trim();
                    // Ensure the path is absolute from the public root
                    if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
                        imagePath = `/${imagePath}`;
                    }
                    parsedRawPages.push({ type: 'image', content: imagePath });
                    continue; 
                }

                const firstLine = content.split('\n')[0].trim();
                let isChapterStart = false;
                let chapterTitle: string | undefined;
                
                if (firstLine.startsWith('# ') && !titleFound) {
                    parsedBook.title = firstLine.substring(2).trim();
                    titleFound = true;
                } else if (firstLine.startsWith('## ')) {
                    isChapterStart = true;
                    chapterTitle = firstLine.substring(3).trim();
                    parsedBook.chapters.push({ title: chapterTitle, startPage: 0 }); // Placeholder page
                }
                
                parsedRawPages.push({
                    type: 'text',
                    content,
                    isChapterStart,
                    chapterTitle,
                });
            }

            setBook(parsedBook);
            setRawPages(parsedRawPages);
        };

        const fetchBook = async () => {
            try {
                setLoading(true);
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const markdown = await response.text();
                parseMarkdown(markdown);
            } catch (e: any) {
                setError(e.message);
                console.error("Failed to fetch or parse book:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filePath]);

    return { book, rawPages, loading, error };
};