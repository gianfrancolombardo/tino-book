export interface Page {
    type: 'text' | 'image';
    content: string;
    pageNumber: number;
}

export interface RawPage {
    type: 'text' | 'image';
    content: string;
    isChapterStart?: boolean;
    chapterTitle?: string;
}

export interface Chapter {
    title: string;
    startPage: number;
}

export interface Book {
    title: string;
    chapters: Chapter[];
}