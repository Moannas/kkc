/*
 * @Author: lzh 
 * @Date: 2018-05-08 17:46:46 
 * @Last Modified by: lzh
 * @Last Modified time: 2019-03-07 14:42:51
 * @Description: 请添加描述 
 */


const app = getApp();
const util = require('../../../utils/util.js');

Page({
    data: {
        delBtnWidth: 91,
        data: [],
        isScroll: true,         
        noList:false,           //没有数据
    },
    onShow: function () {
        var token = wx.getStorageSync('token')
        util.httpRequest("/manage/room/myRoomBillHistoryList",{},'post',token,data => {
            console.log(data)
            this.setData({data:data.data})
            // 没有数据
            if(this.data.data.length==0){
                this.setData({
                    noList:true
                });
            }
        })
    },
    // 按下鼠标
    drawStart: function (e) {
        var touch = e.touches[0]
        for (var index in this.data.data) {
            var item = this.data.data[index];
            item.right = 0;
        }
        this.setData({
            data: this.data.data,
            startX: touch.clientX,
        })

    },
    // 移动鼠标
    drawMove: function (e) {
        var touch = e.touches[0];
        var item = this.data.data[e.currentTarget.dataset.index];
        var disX = this.data.startX - touch.clientX;
        if (disX >= 20) {
            if (disX > this.data.delBtnWidth) {
                disX = this.data.delBtnWidth
            }
            item.right = disX
            this.setData({
                isScroll: false,
                data: this.data.data
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                data: this.data.data
            })
        }
    },
    // 松开鼠标
    drawEnd: function (e) {
        var item = this.data.data[e.currentTarget.dataset.index]
        if (item.right >= this.data.delBtnWidth / 2) {
            item.right = this.data.delBtnWidth
            this.setData({
                isScroll: true,
                data: this.data.data,
            })
        } else {
            item.right = 0
            this.setData({
                isScroll: true,
                data: this.data.data,
            })
        }
    },
    // 删除单项
    delItem: function (e) {
        console.log(e.currentTarget.dataset.item.roomConsumptionId)
       this.dele(e.currentTarget.dataset.item.roomConsumptionId)
    },
    deleALL: function(){
        for(var i =0;i<this.data.data.length;i++){
            console.log(this.data.data[i].roomConsumptionId)
            this.dele(this.data.data[i].roomConsumptionId)
        }
    },
    // 删除
    dele: function(e){
        var token = wx.getStorageSync('token')
        util.httpRequest("/manage/room/deleteRoomBillHistory",{roomConsumptionId:e},'post',token,data => {
            console.log(data)
            if(data.status_code==200){
                this.onShow()
            }else{
                wx.showToast({
                    title: '删除失败，请稍后再试！',
                    icon: 'none',
                    duration: 1000
                })
            }
            
        })
    },
    // 查看详情
    look: function(e){
        console.log(e.currentTarget.dataset.index)
        wx.navigateTo({
            url: '../bill/bill?index=' + e.currentTarget.dataset.index,
        })
    }
})