/*
 * @Author: zhoudagua 
 * @Date: 2018-09-20 12:13:16 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-12-24 18:02:30
 * @Description:  请添加描述 
 */
Component({
    options: ({
        multipleSlots: true 
    }),
    properties: {
        songIdx: {
            type: Number,
            value: ''
        },
        songId: {
            type: String,
            value: ''
        },
        songCode: {
            type: String,
            value: ''
        },
        songName: {
            type: String,
            value: ''
        },
        singerName: {
            type: String,
            value: ''
        },
        songKey: {
            type: null,
            value: ''
        },
        userAvatar: {
            type: String,
            value: ''
        },
        isFavorite: {
            type: Boolean,
            value: false
        },
        isNeedRecording: {
            type: Boolean,
            value: true
        },
        isNeedAdd: {
            type: Boolean,
            value: true
        },
        isSoundRecording: {
            type: Number,
            value: 0
        },
        isShowScore: {
            type: Boolean,
            value: false
        },
        isScore: {
            type: Number,
            value: 0
        },
        songScore: {
            type: Number,
            value: 0
        },
        isCol: {
            type: Boolean,
            value: false
        },
        isAdd: {
            type: Boolean,
            value: true
        },
        isTop: {
            type: Boolean,
            value: false
        },
        isClicked: {
            type: Boolean,
            value: false
        },
        selectedIdx: {
            type: Number,
            value: null
        }
    },
    methods: {
        addSong() {
            let url = '';
            let tempParam = {};
            if (this.properties.isAdd) {
                let tempInfo = {
                    "id": this.properties.songId,
                    "code": this.properties.songCode,
                    "name": this.properties.songName,
                    "singer": this.properties.singerName
                };
                url = '/manage/songs/putSongs';
                tempParam = {
                    type: 1,
                    song: JSON.stringify(tempInfo)
                }
            } else {
                if (this.properties.isFavorite) {
                    url = '/manage/collectSongs/deleteCollectSongs';
                    tempParam = {
                        songId: this.properties.songId
                    }
                } else {
                    url = '/manage/collectSongs/addCollectSongs';
                    tempParam = {
                        "songId": Number(this.properties.songId),
                        "code": this.properties.songCode,
                        "name": this.properties.songName,
                        "singer": this.properties.singerName
                    }
                }
            };
            this.triggerEvent('operatingSong', {
                'url': url,
                'tempParam': tempParam,
                'type': 'Collect'
            });
            this.setData({
                isFavorite: !this.properties.isFavorite
            })
        },
        colSong() {
            let url = '';
            let tempParam = {};
            if (this.properties.isCol) {
                url = '/manage/collectSongs/addCollectSongs';
                tempParam = {
                    "songId": Number(this.properties.songId),
                    "code": this.properties.songCode,
                    "name": this.properties.songName,
                    "singer": this.properties.singerName
                }
            } else {
                if (this.properties.isAdd) {
                    url = '/manage/collectSongs/deleteCollectSongs';
                    tempParam = {
                        songId: this.properties.songColId
                    }
                } else {
                    url = '/manage/songs/deleteClickSongs';
                    let tempInfo = {
                        "id": this.properties.songId,
                        "redisSongsKey": this.properties.songKey,
                        "code": this.properties.songCode,
                        "name": this.properties.songName,
                        "singer": this.properties.singerName,
                        "clickSequence": Number(this.properties.songIdx) - 1
                    };
                    tempParam = {
                        song: JSON.stringify(tempInfo)
                    }
                }
            }
            this.triggerEvent('operatingSong', {
                'url': url,
                'tempParam': tempParam
            })
        },
        topSong() {
            let tempParam = {
                "id": this.properties.songId,
                "redisSongsKey": this.properties.songKey,
                "code": this.properties.songCode,
                "name": this.properties.songName,
                "singer": this.properties.singerName,
                "clickSequence": Number(this.properties.songIdx) - 1
            };
            this.triggerEvent('operatingSong', {
                'url': '/manage/songs/putSongToTop',
                'tempParam': {
                    song: JSON.stringify(tempParam)
                }
            })
        },
        recordSong() {
            let tempParam = {
                "id": this.properties.songId,
                "redisSongsKey": this.properties.songKey,
                "code": this.properties.songCode,
                "name": this.properties.songName,
                "singer": this.properties.singerName,
                "clickSequence": Number(this.properties.songIdx) - 1
            };
            this.triggerEvent('operatingSong', {
                'url': '/manage/songs/operationClickSongs',
                'tempParam': {
                    song: JSON.stringify(tempParam),
                    action: this.properties.isSoundRecording == 0 ? "open" : "close"
                },
                'type': 'Recording'
            });
            this.setData({
                isSoundRecording: this.properties.isSoundRecording == 0 ? 1 : 0
            })
        }
    }
})