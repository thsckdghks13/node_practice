var router = require('express').Router();

// router.use(미들웨어); //이 밑에 라우터들은 모두 이 미들웨어를 사용한다
// router.use('/', 미들웨어); //특정 url에만 적용되는 미들웨어
/*
router.get('/shirts', 미들웨어, function(req, res){
    res.send('셔츠 파는 페이지입니다.');
});
*/


router.get('/shirts', function(req, res){
    res.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', function(req, res){
    res.send('바지 파는 페이지입니다.');
});

module.exports = router;
