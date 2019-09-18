/*
 * @Author: lzh 
 * @Date: 2018-05-08 17:46:46 
 * @Last Modified by: lzh
 * @Last Modified time: 2019-03-07 14:42:51
 * @Description: 请添加描述 
 */

/**
 * 未完成：
 *      1.分享，未完善 
 *      2.添加已点
 * 
 * */
const util = require('../../../utils/util.js');
const token = wx.getStorageSync('token');
Page({
    data: {
        noList: true,                                          //没有数据
        nolistimg: "../../../static/images/my/nolist.png",     //没有数据img
        isdata: [],                                            //数据列表
    },
    onLoad () {
        // wx.showShareMenu({
        //     withShareTicket: true //要求小程序返回分享目标信息
        // })
    },
    //  获取消费信息
    onShow() {
        const token = wx.getStorageSync('token');
        util.httpRequest("/manage/soundRecording/getSoundRecordingList", {}, 'post', token, data => {
            console.log(data.data.result.rows, 9999)
            this.setData({ isdata: data.data.result.rows })
            if (data.data.result.rows.length == 0) {
                this.setData({ noList: false })
            }
        })
    },
    toPlay(e) {
        wx.navigateTo({
            url: '../myRecordPlay/myRecordPlay?id=' + e.currentTarget.dataset.index,
        })
    },
    // 添加已点
    addsong(e) {
        const token = wx.getStorageSync('token');
        var status = wx.getStorageSync('status');
        let tempInfo = {
            'id': e.currentTarget.dataset.index.songId,
            'code': e.currentTarget.dataset.index.songCode,
            'name': e.currentTarget.dataset.index.songName,
            'singer': e.currentTarget.dataset.index.singerName
        }
        var tempParam = {
            type: 1,
            song: JSON.stringify(tempInfo)
        }
        if(status==2){
            util.httpRequest("/manage/songs/putSongs", tempParam, 'post', token, data => {
                wx.showToast({
                    title: '成功添加已点',
                    icon: 'success',
                    duration: 1000
                })
            })
        }else{
            //没有连接房间，跳转到扫码页
			wx.navigateTo({
				url: '../../index/index-scan/index-scan',
			})
        }
    },
    //删除录音
    delesong(e) {
        const token = wx.getStorageSync('token');
        var that = this;
        wx.showModal({
            title: '提示',
            content: '您确定删除该录音文件吗？',
            success(res) {
                if (res.confirm) {
                    util.httpRequest("/manage/soundRecording/deleteSoundRecording", { "id": e.currentTarget.dataset.index}, 'post', token, data => {
                        if (data.status_code == 200) {
                            that.onShow()
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
     // 分享
    onShareAppMessage(e) {
        console.log(e)
        return {
            title: '录音分享',
            path: '/pages/mine/myRecordPlay/myRecordPlay?goin=1&id='+ e.target.dataset.index,
            success(res){
                console.log(res) 
            }
        }
    }

})