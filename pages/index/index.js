/*
 * @Author: zhoudagua 
 * @Date: 2018-05-03 15:59:39 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2019-01-09 18:56:39
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../utils/util.js');
Page({
	data: {
		maskHeight: 0,
		isFocus: true,
		code: [],
		length: 0,

		inputPassword: '',
		passwordInputHidden: true,

		isLoading: true,
		isEnd: false,
		isEmpty: false,

		isShowMask: true,
		isConnect: false, //是否连接设备

		isAdd: true,
		isCol: true,
		isTop: false,

		isClicked: false, //控制重复点击
		showWindow: true, //弹窗
		bannerData: [],
		optionsData: [{
				id: 0,
				className: 'icon-singer',
				itemName: '歌星'
			},
			{
				id: 1,
				className: 'icon-album',
				itemName: '歌单'
			},
			{
				id: 2,
				className: 'icon-rank',
				itemName: '排行'
			},
			{
				id: 3,
				className: 'icon-variety',
				itemName: '综艺'
			},
			{
				id: 4,
				className: 'icon-language',
				itemName: '语言'
			},

		],

		hotSongs: []
	},
	onLoad() {
		wx.hideTabBar();
	},
	onShow() {
		//弹窗和tabbar不可同时出现
		var token = wx.getStorageSync('token');
		var that = this;
		wx.getStorage({
			key: 'getuser',
			success(res) {
				if (res && res.data) {
					that.setData({
						showWindow: false
					})
					wx.showTabBar();
					console.log(that.data.showWindow);
				} else {
					that.setData({
						showWindow: true
					})
					wx.hideTabBar()
					console.log(that.data.showWindow);
				}

			}
		});

		if (token) {
			//	首页检测是否连接设备
			new Promise(resolve => {
				//	获取轮播图
				util.httpRequest('/client/roomConsumption', {}, 'POST', token, data => {
					this.setData({
						isConnect: data.status_code == '200' ? true : false
					});
					resolve(this.data.isConnect)
				});
			});

			const getBanner = new Promise(resolve => {
				//	获取轮播图
				util.httpRequest('/manage/content/findContent', {}, 'POST', token, data => {
					this.setData({
						bannerData: data.data.contents
					});
					resolve(data.data.contents)
				});
			});

			const getHotSongs = new Promise(resolve => {
				//	获取热门推荐歌单
				util.httpRequest('/manage/songs/findSongs', {
					'search_music_type': 2,
					'page': 1,
					'rows': 20
				}, 'POST', token, data => {
					this.setData({
						hotSongs: data.data.rows
					});
					resolve(data.data.rows)
				})
			});

			Promise.race([getBanner, getHotSongs]).then(() => {
				this.setData({
					isLoading: false,
					isEnd: true,
					isEmpty: false
				})
			})
		} else {
			// 由于获取token是网络请求，可能会在Page.onShow之后才返回
			// 所以此处加入 callback 以防止这种情况
			app.getTokenCb = token => {
				if (token != '') {
					console.log("不存在token");
					this.onShow()
				}
			}
		}

	},

	onHide() {
		this.setData({
			passwordInputHidden: true
		});
	},

	//	显示遥控器
	goConsole() {
		util.navigation('/pages/console/console');
	},

	//	跳转搜索
	goSearch() {
		wx.navigateTo({
			url: '/pages/search/search',
		})
	},

	// 跳转已点
	goChoosed() {
		const status = wx.getStorageSync('status');
		if (status == '1') {
			//没有连接房间，跳转到扫码页
			wx.navigateTo({
				url: '../index/index-scan/index-scan',
			})
		} else {
			//连接房间跳到已点页
			wx.navigateTo({
				url: '/pages/choosed/choosed',
			})
		}
		
	},

	//	跳转分类歌单
	goClassify(ev) {
		const id = ev.currentTarget.dataset.id;
		switch (id) {
			case 0:
				util.navigation('index-singer/index-singer')
				break;
			case 1:
				util.navigation('index-album/index-album')
				break;
			case 2:
				util.navigation('index-rank/index-rank')
				break;
			case 3:
				util.navigation('index-variety/index-variety')
				break;
			case 4:
				util.navigation('index-language/index-language')
				break;

		}
	},

	//	跳转歌单详情
	goDetail(ev) {
		util.navigation('/pages/detail/detail?type=0&id=' + ev.currentTarget.dataset.id)
	},

	//	连接房间/断开房间
	setCode(e) {
		const status = wx.getStorageSync('status');
		if (status == '1') {
			this.passwordInputHidden()
		} else {
			this.cutRoom()
		}
	},
	//没连接房间跳到扫码页
	decide() {
		const status = wx.getStorageSync('status');
		if (status == '1') {
			//没有连接房间，跳转到扫码页
			wx.navigateTo({
				url: '../index/index-scan/index-scan',
			})
		}
	},
	//	断开房间连接
	cutRoom() {
		wx.showModal({
			title: '温馨提醒',
			content: '确定要退出欢唱了吗？',
			showCancel: true,
			cancelText: '再用用吧',
			confirmText: '狠心退出',
			confirmColor: '#c324ff',
			success: res => {
				if (res.confirm) {
					this.setData({
						isClicked: true
					});

					util.getLoading().then(() => {
						util.httpRequest('/client/disConn', {}, 'GET', token, data => {
							wx.hideLoading();
							//	断开房间失败
							if (typeof data === 'string') {
								this.setData({
									isClicked: false
								});
								util.operatingSongCBInfo(data);
								return
							}
							//	断开房间连接后，原来的token失效，需要更新临时token
							//	code == '1088'为断开房间成功
							util.operatingSongCBInfo('1088').then(() => {
								app.updateToken(app.globalData.openid);
								this.setData({
									isConnect: false,
									isClicked: false
								})
							})
						})
					})
				}
			}
		})
	},
	//	取消

	passwordInputHidden() {
		this.setData({
			inputPassword: '',
			passwordInputHidden: !this.data.passwordInputHidden //取反 打开关闭小键盘
		})
	},

	//	删除
	clear() {
		const index = this.data.inputPassword.length;
		if (index > 0) {
			const inputPassword = this.data.inputPassword.substr(0, index - 1);
			this.setData({
				inputPassword: inputPassword
			})
		}
	},

	//	操作歌曲
	operatingSong(ev) {
		var token = wx.getStorageSync('token');
		this.setData({
			isClicked: true
		});
		util.httpRequest(ev.detail.url, ev.detail.tempParam, 'POST', token, data => {
			util.operatingSongCBInfo(data.status_code == '200' ? data.status_code : data).then(() => {
				this.setData({
					isClicked: false
				})
			})
		})
	},


	//允许授权弹窗
	//获取用户信息
	onGotUserInfo(ev) {
		this.setData({
			showWindow: false
		});
		wx.showTabBar();
		if (ev.detail.userInfo) {
			var token = wx.getStorageSync('token');
			const tempStorageData = {
				'nickName': ev.detail.userInfo.nickName,
				'avatarUrl': ev.detail.userInfo.avatarUrl
			};
			//	将用户信息存到Storage里
			util.putStorage(tempStorageData, false);
			//	上传用户信息
			util.httpRequest('/client/uploadUserInfo', {
				nickname: ev.detail.userInfo.nickName,
				avatarurl: ev.detail.userInfo.avatarUrl,
				gender: ev.detail.userInfo.gender,
				city: ev.detail.userInfo.city,
				province: ev.detail.userInfo.province,
				country: ev.detail.userInfo.country,
				language: ev.detail.userInfo.language
			}, 'POST', token, data => {
				console.log(data)
				wx.setStorageSync('vshow', true, );
				wx.setStorageSync('getuser', true);
			})
		}
	},
	//拒绝授权
	OutGotUserInfo: function () {
		this.setData({
			showWindow: false
		});
		wx.showTabBar();
		//vshows true允许 false拒绝
		wx.setStorageSync('vshow', false, );
		wx.setStorageSync('getuser', true);
	},
})