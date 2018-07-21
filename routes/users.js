var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登录功能
router.post('/login',(req,res,next)=>{
	var param = {
      userName:req.body.name,
      userPwd:req.body.password,
  	}
	res.json({
		status:"1",
        msg:"测试数据"
	})
})

// 注册功能
router.post('/register',(req,res,next)=>{
	var param = {
      userName:req.body.name,
      userEmail:req.body.email,
      userPwd:req.body.password,
  	}
	res.json({
		status:"1",
        msg:"注册功能"
	})
})





module.exports = router;
