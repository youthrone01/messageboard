var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");
var session = require('express-session');
app.listen(8000, function() {
 console.log("listening on port 8000");
});

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose');

app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret: 'codingdojorocks'}));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, './static')));

var Schema = mongoose.Schema;
var PostSchema = new mongoose.Schema({
    name:{type:String, required:true, min:3},
    message:{type:String, required:true, min:10},
    comments:[{type: Schema.Types.ObjectId, ref:"Comment"}]
},{timestamps: true });

var CommentSchema = new mongoose.Schema({
    name:{type:String, required:true, minlength:3},
    content:{type:String, required:true, minlength:10},
    _post:[{type: Schema.Types.ObjectId, ref:"Post"}]
},{timestamps: true });

mongoose.model('Post',PostSchema);
mongoose.model('Comment',CommentSchema);
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

app.get('/',function(req,res){
    Post.find({})
    .populate('comments')
    .exec(function(err,posts){
        res.render('index',{posts:posts, error:null});
    })
});

app.post('/posts',function(req,res){
    var post = new Post(req.body);
    post.save(function(err){
        if(err){
            console.log("Can not save this post!");
            console.log(err);
            res.redirect('/');
        }else{
            res.redirect('/');
        }
    })
});

app.post('/posts/:id',function(req,res){
    Post.findOne({_id: req.params.id}, function(err, post){
        var comment = new Comment(req.body);
        comment._post = post._id;
        post.comments.push(comment);
        comment.save(function(err){
            if(err){
                console.log("Can not save this comment!");
                console.log(err);
                res.redirect('/');
            }else{
                post.save(function(err){
                    if(err){
                        console.log("Can not add this comment!");
                        console.log(err);
                        res.redirect('/');
                    }else{
                        res.redirect('/');
                    }
                });
            }
        })
    });
})

