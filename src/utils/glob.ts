

import glob from 'glob';

export const globSync = (pattern: string, options: glob.IOptions): string[] => {
    try {
        return glob.sync(pattern, options);
    } catch (error) {
        console.error('error during search files: ', pattern);
        throw error;
    }
}