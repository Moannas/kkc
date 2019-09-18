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
        nodata:false,          //没有数据
        status:"0",            //配送中/待支付
        isPay:false,           //是否支付
        Mydata:[],             //数据
        roomname:""            //包厢名    
    },
    //  获取消费信息
    onShow() {
        var token = wx.getStorageSync('token')
        util.httpRequest("/manage/goodsConsumption/goodsOrderList",{},'post',token,data => {
            console.log(data)
            this.setData({Mydata:data.data.goodsConsumptions,roomname:data.data.roomName})
            if(data.data.goodsConsumptions.length==0){
                this.setData({nodata:true})
            }
        })
    },
    noPay(e){
        wx.navigateTo({
            url: '../../mall/waitFor/waitFor?id='+e.currentTarget.dataset.item.id,
        })
    }
})