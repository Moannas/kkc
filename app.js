/*
 * @Author: zhoudagua 
 * @Date: 2018-05-12 18:54:35 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2019-02-27 17:11:22
 * @Description: 请添加描述 
 */
const util = require('utils/util.js');
const md5 = require('utils/md5.js');

App({
	//	获取用户openid以及token，并设置为全局调用
	onLaunch(options) {
		new Promise(resolve => {
			wx.login({
				success: res => {
					util.httpRequest('/client/openid', {
						code: res.code
					}, 'GET', '', data => {
						util.putStorage({ 'openid': data.data.openid }, true);
						this.globalData.openid = data.data.openid;
						resolve(data.data.openid);
					})
				}
			})
		}).then(value => {
			this.updateToken(value);
			var openid = wx.getStorageSync('openid');
			util.updateToken(openid, {
			})
			//获取场景值
			if (options.scene === 1047) {
				var code = options.query.scene;
				util.putStorage({ 'uid': code }, true)
				util.connRoom(code, false, data => {
				})
			}
		})
	},
	/**
	 * @监听器watch
	 * 参数一：method回调的方法
	 * 参数二：isstr监听的值
	*/
	watch: function (method, isstr) {
		var obj = this.globalData;
		Object.defineProperty(obj, isstr, {
			configurable: true,
			enumerable: true,
			set: function (value) {
				this._consumerGoodsStatus = value; //_consumerGoodsStatus是Object.defineProperty自定义的属性
				method(value);
			},
			get: function () {
				return this._consumerGoodsStatus
			}
		})
	},

	onShow() {
		// 判断是否连接房间，是就连接ws
		var status = wx.getStorageSync('status');
		var timestamps = wx.getStorageSync('timestamps');
		var signatures = wx.getStorageSync('signatures');
		var uids = wx.getStorageSync('uids');
		if (status == 2) {
			console.log("status==2")
			util.openSocket(uids, timestamps, signatures) //连接ws
		} else {
		}
		var that = this;
		//接收WS参数
		wx.onSocketMessage(function (res) {
			var a = JSON.parse(res.data);
			console.log('接受的参数:', a);
			switch (a.data.event) {
				case "consumerRoomStatus":
					if (a.data.roomStatus == "checkout") {
						console.log("结算")
						util.cutRoom_link(data => {
							if (data) {
								wx.showModal({
									title: '提示',
									showCancel: false,
									content: '该房间已经结束演唱',
									success(res) {
										if (res.confirm) {
											util.refreshMyself();
										}
									}
								})
							}
						})

					} else if (a.data.roomStatus == "changeRoom") {
						console.log("更换房间")
						util.cutRoom_link(data => {
							if (data) {
								wx.showModal({
									title: '提示',
									showCancel: false,
									content: '该包厢已切换，请重新连接房间！',
									success(res) {
										if (res.confirm) {
											util.refreshMyself();
											console.log('用户点击确定')
										}
									}
								})
							}
						})
					} else if (a.data.roomStatus == "renew") {
						console.log("续费")
						var code = wx.getStorageSync("uid")
						util.connRoom(code, false, data => {
							if (data) {
								wx.showToast({
									title: '续费成功',
									icon: 'success',
									duration: 2000,
									success: function () {
										console.log(12131)
										util.refreshMyself();
									}
								})
							}
						})
					}
					break;
				case "consumerGoodsStatus":
					console.log("酒水订单状态", a.data.goodsStatus)
					that.globalData.consumerGoodsStatus = a.data.goodsStatus
					break;
				case "consumerAddAlreadyClick":
					// console.log("TV端歌曲添加到已点列表",a.data.songs)
					if (a.data.songs) {
						that.globalData.songs = a.data.songs;//以防以后会改先存到这里
					}
					break;
				case "consumerSongsToTop":
					// console.log("TV端已点歌曲置顶",a.data.songs)
					if (a.data.songs) {
						that.globalData.songs = a.data.songs;//以防以后会改先存到这里
					}
					break;
				case "consumerDelSongs":
					// console.log("TV端删除已点歌曲",a.data.songs);
					if (a.data.songs) {
						that.globalData.songs = a.data.songs;//以防以后会改先存到这里
					}
					break;
				case "consumerUpdateSoundSongs":
					// console.log("TV端更新已点歌曲列表录音状态标识",a.data);
					if (a.data.songs) {
						that.globalData.songs = a.data.songs;//以防以后会改先存到这里
					}
					break;
				case "consumerUpdateRoomDevicesStatus":
					console.log("TV端通知小程序更新房间评分状态",a.data.status);
					if (a.data.status) {
                        that.globalData.consumerUpdateRoomDevicesStatus = a.data.status;
					}
					break;
				case "consumerPlayedSongs":
					that.globalData.consumerPlayedSong = a.data;
					break;
				case "consumerUpdateCartItem":
					console.log("操作购物车")
					that.globalData.consumerUpdateCartItem = a.data
					break;
				case "consumerDisConn":
					console.log("tv端断开所有小程序连接")
					util.cutRoom_link(data => {
						if (data) {
							wx.showModal({
								title: '提示',
								showCancel: false,
								content: '该房间已经断开链接，请重新连接房间！',
								success(res) {
									if (res.confirm) {
										util.refreshMyself();
									}
								}
							})
						}
					})
					break;
				case "consumerAdviceAutoSongs":
					console.log("tv端通知小程序端更新自动导唱状态",a.data.action);
					that.globalData.consumerAdviceAutoSong = a.data.action;
					break;
				case "consumerAdjustTone":
					console.log("tv端调节音效");
					break;
				default: console.log("其他状态")
			}
		})
	},
	//	更新token
	updateToken(value) {
		//	util.secret为密钥;value为openid;signature为签名
		const timestamp = new Date().getTime();
		const tempSource = 'openid=' + value + '&timestamp=' + timestamp;
		const signature = md5.hexMD5(util.secret + tempSource);
		util.httpRequest('/client/getToken', {
			openid: value,
			timestamp: timestamp,
			signature: signature
		}, 'GET', '', data => {
			const tempStorageData = {
				'token': data.data.token,
				'status': data.data.status
			};
			util.putStorage(tempStorageData, true);
			this.globalData.token = wx.getStorageSync('token');
			//	此处加入cb阻止页面page onShow比app onShow更快执行
			if (this.getTokenCb) {
				this.getTokenCb(data.data.token)
			}
		})
	},

	//	将程序接收到的WS数据与初始化阶段获取到的openid和token全局化
	globalData: {
		openid: '',
		token: '',
		consumerUpdateCartItem: {},     //操作购物车
		consumerGoodsStatus: "",        //酒水订单状态
		songs: '',                      //点歌、置顶、删除、录音
		consumerUpdateRoomDevicesStatus: '', //TV端通知小程序更新房间评分状态
		consumerPlayedSong: '',        //TV端通知小程序正在播放的歌曲
		consumerAdviceAutoSongs: '',    //TV端通知小程序端更新自动导唱状态
	},

})