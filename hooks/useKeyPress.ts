import { useEffect } from 'react';

export const useKeyPress = (targetKey: string, callback: () => void) => {
    useEffect(() => {
        const keyPressHandler = (event: KeyboardEvent) => {
            if (event.key === targetKey) {
                callback();
            }
        };

        window.addEventListener('keydown', keyPressHandler);
        return () => {
            window.removeEventListener('keydown', keyPressHandler);
        };
    }, [targetKey, callback]);
};