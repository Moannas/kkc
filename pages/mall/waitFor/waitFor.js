/*
 * @Author: lzh 
 * @Date: 2018-05-08 17:46:46 
 * @Last Modified by: lzh
 * @Last Modified time: 2019-03-07 14:42:51
 * @Description: 请添加描述 
 */

/**未完成：
 *     4.包厢名,没有返回那么就做本地存储
 * */


const app = getApp();
const util = require('../../../utils/util.js');
Page({
    data: {
        delBtnWidth: 101,          //删除按钮宽度单位（rpx）
        isScroll: true,
        noList: false,             //没有数据
        data: [],                  // 商品列表数据
        alldata: [],               //所有数据
        goodsConsumptionId: '',    // 订单id
        orderVersion: '',          //版本号
        roomname: ""                // 包厢名
    },
    onLoad: function (options) {
        const token = wx.getStorageSync('token')
        this.setData({ goodsConsumptionId: options.id })
        util.httpRequest("/manage/goodsConsumption/goodsOrderInfo", { goodsConsumptionId: options.id }, 'post', token, data => {
            this.setData({
                data: data.data.goodsConsumption.businessGoodsDTOS,
                alldata: data.data.goodsConsumption,
                orderVersion: data.data.goodsConsumption.orderVersion,
                roomname: data.data.roomName
            })
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
    // 删除商品
    delItem: function (e) {
        console.log(this.data.orderVersion)
        var businessGoodsId = this.data.data[e.currentTarget.dataset.index].businessGoodsId;
        console.log(businessGoodsId)
        this.updata({
            "goodsConsumptionId": this.data.goodsConsumptionId,
            "businessGoodsId": businessGoodsId,
            "orderVersion": this.data.orderVersion,
            "action": 'remove'
        })
        this.data.data.splice(e.currentTarget.dataset.index, 1)
        this.setData({
            data: this.data.data,
            alldata: this.data.alldata
        });
    },
    // 减商品数量
    minus: function (e) {
        console.log(this.data.orderVersion)
        this.setData({ data: this.data.data, alldata: this.data.alldata });
        var businessGoodsId = this.data.data[e.currentTarget.dataset.index].businessGoodsId; //商品id
        var num = this.data.data[e.currentTarget.dataset.index].count; //商品改变后的数量
        if (this.data.data[e.currentTarget.dataset.index].count == 1) {
            this.data.data[e.currentTarget.dataset.index].count = 1
            wx.showToast({
                title: '👈左滑删除商品',
                icon: 'none',
                duration: 1000
            })
        } else {
            this.data.data[e.currentTarget.dataset.index].count--
            this.data.alldata.totalAmount -= this.data.data[e.currentTarget.dataset.index].price;
            this.updata({
                "goodsConsumptionId": this.data.goodsConsumptionId,
                "businessGoodsId": businessGoodsId,
                "orderVersion": this.data.orderVersion,
                "action": 'changeNumber',
                "count": num
            })
        }

    },
    // 加商品数量
    add: function (e) {
        console.log(this.data.orderVersion)
        this.data.data[e.currentTarget.dataset.index].count++;
        this.data.alldata.totalAmount += this.data.data[e.currentTarget.dataset.index].price;
        this.setData({ data: this.data.data, alldata: this.data.alldata });
        var businessGoodsId = this.data.data[e.currentTarget.dataset.index].businessGoodsId;
        var num = this.data.data[e.currentTarget.dataset.index].count;
        this.updata({
            "goodsConsumptionId": this.data.goodsConsumptionId,
            "businessGoodsId": businessGoodsId,
            "orderVersion": this.data.orderVersion,
            "action": 'changeNumber',
            "count": num
        })
    },
    // 更新订单
    updata(obj) {
        const token = wx.getStorageSync('token')
        util.httpRequest("/manage/goodsConsumption/changeGoodsOrderNumber", obj, 'post', token, data => {
            console.log(data)
            this.setData({ orderVersion: data.data.orderVersion })
        })
    },
    // 取消下单
    cancel() {
        var that = this;
        const token = wx.getStorageSync('token')
        if (this.data.data.length == 0) {
            wx.navigateBack({
                delta: 1
            })
        } else {
            wx.showModal({
                title: '提示！',
                content: '您确定要取消订单吗？',
                success(res) {
                    if (res.confirm) {
                        util.httpRequest("/manage/goodsConsumption/cancelGoodsOrder", { goodsConsumptionId: that.data.goodsConsumptionId }, 'post', token, data => {
                            if (data.status_code == 200) {
                                //返回上一页
                                wx.navigateBack({
                                    delta: 1
                                })
                            }
                        })
                    }
                }
            })
        }
    }
})