//create web server with express
const express = require('express');
const app = express();
//create server with http
const http = require('http').Server(app);
//create socket.io
const io = require('socket.io')(http);
//create mongoose
const mongoose = require('mongoose');
//create body-parser
const bodyParser = require('body-parser');
//create cors
const cors = require('cors');
//create path
const path = require('path');
//create dotenv
require('dotenv').config();
//create port
const port = process.env.PORT || 3000;

//connect to database
mongoose.connect(process.env.DB_URI, {useNewUrlParser: true}, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to database');
    }
});

//middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

//create schema
const commentSchema = new mongoose.Schema({
    name: String,
    comment: String
});

//create model
const Comment = mongoose.model('Comment', commentSchema);

//create route
app.get('/comment', (req, res) => {
    Comment.find({}, (err, comments) => {
        res.send(comments);
    });
});

app.post('/comment', (req, res) => {
    const comment = new Comment(req.body);
    comment.save((err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Saved');
        }
    });
});

//socket.io
io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
    socket.on('add-comment', (comment) => {
        io.emit('add-comment', comment);
    });
});

//listen to port
http.listen(port, () => {
    console.log(`Listening to port ${port}`);
});