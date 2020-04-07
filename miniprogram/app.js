//app.js
const common = require('./common/common')

App({
    onLaunch: function () {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                // env: 'my-env-id',
                traceUser: true,
            })
        }

        this.globalData = {};
        this.common = common;
    },
    // 查询用户西信息
    async onGetActivityUserInfo() {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this = this;
        return new Promise(async (resolve, reject)=>{
            var res = await wx.cloud.callFunction({
                name: 'userinfo',
                data: {
                    create_time: common.getNewTime()
                }
            })
            if (res.errMsg == "cloud.callFunction:ok") {
                if (!res.result) {
                    _this.onGetActivityUserInfo()
                } else {
                    wx.hideLoading()
                    this.globalData.userInfo = res.result
                    resolve(res)
                }
            } else {
                wx.hideLoading()
                reject(res)
            }
        })
    },
    // 验证身份改变

    // changeSF(){
    //     wx.cloud.callFunction({
    //         name: 'userinfo',
    //         data: {
    //             type: 'sf'
    //         }
    //     }).then(async res => {
    //         console.log(res)
    //     })
    // },
    // 获取用户信息
    onGetUserInfo: function (e,cd) {
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this = this;
        let detail = e.detail;
        // 拒绝授权
        if (!detail.encryptedData) {
            wx.hideLoading()
            wx.showModal({
                showCancel: false,
                content: '请允许获取用户信息！'
            })
            return
        }
        var data_info = {
            avatarUrl: e.detail.userInfo.avatarUrl,
            city: e.detail.userInfo.city,
            country: e.detail.userInfo.country,
            gender: e.detail.userInfo.gender,
            language: e.detail.userInfo.language,
            nickName: e.detail.userInfo.nickName,
            province: e.detail.userInfo.province,
            type: 1,
        }
        console.log(data_info)
        wx.cloud.callFunction({
            name: 'userinfo',
            data: data_info
        }).then(res => {
            wx.hideLoading()
            if (res.errMsg == "cloud.callFunction:ok") {
                cd && cd(e.detail.userInfo.avatarUrl)
            } else {
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
})