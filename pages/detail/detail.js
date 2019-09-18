/*
 * @Author: zhoudagua 
 * @Date: 2018-05-11 01:11:40 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-12-24 14:58:46
 * @Description: 请添加描述 
 */
const util = require('../../utils/util.js');
Page({
    data: {
        isCol: true,
        isAdd: true,
        isTop: false,
        isLoadingCompleted: true,
        isClicked: false,

        statusData: {
            isLoading: true,
            isEnd: false,
            isEmpty: false
        },
        typeData: {
            type: 0,
            name: '',
            id: 0
        },
        listData: [], //  歌手列表
        currentPage: 1,
        totalPage: 1
    },

    //  获取跳转到歌单详情的类型type；
    //  0: banner跳转
    //  1: 首页歌星歌单
    //  2: 首页排行歌单
    //  3: 首页综艺歌单
    //  4: 首页专题歌单
    onLoad(options) {
        const type = parseInt(options.type);
        const id = parseInt(options.id ? options.id : 0);
        const name = options.name ? options.name : '';
        this.setData({
            typeData: {
                type: type,
                id: id,
                name: name
            }
        });

        this.getDetailList()
    },

    //  获取歌单详情
    getDetailList() {
        var token = wx.getStorageSync('token');
        const tempParam = {
            url: '/manage/songs/findSongs',
            param: {
                rows: 20,
                page: this.data.currentPage
            }
        };
        switch (this.data.typeData.type) {
            case 0:
                tempParam.url = '/manage/content/findContentSongs';
                tempParam.param.id = this.data.typeData.id
                break;
            case 1:
                tempParam.param.search_singer = this.data.typeData.name
                break;
            case 2:
                tempParam.param.is_ranking = 1;
                switch (this.data.typeData.id) {
                    case 1:
                        tempParam.param.search_is_variety = 1
                        break;
                    case 2:
                        tempParam.param.search_music_type = 2
                        break;
                    case 3:
                        tempParam.param.search_is_priority = 1
                        break;
                }
                break;
            case 3:
            case 4:
                this.data.typeData.type == 3 ? tempParam.url = '/manage/variety/findVarietySongs' : tempParam.url = '/manage/treeTopics/findTreeTopicsSongs';
                tempParam.param.id = this.data.typeData.id
                break;
        };
        util.httpRequest(tempParam.url, tempParam.param, 'POST', token, data => {
            const responseRows = this.data.typeData.type == 4 ? data.data.result.rows : data.data.rows;
            const responseTotal = this.data.typeData.type == 4 ? data.data.result.total : data.data.total;
            const tempData = util.getNextPageData(responseTotal, this.data.currentPage, this.data.statusData, responseRows, this.data.listData);
            this.setData({
                totalPage: tempData.totalPage,
                statusData: tempData.statusData,
                listData: tempData.listData,
                isLoadingCompleted: true
            })
        })
    },
    //	显示遥控器
    goConsole(ev) {
        util.navigation('/pages/console/console');
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
                this.getDetailList()
            // }, times)
        }
    }
})