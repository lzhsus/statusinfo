// pages/detail/detail.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        qa1:{},
        qa2:{},
        userInfo:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getResult(options)
        this.getInit()
        app.current = 1
    },
    async getInit(type){
        const _this = this;
        await app.onGetActivityUserInfo().then(res => {
            app.globalData.userInfo = res.result;
            _this.setData({
                userInfo:res.result
            })
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },
    getResult(options){
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this =this;
        wx.cloud.callFunction({
            name: 'userinfo',
            data: {
                type:'detail',
                openId:options.openId||''
            }
        }).then(res => {
            wx.hideLoading()
            if (res.errMsg == "cloud.callFunction:ok") {
                console.log(res)
                if(res.result.length==1){
                    _this.setData({
                        qa1:res.result[0],
                    })
                }else if(res.result.length==2){
                    _this.setData({
                        qa1:res.result[0],
                        qa2:res.result[1],
                    })
                }else{
                    wx.showToast({
                        title: '您的数据不存在，请重新登记！',
                        icon:'none'
                    })
                    setTimeout(res=>{
                        app.err=1
                        wx.navigateBack({
                            delta: 1
                        })
                    },1500)
                }
            } else {
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    resetInfo(){
        var _this =this;
        wx.showModal({
            title: '提示',
            content: '重置信息，将清空以往填写信息，是否继续？',
            success (res) {
              if (res.confirm) {
                wx.showLoading({
                    title: '加载中',
                    mask: true
                });
                wx.cloud.callFunction({
                    name: 'userinfo',
                    data:{
                        reset:true
                    }
                }).then(res => {
                    wx.hideLoading()
                    if (res.errMsg == "cloud.callFunction:ok") {
                        wx.showToast({
                            title: '重置成功，重新登记！',
                            icon:'none'
                        })
                        setTimeout(res=>{
                            wx.redirectTo({
                                url: '/pages/home/home?reset=1'
                              })
                        },600)
                        
                    }else{
                        wx.showModal({
                            content: res.errMsg,
                            showCancel: false
                        })
                    }
                })
                
                
              } else if (res.cancel) {
                 console.log('用户点击取消')
              }
            }
        })
    }
})