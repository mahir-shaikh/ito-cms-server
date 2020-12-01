const PORT = process.env.PORT || 9000;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//Upload Services
const multer = require('multer');
const jsonUploadFolder = 'uploads/json/';
const fs = require('fs');
var publicDir = require('path').join(__dirname,'/uploads'); 


const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(publicDir)); 


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

app.get("/", (req, res) => {
    res.send(
        "<h1 style='text-align:center'>Lets do this!!!</h1>"
    );
})

//Upload Services
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, jsonUploadFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

let upload = multer({
    storage: storage
});

// let upload = multer({dest: imageUploadFolder})

fs.readdir(jsonUploadFolder, (err, files) => {
  files.forEach(file => {
    console.log(file);
  });
});

// POST File
// This method stores file in nodejs folder
app.post('/uploadJson', upload.array('files'), function (req, res) {
    const files = req.files;
    console.log(files)
    if (!files) {
        console.log("No file is available!");
        return res.send({
            success: false,
            message: "No file selected"
        });

    } else {
        console.log('File is available!');
        return res.send({
            success: true,
            message: "File uploaded successfully",
            data: files
        })
    }
});


// This method deletes file from nodejs folder
app.post('/deleteJson', (req, res) => {
    let path = req.body.path
    fs.unlink(path, (err)=>{
        if(err){
            res.send({
                success: false,
                message: "Unable to delete file",
                error: err
            })
            return
        }

        res.send({
            success: true,
            message: "File deleted successfully"
        })
    })
});

//This method will get all images from nodejs folder
app.get('/getAllJson',(req, res)=>{
    console.log("Inside Get All Json API")
    fs.readdir(jsonUploadFolder, (err, files) => {
        console.log("Files:", files)
        res.send(files)
    });
})

app.use('/uploads', express.static('uploads'));


//JSON CRUD Operations

// helper methods
function readFile(callback, filePath = dataPath, returnJson = false, encoding = 'utf8'){
    fs.readFile(filePath, encoding, (err, data) => {
        if (err) {
            throw err;
        }

        callback(returnJson ? JSON.parse(data) : data);
    });
};

function writeFile(fileData, filePath = dataPath, callback, encoding = 'utf8'){
    fs.writeFile(filePath, fileData, encoding, (err) => {
        if (err) {
            throw err;
        }
        callback();
    });
};

// READ
app.get('/getJson', (req, res) => {
    var file = jsonUploadFolder + req.query.fileName;
    console.log(file);
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            throw err;
        }
        console.log("here")
        res.send(data);
    });
});
//WRITE
app.post('/postJson', (req, res) => {
    const data = req.body.data
    const file = jsonUploadFolder + req.body.fileName
    writeFile(JSON.stringify(data, null, 2), file ,(x) => {
        res.send({
            success: true,
            message: "JSON updated successfully"
        })
    });
});