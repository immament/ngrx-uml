import glob from 'glob';
import log from 'loglevel';

export const globSync = (pattern: string, options: glob.IOptions): string[] => {
    try {
        return glob.sync(pattern, options);
    } catch (error) {
        log.error('error during search files: ', pattern);
        throw error;
    }
};