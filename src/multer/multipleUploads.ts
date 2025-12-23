import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        console.log(' Multer: destination called for file:', file.originalname);
        cb(null, 'uploads/products')
    },
    filename(req, file, cb) {
        const id = uuidv4()
        const extension = file.originalname.split('.').pop()
        const filename = `${id}.${extension}`
        console.log(' Multer: generating filename:', filename);
        cb(null, filename)
    }
})

export const uploadMultipleFiles = multer({ storage }).array('files', 10)