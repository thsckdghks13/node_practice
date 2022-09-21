const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');


var db;
MongoClient.connect('mongodb+srv://gto159:asd123@cluster0.tkjf8is.mongodb.net/?retryWrites=true&w=majority', function(error, client){
     if(error) return console.log(error)

    db = client.db('todoapp')  //todoapp 데이터베이스 연결

    app.listen(8080, function(){
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


        
        res.send('전송완료');
        return 
    });

    app.get('/list', function(req, res){
        
        db.collection('post').find().toArray(function(error, result){
            if(error) return console.log(error)

            res.render('list.ejs', { posts : result });
        });
    

    });

    app.delete('/delete', function(req, res){
        req.body._id = parseInt(req.body._id);
        var deletebody = req.body
        db.collection('post').deleteOne(deletebody, function(error, result){
            res.status(200).send({message : '성공!'});
            // res.status(400).send({message : '실패!'});
            console.log('삭제완료');
        });
    })

});



/*

*/

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
*/

app.get('/pet', function(req, res){
    res.send('펫핑하실라우.');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html');
});

