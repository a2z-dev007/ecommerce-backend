import DataUriParser from "datauri/parser";
import path from "path";

const getDataUrl = (file: Express.Multer.File) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString().toLowerCase();

    return parser.format(extName, file.buffer);
}

export default getDataUrl;
