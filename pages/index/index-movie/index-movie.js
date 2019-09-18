/*
 * @Author: zhoudagua 
 * @Date: 2019-01-29 13:02:46 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2019-03-09 02:20:38
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../../utils/util.js');
Page({
    data: {
        thirdpartAppList: []
    },

    onLoad() {
        this.getThirdPartAppData()
    },

    //  获取第三方app列表
    getThirdPartAppData() {
        var token = wx.getStorageSync('token');
        util.httpRequest('/manage/cooperatorApp/getCooperatorAppList', {}, 'POST', token, (data) => {
            if (!data.data) return;

            this.setData({
                thirdpartAppList: data.data
            })
        })
    },

    //  点击打开第三方app
    openThirdpartApp(ev) {
        var token = wx.getStorageSync('token');
        util.httpRequest('/manage/cooperatorApp/openCooperatorApp', {
            cooperatorAppId: ev.currentTarget.dataset.id
        }, 'POST', token, (data) => {
            if (typeof data === 'string') util.operatingSongCBInfo(data); return
        })
    }
})