/*
 * @Author: zhoudagua 
 * @Date: 2018-05-11 17:32:09 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-10-29 16:54:34
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../utils/util.js');
const times = 1500;
let url = '';
var token = wx.getStorageSync('token');
Page({
    data: {
        isFocus: false,
        isResult: false,
        isAdd: true,
        isCol: true,
        isTop: false,
        isClicked: false,
        isLoadingCompleted: true,

        statusData: {
            isLoading: true,
            isEnd: false,
            isEmpty: false
        },

        searchKeyword: '',
        searchHistory: [],

        head_title: ['歌曲', '歌星'], //  菜单内容
        head_choseIdx: 0, //  切换菜单栏

        listData: [], //  歌手列表
        currentPage: 1,
        totalPage: 1
    },

    onShow() {
        // 获取本地搜索记录
        const searchHistory = wx.getStorageSync('searchHistoryKey') || [];
        if (searchHistory) {
            this.setData({
                searchHistory: searchHistory
            })
        }
    },

    //  切换tabbar
    head_action(ev) {
        if (ev) {
            if (ev.currentTarget.dataset.idx !== this.data.head_choseIdx) {
                this.isSetData(ev)
            }
        } else {
            this.isSetData(ev)
        }
    },
    isSetData(ev){
          //  设置idx对应的歌单状态
          this.setData({
            head_choseIdx: ev.currentTarget.dataset.idx,
            statusData: {
                isLoading: true,
                isEnd: false,
                isEmpty: false
            },
            isClicked: false,
            listData: [],
            currentPage: 1,
            totalPage: 1
        });
        this.onFetchSearchList()
    },
    //  获取输入的关键字
    onSearchInput(ev) {
        if (!ev.detail.value) {
            this.data.isResult  = false;
        };

        this.setData({
            searchKeyword: ev.detail.value,
            isResult: this.data.isResult
        })
    },

    //  获取焦点
    onSearchFocus() {
        //  判断当前搜索框是否存在值
        if (!this.data.searchKeyword.trim()) {
            this.data.isResult  = false;
        };

        this.setData({
            isFocus: true,
            isResult: this.data.isResult
        })
    },

    //  失去焦点
    onSearchBlur() {
        this.setData({
            isFocus: false
        })
    },

    //  确认搜索
    onSearchConfirm() {
        const searchKeyword = this.data.searchKeyword;
        const searchHistory = this.data.searchHistory;
        if (searchKeyword.trim()) {
            // 添加搜索历史记录
            if (searchHistory.length > 0) {
                if (searchHistory.indexOf(searchKeyword) < 0) {
                    searchHistory.unshift(searchKeyword);
                }
            } else {
                searchHistory.push(searchKeyword);
            }

            wx.setStorage({
                key: "searchHistoryKey",
                data: searchHistory,
                success: () => {
                    this.setData({
                        searchKeyword: searchKeyword,
                        searchHistory: searchHistory,
                        isResult: true,
                        listData: [],
                        currentPage: 1
                    })
                }
            })
        }
        this.onFetchSearchList()
    },

    //  获取搜索结果
    onFetchSearchList() {
        if (this.data.head_choseIdx == 0) {
            url = '/manage/songs/findSongs'
        } else {
            url = '/manage/singer/findSinger'
        };
        util.httpRequest(url, {
            rows: 20,
            page: this.data.currentPage,
            search_name: this.data.searchKeyword,
        }, 'POST', token, data => {
            if (data.status_code == 200) {
                const tempData = util.getNextPageData(data.data.total, this.data.currentPage, this.data.statusData, data.data.rows, this.data.listData);
                this.setData({
                    totalPage: tempData.totalPage,
                    statusData: tempData.statusData,
                    listData: tempData.listData,
                    isLoadingCompleted: true
                })
            } else {
                this.setData({
                    statusData: {
                        isLoading: false,
                        isEnd: false,
                        isEmpty: true
                    }
                })
            }
        })
    },
    //点击历史记录继续搜索历史记录
    clickOnSearch(e) {
        this.setData({
            searchKeyword: e.currentTarget.dataset.key,
            isResult: true,
            listData: [],
            currentPage: 1
        });
        this.onFetchSearchList()
    },
    //  跳转到歌星详细页
    goDetail(ev) {
        util.navigation('/pages/detail/detail?type=1&name=' + ev.detail.singerName)
    },

    //	操作歌曲
    operatingSong(ev) {
        var token = wx.getStorageSync('token');
        this.setData({
            isClicked: true
        });
        util.httpRequest(ev.detail.url, ev.detail.tempParam, 'POST', token, data => {
            util.operatingSongCBInfo(data.status_code == '200' ? data.status_code : data).then(() => {
                this.setData({
                    isClicked: false
                })
            })
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
            this.onFetchSearchList()
            // }, times)
        }
    },
    //   跳到缺歌反馈页
    gofeedback() {
        wx.navigateTo({
            url: '/pages/search/feedback/feedback',
        })
    }

})