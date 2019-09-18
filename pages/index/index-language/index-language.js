/*
 * @Author: zhoudagua 
 * @Date: 2018-05-11 01:19:06 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-12-20 01:03:45
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../../utils/util.js');
const times = 1500;
Page({
    data: {
        head_title: ['国语', '粤语', '英语', '闽南语', '日语', '韩语', '其他'], //  菜单内容
        head_selectedIdx: 0, //  切换菜单栏

        isCol: true,
        isAdd: true,
        isTop: false,
        isLoadingCompleted: true,

        statusData: {
            isLoading: true,
            isEnd: false,
            isEmpty: false
        },

        listData: [],
        currentPage: 1,
        totalPage: 1
    },

    onLoad() {
        this.getLanguageList()
    },

    /**
     * @Description: 切换选项卡
     */
    head_action(ev) {
        const cur_idx = ev.currentTarget.dataset.idx;
        this.data.head_title.forEach((ele, idx) => {
            if (cur_idx == idx) {
                if (ev.currentTarget.dataset.idx !== this.data.head_selectedIdx) {
                    this.setData({
                        head_selectedIdx: idx,
                        listData: [],
                        currentPage: 1,
                        totalPage: 1
                    });
                    this.getLanguageList()
                }
            }
        })
    },

    /**
     * @description: 换取不同语言下的歌单信息
     */
    getLanguageList() {
        var token = wx.getStorageSync('token');
        const tempParam = {
            search_language_type: this.data.head_selectedIdx,
            rows: 20,
            page: this.data.currentPage
        };
        util.httpRequest('/manage/songs/findSongs', tempParam, 'POST', token, data => {
            const tempData = util.getNextPageData(data.data.total, this.data.currentPage, this.data.statusData, data.data.rows, this.data.listData);
            this.setData({
                totalPage: tempData.totalPage,
                statusData: tempData.statusData,
                listData: tempData.listData,
                isLoadingCompleted: true
            })
        })
    },

    //	操作歌曲
    operatingSong(ev) {
        var token = wx.getStorageSync('token');
        util.httpRequest(ev.detail.url, ev.detail.tempParam, 'POST', token, data => {
            util.operatingSongCBInfo(data.status_code)
        })
    },

    //  上拉加载更多
    onReachBottom() {
        if (this.data.totalPage > this.data.currentPage && this.data.totalPage >= 2 && this.data.isLoadingCompleted) {
            this.setData({
                isLoadingCompleted: false
            });
            // setTimeout(() => {
                this.data.currentPage += 1;
                this.getLanguageList()
            // }, times)
        }
    }
})