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
        isActive:true,   //小时计费/买断计费
        Mydata:[],       //数据
    },

    //  获取消费信息
    onShow() {
        var token = wx.getStorageSync('token')
        util.httpRequest("/manage/room/roomInfo",{},'post',token,data => {
            this.setData({Mydata:data.data})
            if(data.data.valuationType==1){
                this.setData({isActive:true})
            }else{
                this.setData({isActive:false})
            }
        })
    },
    
})