/*
 * @Author: lzh 
 * @Date: 2019-07-25 17:46:46 
 * @Last Modified by: lzh
 * @Last Modified time: 2019-09-07 14:42:51
 * @Description: 请添加描述 
 */
const util = require('../../../utils/util.js');

Page({
    data: {
        noList:true,            //没有数据
        cancelwindows:false,    //弹窗
        ischeck:"",          //是否勾选
        musicdata:[],         //收藏歌曲列表
        songsId:"",            //歌曲id   
        songsindex:""          //歌曲的索引
    },
    onShow() {
        this.updata()
        //储存是否勾选的状态
        var that = this
        wx.getStorage({
            key: 'key',
            success (res) {
              that.setData({ischeck:res.data})
            }
        })
    },
    // 获取收藏歌曲列表
    updata(){
        var token = wx.getStorageSync('token');
        util.httpRequest("/manage/collectSongs/findCollectSongs",{page:"1",rows:"20"},'post',token,data => {
            console.log(data)
            if(data.data.total == 0){
                this.setData({noList:false})
            }
            this.setData({musicdata:data.data.rows})
        })
    },
    // 是否勾选
    oncheck(e){
        this.setData({ischeck:e.detail.value})
    },
    // 点击取消收藏按钮
    offwindow(e){
        this.setData({
            songsId:e.currentTarget.dataset.id,
            songsindex:e.currentTarget.dataset.index
        })
        if(this.data.ischeck=="1"){
            // 不显示弹窗
            this.setData({cancelwindows:false})
            this.deletecollectsongs(e.currentTarget.dataset.id)
        }else{
            this.setData({cancelwindows:true})
        }
    },
    // 确认取消
    cancel(){
        if(this.data.ischeck[0]==1){
            wx.setStorageSync('key', this.data.ischeck[0]);
        }
        this.setData({cancelwindows:false})
        var ids = this.data.songsId
        this.deletecollectsongs(ids)
    },
    // 继续收藏
    continue(){
        if(this.data.ischeck[0]==1){
            wx.setStorageSync('key', this.data.ischeck[0]);
        }
        this.setData({cancelwindows:false})
    },
    // 点击添加已点
    toPlay(e){
        var token = wx.getStorageSync('token');
        var status = wx.getStorageSync('status');
        let tempInfo = {
            'id':e.currentTarget.dataset.index.songId,
            'code':e.currentTarget.dataset.index.code,
            'name':e.currentTarget.dataset.index.name,
            'singer':e.currentTarget.dataset.index.singer
        }
        var tempParam = {
            type: 1,
            song: JSON.stringify(tempInfo)
        }
        if(status==2){
            util.httpRequest("/manage/songs/putSongs",tempParam,'post',token,data => {
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
    // 全部点歌
    addAll(){
        var token = wx.getStorageSync('token');
        var status = wx.getStorageSync('status');
        if(status==2){
            for(let i =0; i<this.data.musicdata.length;i++){
                let tempInfo = {
                    'id':this.data.musicdata[i].songId,
                    'code':this.data.musicdata[i].code,
                    'name':this.data.musicdata[i].name,
                    'singer':this.data.musicdata[i].singer
                }
                var tempParam = {
                    type: 1,
                    song: JSON.stringify(tempInfo)
                }
                util.httpRequest("/manage/songs/putSongs",tempParam,'post',token,data => {
                    wx.showToast({
                        title: '全部成功添加已点',
                        icon: 'success',
                        duration: 2000
                    })
                })
            }
        }else{
            //没有连接房间，跳转到扫码页
			wx.navigateTo({
				url: '../../index/index-scan/index-scan',
			})
        }


    },
    // 取消收藏歌曲
    deletecollectsongs(ids){
        var token = wx.getStorageSync('token')
        util.httpRequest("/manage/collectSongs/deleteCollectSongs",{songId:ids},'post',token,data => {
            this.data.musicdata.splice(this.data.songsindex,1)
            this.setData({
                musicdata:this.data.musicdata
            });
            // 没有数据
            if(this.data.musicdata.length==0){
                this.setData({
                    noList:false
                });
            }
        })
    }
})