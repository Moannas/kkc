/*
 * @Author: zhoudagua 
 * @Date: 2018-05-10 22:43:02 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-12-20 17:58:36
 * @Description: 请添加描述 
 */
const util = require('../../../utils/util.js');
Page({
    data: {
        isFocus: false,
        isLoadingCompleted: true,

        statusData: {
            isLoading: true,
            isEnd: false,
            isEmpty: false
        },
        listData: [], //  歌手列表
        currentPage: 1,
        totalPage: 1
    },

    //  onLoad阶段获取综艺列表
    onLoad() {
        this.getVarietyList()
    },

    //  获取综艺列表
    getVarietyList() {
        var token = wx.getStorageSync('token');
        const tempParam = {
            parentId: 0,
            rows: 20,
            page: this.data.currentPage
        };
        util.httpRequest('/manage/variety/findVariety', tempParam, 'POST', token, data => {
            const tempData = util.getNextPageData(data.data.total, this.data.currentPage, this.data.statusData, data.data.rows, this.data.listData);
            this.setData({
                totalPage: tempData.totalPage,
                statusData: tempData.statusData,
                listData: tempData.listData,
                isLoadingCompleted: true
            })
        })
    },

    //  跳转到综艺歌单详细页
    goDetail(ev) {
        util.navigation('/pages/detail/detail?type=3&id=' + ev.detail.singerId)
    },

    //  上拉加载更多
    onReachBottom() {
        console.log(this.data);
        if (this.data.totalPage > this.data.currentPage && this.data.totalPage >= 2 && this.data.isLoadingCompleted) {
            this.setData({
                isLoadingCompleted: false
            });
            // setTimeout(() => {
                this.data.currentPage += 1;
                this.getVarietyList()
            // }, times)
        }
    }
})