/*
 * @Author: lzh 
 * @Date: 2018-05-08 17:46:46 
 * @Last Modified by: lzh
 * @Last Modified time: 2019-03-07 14:42:51
 * @Description: 请添加描述 
 */
const util = require('../../../utils/util.js');

Page({
    data: {
        nowAmdOver:false,               //现结或者后结
        isshow:true,                   //是否从历史账单进来
        Mydata:[]                      //页面数据        
    },
    //  获取消费信息
    onLoad: function (options) {
        // 判断是否从历史账单进来，options为页面跳转所带来的参数
        if(options.index){
            this.setData({isshow:false})
            this.updata("/manage/room/myRoomBillInfo",{roomConsumptionId:options.index})
        }else {
            if(options.close){
                console.log("close")
                this.setData({nowAmdOver:false})
            }
            this.updata("/manage/room/myRoomBill",{})
        }
    },
    updata:function(url,isdata){
        var token = wx.getStorageSync('token');
        util.httpRequest(url,isdata,'post',token,data => {
            switch (data.status_code) {
                case "200":
                    this.setData({Mydata:data.data})
                    break;
                case "1002":
                    wx.showToast({
                        title: '出错啦！！',
                        duration: 1000
                    })
                    break;
                case "1008":
                    wx.showToast({
                        title: '出错啦！！',
                        duration: 1000
                    })
                    break;
                case "1013":
                    wx.showToast({
                        title: '请连接房间',
                        duration: 1000
                    })
                    setTimeout(function(){
                        wx.navigateTo({
                            url: '../../index/index-scan/index-scan',
                        })
                    },1300)
                   
                    break;
            }
        })
    },
    // 历史列表
    history(){
        wx.navigateTo({
            url: '../history/history',
        })
    },
    // 酒水订单
    ToDrinks(){
        wx.navigateTo({
            url: '../drinks/drinks',
        })
    },
    // 账单
    boxDetailed(){
        wx.navigateTo({
            url: '../boxDetailed/boxDetailed',
        })
    },
    //结算
    isclose(){
        var token = wx.getStorageSync('token')
        util.httpRequest("/manage/room/checkout",{},'post',token,data => {
            console.log(data)
            if(data.status_code==200){
                wx.showToast({
                    title: '结算成功',
                    icon: 'success',
                    duration: 1000
                })
                wx.closeSocket() //断开ws连接
                // 结算成功返回首页
                wx.switchTab({
                    url: '../../index/index'
                })
                //刷新更新房间状态
                util.refreshMyself()
            }
        })
    }
})