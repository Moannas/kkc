/*
 * @Author: zhoudagua 
 * @Date: 2018-05-11 00:42:02 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-10-28 12:33:41
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../../utils/util.js');
Page({
    data: {
        bannerData: [],
        albumData: []
    },

    onLoad() {
        this.getAlbum()
    },

    //  获取轮播图歌单
    getAlbum() {
        //  演唱会歌单
        var token = wx.getStorageSync('token');
        util.httpRequest('/manage/treeTopics/listTopics', {}, 'POST', token, data => {
            const bannerData = [];
            const albumData = [];
            data.data.forEach(val => {
                if(val.name == '演唱会') val.list.map(item => bannerData.push(item));
                if(val.name != '演唱会') albumData.push(val)
            });
            this.setData({
                bannerData: bannerData,
                albumData: albumData
            })
        })
    },

    //  跳转到歌单详情
    goDetail(ev) {
        util.navigation('/pages/detail/detail?type=4&id=' + ev.currentTarget.dataset.id)
    }
})