/*
 * @Author: zhoudagua
 * @Date: 2018-05-12 18:54:02
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2019-03-06 16:53:53
 * @Description: 请添加描述
 */
// const api = 'https://ktv.yoqee.com'; //  测试地址
const api = "https://ktv.91kcapp.com"; //  线上地址
const secret = "c4fc9067d07349da83c4536db33b90t5"; //MD5密钥
const md5 = require('md5.js');
let wslist = []; //WS接收到的参数

/**
 * @description: 通用跳转方法 可以但没必要因为不能带事件
 * @param        {[type]} url            [description]  跳转路径
 */
function navigation(url) {
	wx.navigateTo({
		url: url
	});
}

/**
 * @description: 通用loading
 * @param        {[type]} url            [description]  跳转路径
 */
function getLoading() {
	return new Promise(resolve => {
		wx.showLoading({
			title: "loading...",
			mask: true,
			success: () => {
				resolve();
			}
		});
	});
}

/**
 * @description: 通用http请求
 * @param        {[type]} url            [description]  接口请求地址
 * @param        {[type]} data           [description]  参数传进来是个对象（包括歌单type; 全局声明的空对象; 以及签名和时间戳）
 * @param        {[type]} callBack       [description]  回调函数
 */
function httpRequest(url, data, method, token, cb) {
	const reparam = {
		url: api + url,
		data: data,
		method: method,
		header: token ?
			{
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: token
			} :
			{
				"Content-Type": "application/x-www-form-urlencoded"
			},
		success: res => {
			if (res.data.status_code == "200") cb(res.data);
			else cb(res.data.status_code);
		}
	};

	wx.request(reparam);
}

/**
 * @name: 滑动加载下一页
 * @param {type}
 * @description:    用户上拉滑动加载下一页
 */
function getNextPageData(
	totalData,
	currentPage,
	statusData,
	currentData,
	listData
) {
	const totalPage = Math.ceil(totalData / 20);
	if (totalPage == 0) {
		statusData.isLoading = false;
		statusData.isEnd = false;
		statusData.isEmpty = true;
	} else if (totalPage == currentPage) {
		statusData.isLoading = false;
		statusData.isEnd = true;
		statusData.isEmpty = false;
	}
	currentData.map(item => {
		listData.push(item);
	});
	return {
		totalPage: totalPage,
		statusData: statusData,
		listData: listData
	};
}

/**
 * @description     通用操作歌曲回调信息提示
 */
function operatingSongCBInfo(code) {
	let msg = "";
	switch (code) {
		case "200":
			msg = "操作成功！";
			break;
		case "1002":
			msg = "房间状态异常，请重新连接房间！";
			break;
		case "1010":
			msg = "该歌曲已被收藏，请勿重复操作！";
			break;
		case "1012":
			msg = "操作失败，请输入房间号重新连接或联系服务员！";
			break;
		case "1013":
			msg = "很遗憾，当前暂无历史账单";
			break;
		case "1031":
			msg = "请勿重复下单！";
			break;
		case "1088":
			msg = "已关闭房间连接！";
			break;
		default:
			break;
	}
	return new Promise(resolve => {
		wx.showToast({
			title: msg == "" ? "请先连接房间！" : msg,
			icon: "none",
			duration: 1000,
			success: function () {
				setTimeout(() => {
					resolve(code);
				}, 1000);
			}
		});
	});
}

/**
 * @description 刷新当前页
 */

function refreshMyself() {
	let pages = getCurrentPages() //获取页面数组 
	let curPage = pages[pages.length - 1] //获取当前页 
	console.log("刷新页面")
	curPage.onShow() //手动调用生命周期函数
}

/**
 * @description 同步或异步存储
 */
function putStorage(obj, sync) {
	for (let i in obj) {
		if (sync) {
			wx.setStorageSync(i, obj[i]);
		} else {
			wx.setStorage({
				key: i,
				data: obj[i]
			});
		}
	}
}

/**
 * @description 获取和更新token
 */

function updateToken(openid) {
	//	util.secret为密钥;value为openid;signature为签名
	const timestamp = new Date().getTime();
	const tempSource = 'openid=' + openid + '&timestamp=' + timestamp;
	const signature = md5.hexMD5(secret + tempSource);
	httpRequest('/client/getToken', {
		openid: openid,
		timestamp: timestamp,
		signature: signature
	}, 'GET', '', function (data) {
		var token1 = data.data.token;
		var status1 = data.data.status;
		//更新token和statu  
		putStorage({
			token: token1
		}, true);
		putStorage({
			status: status1
		}, true);
	})

	httpRequest('/client/getUploadToken', {
		openid: openid,
		timestamp: timestamp,
		signature: signature
	}, 'POST', '', data => {
		if (data.status_code == '200') {
			putStorage({
				qiniutoken: data.data.token
			}, true);
		}
	})

};

