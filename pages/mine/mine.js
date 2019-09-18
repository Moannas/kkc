/*
 * @Author: lzh 
 * @Date: 2019-07-25 16:55:01 
 * @Last Modified by:lzh
 * @Last Modified time: 2019-01-23 15:44:40
 * @Description:  请添加描述 
 */

const app = getApp();
const util = require('../../utils/util.js');
Page({
    data: {
        ispower:false,      //是否授权
        offLink:false,       //是否断开连接
        Mydata:[],          //个人中心数据
    },

    onShow() {
        this.update()
        // 是否授权
        const vshow = wx.getStorageSync('vshow');
        if(vshow==true){
            this.setData({ispower:true})
        }else{
            this.setData({ispower:false})
        }
    },
    // 更新数据
    update(){
        var token = wx.getStorageSync('token')
        util.httpRequest("/manage/room/personCenter",{},'post',token,data => {
            console.log(data,9999)
            this.setData({Mydata:data.data})
            // 根据是否有返回房间名来判断是否连接成功
            if(data.status_code==200){
                if (data.data.roomName||data.data.totalAmount) {
                    this.setData({offLink:false})
                } else {
                    this.setData({offLink:true})
                }
            }
        })
    },
    //我的消费
    ismyConsumption() {
        if (this.data.offLink==true) {
            //没有连接房间，跳转到扫码页
            wx.navigateTo({
                url: '../index/index-scan/index-scan',
            })
		} else {
            // 连接跳到我的消费页
			wx.navigateTo({
                url: './myConsumption/myConsumption',
            })
		}
    },
    // 我的录音
    myRecord(){
        wx.navigateTo({
            url: './myrecord/myrecord',
        })
    },
    // 我的收藏
    myCollect(){
        wx.navigateTo({
            url: './myCollect/myCollect',
        })
    },
    // 意见反馈
    feedback(){
        wx.navigateTo({
            url: '../search/feedback/feedback',
        })
    },
    // 连接房间/断开连接
    off_link(){
        const status = wx.getStorageSync('status');
		if (status == '1') {
            // 已经断开连接
            wx.navigateTo({
                url: '../index/index-scan/index-scan',
            })
		} else {
            util.cutRoom(data => {
                this.setData({offLink:data})
            })
		}
    },
    // 授权
    onGotUserInfo(ev) {
        var token = wx.getStorageSync('token')
		if (ev.detail.userInfo) {
            console.log("授权")
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
			}, 'POST', token, () => {
				wx.setStorageSync('vshow',true,);
                wx.setStorageSync('getuser',true);
                this.onShow()
			})
		}
	},
})