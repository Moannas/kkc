Component({
    options: ({
        multipleSlots: true
    }),
    properties: {
        status: {
            type: String
        },
        isLoading: {
            type: Boolean,
            value: true
        },
        isEnd: {
            type: Boolean,
            value: false
        },
        isEmpty: {
            type: Boolean,
            value: false
        }
    },
    /**
     * 组件私有数据
     */
    data: {
        //  图片地址
        endingImgSrc: '/images/end.png',
        emptyImgSrc: '/images/empty.png'
    },
    
    methods: {
        //  显示Loading状态
        _showLoading() {
            console.log('loading')
        },

        //  显示内容加载完毕
        _showEnding() {
            this.setData({
                imgSrc: '/images/end.png'
            })
        },

        //  显示内容为空
        _showEmpty() {
            this.setData({
                imgSrc: '/images/empty.png'
            })
        }
    }
})