/**
 * @description websocket连接服务器
 */

function connWs(uids, timestamps, signatures) {
	wx.connectSocket({
		url: 'wss://ws.91kcapp.com/connection.ws' + '?uid=' + uids + '&timestamp=' + timestamps + '&signature=' + signatures,
		header: {
			'content-type': 'application/x-www-form-urlencoded' // 默认值
		},
		method: "GET",
		success(res) {
			console.log('连接成功！', res);
		},
		fail(res) {
			console.log('连接失败！', res);
		},
	})
}
/**
 * @description 监听WS状态
 */
function openSocket(uids, timestamps, signatures) {
	// 打开信道
	connWs(uids, timestamps, signatures);
	//打开时的动作
	wx.onSocketOpen(() => {
		console.log('WebSocket 已连接');
	})
	//断开时的动作
	wx.onSocketClose((data) => {

		if (data.code == 1006) {
			console.log('WebSocket 已断开', data.code)
			connWs(uids, timestamps, signatures);
		} else if (data.code == 1000) {
			console.log('WebSocket 已断开', data.code)
		} else {
			console.log('WebSocket 已断开', data.code)
			connWs(uids, timestamps, signatures);
		}

	})
	//报错时的动作
	wx.onSocketError(error => {
		console.log('socket error:', error)
		connWs(uids, timestamps, signatures);

	})
};

/**
 * @description 根据房间码连接房间
 */

function connRoom(code, that, cb) {
	var token = wx.getStorageSync('token');
	getLoading().then(() => {
		httpRequest('/client/conn', {
			connid: code
		}, 'POST', token, data => {
			console.log('是否连接房间', data);
			wx.hideLoading();
			if (data.status_code == 200) {
				wx.showToast({
					title: '已成功连接房间，开始欢唱吧！',
					icon: 'none',
					duration: 3000,
					success: () => {
						putStorage({
							uid: code
						}, true);
						putStorage({
							status: '2'
						}, true);
						putStorage({
							token: data.data.token
						}, false);
						//uuid用户唯一标识符
						putStorage({
							uuid: data.data.uid
						}, true);
						if (!that) {} else {
							that.setData({
								isConnect: true,
								isClicked: true
							})
						}
						cb(data) //回调函数
					}
				})
				var uids = data.data.uid
				const timestamps = new Date().getTime();
				const tempSource = 'timestamp=' + timestamps + '&uid=' + uids;
				const signatures = md5.hexMD5(secret + tempSource);
				putStorage({
					timestamps: timestamps
				}, true);
				putStorage({
					signatures: signatures
				}, true);
				putStorage({
					uids: uids
				}, true);
				openSocket(uids, timestamps, signatures) //连接ws
			} else {
				operatingSongCBInfo(data.status_code);
				wx.showToast({
					title: '无效连接！请联系服务员！',
					icon: 'none',
					duration: 1500,
					success: () => {
						if (!that) {} else {
							that.setData({
								isConnect: false,
								isClicked: false,
							})
						}

					}
				})
			}
		})
	})
};
//	狠心断开房间连接
function cutRoom(cb) {
	wx.showModal({
		title: '温馨提醒',
		content: '确定要退出欢唱了吗？',
		showCancel: true,
		cancelText: '再用用吧',
		confirmText: '狠心退出',
		confirmColor: '#c324ff',
		success: res => {
			if (res.confirm) {
				this.getLoading().then(() => {
					this.cutRoom_link(cb)
				})
			}
		}
	})
}
//  直接断开房间连接

function cutRoom_link(cb) {
	var token = wx.getStorageSync('token');
	var openid = wx.getStorageSync('openid');
	this.httpRequest('/client/disConn', {}, 'GET', token, data => {
		console.log(data)
		wx.hideLoading();
		this.updateToken(openid);
		//	断开房间失败
		if (typeof data === 'string') {
			this.operatingSongCBInfo(data);
			return
		}
		//	断开房间连接后，原来的token失效，需要更新临时token
		//	code == '1088'为断开房间成功
		this.operatingSongCBInfo('1088').then(() => {
			this.updateToken(openid);
			wx.closeSocket()
			cb(true)
		})
	})
}

module.exports = {
	secret: secret,
	navigation: navigation,
	httpRequest: httpRequest,
	getLoading: getLoading,
	operatingSongCBInfo: operatingSongCBInfo,
	putStorage: putStorage,
	getNextPageData: getNextPageData,
	updateToken: updateToken,
	connRoom: connRoom,
	wslist: wslist,
	cutRoom: cutRoom,
	cutRoom_link: cutRoom_link,
	refreshMyself: refreshMyself,
	openSocket: openSocket
};