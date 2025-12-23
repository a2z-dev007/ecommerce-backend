// Quick test script to verify multer setup
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        console.log('✓ Multer: destination called for file:', file.originalname);
        cb(null, 'uploads/products')
    },
    filename(req, file, cb) {
        const id = uuidv4()
        const extension = file.originalname.split('.').pop()
        const filename = `${id}.${extension}`
        console.log('✓ Multer: generating filename:', filename);
        cb(null, filename)
    }
});

const uploadMultipleFiles = multer({ storage }).array('files', 10);

app.post('/test-upload', uploadMultipleFiles, (req, res) => {
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    res.json({
        success: true,
        filesCount: req.files ? req.files.length : 0,
        files: req.files
    });
});

app.listen(9000, () => {
    console.log('Test server running on http://localhost:9000');
    console.log('Test with: curl -F "files=@image1.jpg" -F "files=@image2.jpg" http://localhost:9000/test-upload');
});
