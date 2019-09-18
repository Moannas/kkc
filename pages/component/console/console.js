/*
 * @Author: zhoudagua
 * @Email: 495144492@qq.com
 * @Date: 2018-11-02 15:12:03
 * @LastEditors: zhoudagua
 * @LastEditTime: 2018-11-29 01:51:12
 * @Description: 
 */

Component({
    properties: {},
    data: {
        animationData: ''
    },
    methods: {
        goConsole() {
            const animation = wx.createAnimation({
                duration: 450,
                timingFunction: 'ease',
            });
            animation.scale(0.3, 0.3).step();
            animation.scale(1, 1).step();
            this.setData({
                animationData: animation.export()
            });
            setTimeout(() => {
                this.triggerEvent('goConsole', {})
            }, 450)
        }
    }
})