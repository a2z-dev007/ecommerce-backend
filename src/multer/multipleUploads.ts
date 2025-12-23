import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/products')
    },
    filename(req, file, cb) {
        const id = uuidv4()
        const extension = file.originalname.split('.').pop()
        const filename = `${id}.${extension}`
        cb(null, filename)
    }
})

export const uploadMultipleFiles = multer({ storage }).array('files', 10)