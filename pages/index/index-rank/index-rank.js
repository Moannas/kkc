/*
 * @Author: zhoudagua 
 * @Date: 2018-05-11 16:37:30 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-10-17 15:05:10
 * @Description: 请添加描述 
 */
const app = getApp();
const util = require('../../../utils/util.js');
Page({
    data: {
        rankData: [{
                id: 0,
                name: '快唱点唱榜',
                cover: '/images/rank_kuaichang.png',
                list: []
            },
            {
                id: 1,
                name: '综艺排行榜',
                cover: '/images/rank_variety.jpg',
                list: []
            },
            {
                id: 2,
                name: '新歌排行榜',
                cover: '/images/rank_newsongs.jpg',
                list: []
            },
            {
                id: 3,
                name: '推荐排行榜',
                cover: '/images/rank_recommend.png',
                list: []
            }
            // , {
            //     id: 4,
            //     name: '网络排行榜',
            //     cover: '/images/rank_network.jpg',
            //     list: []
            // }
        ]
    },

    onLoad() {
        util.getLoading().then(() => {
            //  快唱点唱榜
            const kcRank = this.promiseRequest(0, {
                is_ranking: 1,
                rows: 3
            });
            //  综艺音乐榜
            const varietyRank = this.promiseRequest(1, {
                search_is_variety: 1,
                is_ranking: 1,
                rows: 3
            });
            //  新歌排行榜
            const newRank = this.promiseRequest(2, {
                search_music_type: 2,
                is_ranking: 1,
                rows: 3
            });
            //  推荐歌曲榜
            const recRank = this.promiseRequest(3, {
                search_is_priority: 1,
                is_ranking: 1,
                rows: 3
            });
            //  网络歌曲榜
            // const netRank = this.promiseRequest(4, {
            //     is_ranking: 1,
            //     rows: 3,
            //     search_music_type:5
            // });
                                               /*,netRank*/
            Promise.all([kcRank, varietyRank, newRank, recRank]).then(() => {
                this.setData({
                    rankData: this.data.rankData
                });
                wx.hideLoading()
            })
        })
    },

    //  返回promise对象
    promiseRequest(idx, param) {
        var token = wx.getStorageSync('token');
        return new Promise(resolve => {
            util.httpRequest('/manage/songs/findSongs', param, 'POST', token, data => {
                for (let i = 0; i < data.data.rows.length; i++) {
                    this.data.rankData[idx].list.push(data.data.rows[i]);
                }
                resolve(data.data.rows);
            });
        })
    },

    //  跳转到歌星详细页
    goDetail(ev) {
        util.navigation('/pages/detail/detail?type=2&id=' + ev.currentTarget.dataset.id)
    }
})