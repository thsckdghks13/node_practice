const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
require('dotenv').config()

app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

app.get('/', function(req, res){
    res.render('index.ejs');
});

app.get('/write', function(req, res){
    res.render('write.ejs');
});



var db;
MongoClient.connect(process.env.DB_URL, function(error, client){
     if(error) return console.log(error)

    db = client.db('todoapp')  //todoapp 데이터베이스 연결

    app.listen(process.env.PORT, function(){
        console.log('listening on 8080')
    });

    app.post('/add', function(req, res){

        var title = req.body.title
        var dating = req.body.date

        db.collection('counter').findOne({name : '게시물개수'}, function(error, result){
            const total = result.totalPost;

            db.collection('post').insertOne({_id : total + 1, 제목 : title, 날짜 : dating} , function(error, result){
                console.log('saveComplete');

                db.collection('counter').updateOne({name : '게시물개수'} , { $inc : {totalPost : 1} }, function(error, result){
                    console.log('updateCounter');
                });
                //updateOne = 하나만 < - > updateMany = 여러개
                //operator $set(변경), $inc(증가), $min(기존값보다 적을 때만 변경), $rename(key값 이름 변경)
            });


        });


        res.redirect('/list')
        // res.send('전송완료');
        
    });

    app.get('/list', function(req, res){
        
        db.collection('post').find().toArray(function(error, result){
            if(error) return console.log(error)

            res.render('list.ejs', { posts : result });
        });
    

    });


    app.get('/search', function(req, res){
        db.collection('post').find({ 제목 : req.query.value}).toArray(function(error, result){
            console.log(result)
            res.render('search.ejs', { searchD : result });
        });
    });

    
    app.delete('/delete', function(req, res){
        req.body._id = parseInt(req.body._id);
        var deletebody = req.body
        db.collection('post').deleteOne(deletebody, function(error, result){
            res.status(200).send({message : '성공!'});
            // res.status(400).send({message : '실패!'});
            console.log('삭제완료');
            db.collection('counter').updateOne({name : '게시물개수'} , { $inc : {totalPost : -1} }, function(error, result){
                console.log('updateCounter');
            });
        });
    })

    app.get('/detail/:id', function(req, res){
        db.collection('post').findOne({ _id : parseInt(req.params.id) }, function(error, result){
            if(result == null){
                res.status(400).send('게시글이 없습니다.');
            } else {
                res.render('detail.ejs', { data : result })
            }
            console.log(result)
            
            
        })
        
    });

    app.get('/edit/:id', function(req, res){
        db.collection('post').findOne({ _id : parseInt(req.params.id)}, function(error, result){
            res.render('edit.ejs', { editdata : result });
        })

    });

    app.put('/edit', function(req, res){
        db.collection('post').updateOne({ _id: parseInt(req.body.id) },{ $set : { 제목 : req.body.title, 날짜 : req.body.date}},function(error, result){
            console.log('수정완료')
            res.redirect('/list')
        })
    })
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized : false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login',function(req, res){
    res.render('login.ejs')
});

app.post('/login', passport.authenticate('local',{
    failureRedirect : '/fail'
}), function(req, res){
    res.redirect('/')
});

app.get('/mypage', login, function(req, res){
    console.log(req.user);
    res.render('mypage.ejs', {user : req.user});
});

function login(req, res, next){ //미들웨어
    if(req.user){
        next()
    } else {
        res.send('로그인 안함')
    }
}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (error, result) {
      if (error) return done(error)
  
      if (!result) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));


passport.serializeUser(function(user, done){
    done(null, user.id)
});

passport.deserializeUser(function(아이디, done){
    //DB에서 위에있는 user.id로 유저를 찾은 후 유저 정보를 뱉어냄
    db.collection('login').findOne({id : 아이디}, function(error, result){
        done(null, {result})
    })

});





// req = request '요청'
// res = response '응답'

/*
app.get('/경로', function(요청, 응답){
    응답.send('펫핑하실라우.');
});

es6 문법 
app.get('/경로', (요청, 응답) => {
    응답.send('펫핑하실라우.');
});


app.get('/pet', function(req, res){
    res.send('펫핑하실라우.');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html');
});

*/