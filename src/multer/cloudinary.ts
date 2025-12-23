import multer from 'multer';


const storage = multer.memoryStorage();

export const uploadCloudSingle = multer({ storage }).single('file');
export const uploadCloudMultiple = multer({ storage }).array('files', 10);