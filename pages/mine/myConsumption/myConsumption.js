/*
 * @Author: lzh 
 * @Date: 2018-05-08 17:46:46 
 * @Last Modified by: lzh
 * @Last Modified time: 2019-03-07 14:42:51
 * @Description: 请添加描述 
 */

/*
 * 未完成：
 *       1.判断现结或者后结状态，显示不同背景颜色#666666
 */ 
const app = getApp();
const util = require('../../../utils/util.js');

Page({
    data: {
        ispower:false,      //是否授权
        offLink:true,       //是否断开连接
        Mydata:[],           //数据
    },

    //  获取消费信息
    onShow() {
        // 获取数据
        this.update()
        // 判断是否登录
        const status = wx.getStorageSync('status');
        if (status == '1') {
            this.setData({offLink:true})
		} else {
            this.setData({offLink:false})
        }
        // 判断是否授权
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
        util.httpRequest("/manage/room/myConsumption",{},'post',token,data => {
            this.setData({Mydata:data.data})
            console.log(data.data.startTime)
        })
    },
    // 包厢详情
    detailed(){
        wx.navigateTo({
            url: '../boxDetailed/boxDetailed',
        })
    },
    // 酒水订单
    ToDrinks(){
        wx.navigateTo({
            url: '../drinks/drinks',
        })
    },
    // 账单
    bill(){
        wx.navigateTo({
            url: '../bill/bill',
        })
    },
    // 结算
    close(){
        wx.navigateTo({
            url: '../bill/bill?close=1',
        })
    }
})