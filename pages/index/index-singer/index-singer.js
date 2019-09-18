/*
 * @Author: zhoudagua 
 * @Date: 2018-05-10 00:08:54 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-12-20 15:07:48
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../../utils/util.js');
Page({
    data: {
        head_title: ['全部歌星', '大陆男星', '大陆女星', '大陆组合', '港台男星', '港台女星', '港台组合', '欧美歌手', '日韩歌手', '其他歌手'], //  菜单内容
        head_selectedIdx: 0, //  切换菜单栏

        isFocus: false,
        isLoadingCompleted: true,

        searchKeyword: '', //  搜索关键字

        statusData: {
            isLoading: true,
            isEnd: false,
            isEmpty: false
        },
        listData: [], //  歌手列表
        currentPage: 1,
        totalPage: 1
    },

    onLoad() {
        this.getSingerIdx()
    },

    //  切换选项卡
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
                    this.data.searchKeyword == '' ? this.getSingerIdx() : this.getSearchConfirmData();
                }
            }
        })
    },

    //  获取歌手类型或搜索歌手参数
    getSingerParam() {
        const tempParam = {
            rows: 20,
            page: this.data.currentPage
        };
        switch (this.data.head_selectedIdx) {
            case 1:
                // 大陆男星
                tempParam.search_area_type = '1',
                    tempParam.search_gender = '1',
                    tempParam.search_is_group = '0'
                break;
            case 2:
                //  大陆女星
                tempParam.search_area_type = '1',
                    tempParam.search_gender = '2',
                    tempParam.search_is_group = '0'
                break;
            case 3:
                // 大陆组合
                tempParam.search_area_type = '1',
                    tempParam.search_is_group = '1'
                break;
            case 4:
                // 港台男星
                tempParam.search_area_type = '2, 3',
                    tempParam.search_gender = '1',
                    tempParam.search_is_group = '0'
                break;
            case 5:
                //  港台女星
                tempParam.search_area_type = '2,3',
                    tempParam.search_gender = '2',
                    tempParam.search_is_group = '0'
                break;
            case 6:
                //  港台组合
                tempParam.search_area_type = '2,3',
                    tempParam.search_is_group = '1'
                break;
            case 7:
                //  欧美歌手
                tempParam.search_area_type = '4'
                break;
            case 8:
                //  日韩歌手
                tempParam.search_area_type = '5, 6'
                break;
            case 9:
                //  其他歌手
                tempParam.search_area_type = '7'
                break;
            default:
                break;
        };
        return tempParam
    },

    //  获取歌星列表种类
    getSingerIdx() {
        const tempParam = this.getSingerParam();
        this.getSingerList(tempParam)
    },

    //  
    getSingerList(param) {
        var token = wx.getStorageSync('token');
        util.httpRequest('/manage/singer/findSinger', param, 'POST', token, data => {
            const tempData = util.getNextPageData(data.data.total, this.data.currentPage, this.data.statusData, data.data.rows, this.data.listData);
            this.setData({
                totalPage: tempData.totalPage,
                statusData: tempData.statusData,
                listData: tempData.listData,
                isLoadingCompleted: true
            })
        })
    },

    onSearchInput(ev) {
        this.setData({
            searchKeyword: ev.detail.value
        })
    },

    onSearchFocus() {
        this.setData({
            isFocus: true
        })
    },

    onSearchBlur() {
        this.setData({
            isFocus: false
        })
    },

    onSearchConfirm() {
        this.setData({
            listData: [], //  歌手列表
            currentPage: 1,
            totalPage: 1
        });
        this.getSearchConfirmData()
    },

    getSearchConfirmData() {
        const tempParam = this.getSingerParam();
        tempParam.search_name = this.data.searchKeyword;
        this.getSingerList(tempParam)
    },

    //  跳转到歌星详细页
    goDetail(ev) {
        util.navigation('/pages/detail/detail?type=1&name=' + ev.detail.singerName)
    },

    //  上拉加载更多
    onReachBottom() {
        if (this.data.totalPage > this.data.currentPage && this.data.totalPage >= 2 && this.data.isLoadingCompleted) {
            this.setData({
                isLoadingCompleted: false
            });
            // setTimeout(() => {
            this.data.currentPage += 1;
            if (this.data.searchKeyword) this.getSearchConfirmData()
            else this.getSingerIdx()
            // }, times)
        }
    }
})