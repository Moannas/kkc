/*
 * @Author: zhoudagua 
 * @Date: 2018-10-25 17:45:22 
 * @Last Modified by: zhoudagua
 * @Last Modified time: 2018-10-29 00:38:01
 * @Description: 请添加描述 
 */
Component({
    options: ({
        multipleSlots: true
    }),
    properties: {
        singerName: {
            type: String,
            value: ''
        },
        singerCover: {
            type: String,
            value: ''
        },
        singerId: {
            type: String,
            value: ''
        }
    },

    data: {

    },
    methods: {
        goDetail() {
            this.triggerEvent('goDetail', {
                'singerName': this.properties.singerName,
                'singerId': this.properties.singerId
            })
        }
    }
})