const path = require('path');
const loginaction = require('../model/login_model');
const rootPath = path.resolve(__dirname, '..');
const registaction = require('../model/regist_model');
const updateaction = require('../model/update_model');
const deleteaction = require('../model/delete_model');
const getaction = require('../model/get_model');

module.exports.index = (req, res) => {res.sendFile(rootPath+'/views/index.html');};//首頁

module.exports.chatroom = (req, res) => { //聊天室頁面
	if(req.session.permision ==="normal"){
	//console.log(req.session.user);
		res.render('chatroom', {user: req.session.user});
	//res.sendFile(rootPath+'/view/chatroom.html');
	}
	else{
		req.session.destroy(function(){
			res.redirect('/');
		});
	}
};

module.exports.backstage = (req, res) =>{ //後台
	if(req.session.permision ==="author"){
		getaction().then((result)=>{
			res.render('member', {member: result.member});
		});
	}
	else{
		req.session.destroy(function(){
			res.redirect('/');
		});
	}
};

module.exports.update = (req, res) => { //更新使用者資料
	req.body = JSON.parse(req.body);
	const data = {
		user: req.body.user,
		pswd: req.body.pswd,
		permision: (typeof req.body.permision !== 'undefined') ?  req.body.permision : 'normal'
	};
	updateaction(data).then((result) =>{
		res.send(JSON.stringify(result))
	},(err) =>{
		res.json({
			result: err
		});
	});
};

module.exports.regist = (req, res) => { //註冊使用者
	const data ={
		user: req.body.user,
		pswd: req.body.pswd
	};
	registaction(data).then((result) => {
		req.session.user = data.user;
		req.session.permision = result.userinfo.permision;
		res.redirect('/chatroom');
	},(err) => {
		res.redirect('/');
	});
};

module.exports.login = (req, res) => { //登入
	const data={
		user: req.body.user,
		pswd: req.body.pswd
	};
	console.log('login');
	loginaction(data).then((account) =>{

		req.session.user = account.userinfo.user;
		req.session.permision = account.userinfo.permision;
		if(account.userinfo.permision === "author"){ //管理者權限
			console.log('tobackstatge');
			res.redirect('/member');
				
		}
		else{
			console.log("tochatroom");
			res.redirect('/chatroom');
				
		}
		
	},(err) => {
			/*res.json({
				err: err
			})*/
			res.redirect('/');

		});
};

module.exports.erase = (req, res) => { //移除帳號
	req.body = JSON.parse(req.body);
	const data ={
		user: req.body.user
	}
	deleteaction(data).then((result) =>{
		res.json({
			result:result
		});
		console.log(result);
	},(err) =>{
		res.json({
			result: err
		});
	});
};

module.exports.logout = (req, res)=> { //登出
	req.session.destroy(function(){
		res.redirect('/');
	});
	
};

module.exports.add = (req, res)=> {
	const data ={
		user: req.body.user,
		pswd: req.body.pswd,
		permision: req.body.permision
	};
	console.log(req.body);
	registaction(data).then((result) => {
		getaction().then((result)=>{
		res.render('member', {member: result.member});
	});			
	},(err) => {
		getaction().then((result)=>{
		res.render('member', {member: result.member});
		});
	});
}
