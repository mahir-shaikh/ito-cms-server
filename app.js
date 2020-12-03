const PORT = process.env.PORT || 9000;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//Upload Services
const multer = require('multer');
const jsonUploadFolder = 'uploads/json/';
const fs = require('fs');
var publicDir = require('path').join(__dirname,'/uploads'); 

// Git Operations
// Simple-git without promise 
const simpleGit = require('simple-git')();
// Shelljs package for running shell tasks optional
const shellJs = require('shelljs');
// Simple Git with Promise for handling success and failure
const simpleGitPromise = require('simple-git/promise')();

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
app.delete('/deleteJson', (req, res) => {
    let name = req.query.fileName;
    let path = jsonUploadFolder + name;
    console.log('deleting file at' + path)
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

// This api downloads a file from nodejs folder
app.get('/downloadJson', function(req, res){
    var fileName = req.query.fileName;
    const file = jsonUploadFolder + fileName;
    console.log(file)
    res.download(file); // Set disposition and send it.
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


// GIT Operations
function pushToGit(GitMessage){
    // change current directory to repo directory in local
    shellJs.cd('uploads/json/');
    //Repo name
    const repo = "ito-cmo-uploads"
    // User name and password of your GitHub
    const userName = 'mahir-shaikh';
    const password = 'ma26626hir';
    // Set up GitHub url like this so no manual entry of user pass needed
    // const gitHubUrl = `https://${userName}:${password}@github.com/${userName}/${repo}`;
    const gitHubUrl = `https://github.com/${userName}/${repo}`;
    // add local git config like username and email
    simpleGit.addConfig('user.email','mahirthebest95@gmail.com');
    simpleGit.addConfig('user.name','Mahir Shaikh');
    // Add remore repo url as origin to repo
    simpleGit.init()
        .then(() => simpleGit.addRemote('origin', gitHubUrl))
    // simpleGitPromise.addRemote('origin',gitHubUrl);
    // Add all files for commit
      simpleGitPromise.add('.')
        .then(
           (addSuccess) => {
              console.log("addsuccess", addSuccess);
           }, (failedAdd) => {
              console.log('adding files failed', failedAdd);
        }).then(()=>{
            // Commit files as Initial Commit
             simpleGitPromise.commit(GitMessage)
               .then(
                  (successCommit) => {
                    console.log("successCommit",successCommit);
                 }, (failed) => {
                    console.log('failed commmit', failed);
             });
        }).then(()=>{
            // Finally push to online repository
             simpleGitPromise.push('origin','main')
                .then((success) => {
                   console.log('repo successfully pushed', success);
                },(failed)=> {
                   console.log('repo push failed', failed);
             });
        })


    // using a promise at the end of the chain to check for failures in any task
    simpleGit.init().addRemote('origin', gitHubUrl)
    .catch(err => console.error(err));
}

app.post('/pushToGit', (req, res)=>{
    const message = req.body.message
    console.log(message)
    pushToGit(message);
    res.sendStatus(200)
})