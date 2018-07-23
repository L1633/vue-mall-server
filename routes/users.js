var express = require('express');
var router = express.Router();
var UserModel = require('./../models/user'); 

// 极验
var Geetest = require('gt3-sdk');
var captcha = new Geetest({
    geetest_id: '9af3aa9e204402036ff03ca65b64621a', // 将xxx替换为您申请的 id
    geetest_key: '7b1bf04abf1a550c16becb0afd086c2d' // 将xxx替换为您申请的 key
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 普通登录功能
// router.post('/login',(req,res,next)=>{
// 	var param = {
//       userEmail:req.body.email,
//       userPwd:req.body.password,
//   	}
//  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
// 	UserModel.findOne(param,(err,user)=>{
// 		if(user){
// 			// 生成一个cookie(userid: user._id), 并交给浏览器保存
//       		res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
// 			res.send({status_code: 0, msg:''});
// 		}else{
// 			// 返回提示错误的信息
//       		res.send({code: 1, msg: '用户名或者密码错误'})
// 		}
// 	})
// })

// 极验
router.get("/gt", function (req, res) {
    // 向极验申请每次验证所需的challenge
    captcha.register({
        client_type: 'unknown',
        ip_address: 'unknown'
    }, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }

        if (!data.success) {
            // 进入 failback，如果一直进入此模式，请检查服务器到极验服务器是否可访问
            // 可以通过修改 hosts 把极验服务器 api.geetest.com 指到不可访问的地址

            // 为以防万一，你可以选择以下两种方式之一：

            // 1. 继续使用极验提供的failback备用方案
            // req.session.fallback = true;
            console.log('错误');
            res.send(data);

            // 2. 使用自己提供的备用方案
            // todo

        } else {
            // 正常模式
            // req.session.fallback = false;
            res.send(data);
        }
    });
});


// 极验登录
router.post("/login",  (req,res,next) =>{
    console.log(req.body.geetest_challenge,'上传的参数');
    var param = {
      userEmail:req.body.email,
      userPwd:req.body.password,
  	}
	UserModel.findOne(param,(err,user)=>{
		if(user){
		    // 对form表单提供的验证凭证进行验证
		    captcha.validate(false, {
		        geetest_challenge: req.body.geetest_challenge,
		        geetest_validate: req.body.geetest_validate,
		        geetest_seccode: req.body.geetest_seccode

		    }, (err, success)=> {

		        if (err) {
		            // 网络错误
		            res.send(err);

		        } else if (!success) {

		            // 二次验证失败
		            res.send("<h1 style='text-align: center'>登录失败</h1>");

		        } else {
		        	// 生成一个cookie(userid: user._id), 并交给浏览器保存
		        	// res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
					res.send({status_code: 0, msg:''});
		            // res.send("<h1 style='text-align: center'>登录成功</h1>");
		        }
		    });
		}else{
			// 返回提示错误的信息
      		res.send({code: 1, msg: '用户名或者密码错误'})
		}
	})

});


// 注册功能
router.post('/register',(req,res,next)=>{
	var param = {
      userName:req.body.name,
      userEmail:req.body.email,
      userPwd:req.body.password,
  	}
  	console.log(param,"接收数据");
  	// 数据库查询是否存在相同的用户名
  	// 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
    // 查询(根据username)
  	UserModel.findOne({ userEmail:req.body.email, },(err, user)=>{
  		console.log(user,"数据库的数据");
  		// 如果user有值(已存在)
  		if(user){
  			// 返回提示错误的信息
      		res.send({code: 1, msg: '此用户已存在'})
  		}else{
  			new UserModel(param).save((err,user)=>{
		        // 生成一个cookie(userid: user._id), 并交给浏览器保存
		        res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
		        // 返回包含user的json数据
		        const data = { userName:req.body.name, _id: user._id} // 响应数据中不要携带password
		        res.send({code: 0, msg:'', data});
  			})
  		}
  	})
})

// 登出功能
router.post('/logout',(req,res,next)=>{

})



module.exports = router;
