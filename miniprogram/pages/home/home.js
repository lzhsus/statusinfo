// pages/home/home.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command;
var timePromise = null;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loginShow:false,
        second:0,
        mobile:'',
        v_code:'',
        pageShow:0,
        userInfo:{},
        current:0,
        username:'',
        userclass:'',
        usermobile:'',
        qaList:[],
        qaList2:[],
        text:'',
        text2:'',
        region: ['', '', ''],
        start:0,
        textview:0,
        isLogin:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad:async function (opt) {
        var _this = this;
        
        wx.cloud.callFunction({
            name: 'islogin'
        }).then(res=>{
            _this.setData({
                isLogin:res.result.is
            })
            console.log(res)
        })

        await this.get_db_qa()
        await this.getInit()
        if(opt.reset){
            this.setData({
                current:1,
                start:1
            })
        }
    },
   async getInit(type){
        const _this = this;
        await app.onGetActivityUserInfo().then(res => {
            app.globalData.userInfo = res.result;
            console.log(res.result)
            _this.setData({
                userInfo: app.globalData.userInfo
            })
        })
    },
    get_db_qa(){
        var _this =this;
        wx.cloud.callFunction({
            name: 'userinfo',
            data: {
                type:'qa'
            }
        }).then(res => {
            if (res.errMsg == "cloud.callFunction:ok") {
                console.log(res)

                _this.setData({
                    qaList:res.result.qa1,
                    qaList2:res.result.qa2
                })
            } else {
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow:async function () {
        var _this =this;
        app.searchValue =''
        if(app.globalData.userInfo&&app.current){
            this.setData({
                userInfo:app.globalData.userInfo,
                current:0
            })
            app.current = 0
        }
        if( app.err){
            app.err='';
            await app.onGetActivityUserInfo().then(res => {
                app.globalData.userInfo = res.result;
                console.log(res.result)
                _this.setData({
                    userInfo: app.globalData.userInfo
                })
            })
        }
        this.getInit()
    },
    textBtn(){
        this.setData({
            textview:1
        })
    },
    textBtn2(){
        this.setData({
            textview:2
        })
    },
    startBtn(){
        if(!this.data.isLogin){
            console.log(1111111111)
            this.setData({
                current:1,
                start:1
            })
            return
        }
        if(!app.globalData.userInfo.isMember){
            this.setData({
                loginShow:true
            })
        }else{
            if(app.globalData.userInfo.t.status){
                wx.navigateTo({
                    url: '/pages/search/search',
                  })
                
            }else{
                
                if(app.globalData.userInfo.qa.length==0){
                    this.setData({
                        current:1,
                        start:1
                    })
                }else if(app.globalData.userInfo.qa.length==1){

                    this.setData({
                        current:1,
                        start:2,
                        username:app.globalData.userInfo.qa[0].username,
                        userclass:app.globalData.userInfo.qa[0].userclass
                    })
                }else{
                    wx.navigateTo({
                        url: '/pages/detail/detail',
                    })
                }
            }
        }
    },
    inputName(e){
        this.setData({
            username:e.detail
        })
    },
    inputClass(e){
        console.log(e)
        this.setData({
            userclass:e.detail
        })
    },
    inputMobile(e){
        this.setData({
            usermobile:e.detail
        })
    },
    bindinputText(e){
        console.log(e.detail.value)
        this.setData({
            text:e.detail.value
        })
    },
    bindinputText2(e){
        console.log(e.detail.value)
        this.setData({
            text2:e.detail.value
        })
    },
    
    bindRegionChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            region: e.detail.value
        })
    },
    sBtn(e){
        var qaList = this.data.qaList;
        var item =e.currentTarget.dataset.item;
        var items =e.currentTarget.dataset.items;
        console.log(items)
        qaList = qaList.map(obj=>{
            if(obj._id == item._id){
                obj.value = items.id
            }
            return obj;
        })
        console.log(qaList)
        this.setData({
            qaList:qaList
        })
    },
    sBtn2(e){
        var qaList = this.data.qaList2;
        var item =e.currentTarget.dataset.item;
        var items =e.currentTarget.dataset.items;
        console.log(items)
        qaList = qaList.map(obj=>{
            if(obj._id == item._id){
                obj.value = items.id
            }
            return obj;
        })
        console.log(qaList)
        this.setData({
            qaList2:qaList
        })
    },
    submit(){
        if(!app.globalData.userInfo.isMember){
            this.setData({
                loginShow:true
            })
            return
        }
        if(!this.data.username){
            wx.showToast({
              title: '请输入学生姓名',
              icon:'none'
            })
            return
        }
        if(!this.data.userclass){
            wx.showToast({
              title: '请输入学生班级',
              icon:'none'
            })
            return
        }
        var info = true;
        this.data.qaList.forEach(element => {
            if(!element.value){
                info = false
            }
        });
        if(!info){
            wx.showToast({
              title: '请完成上面选择',
              icon:'none'
            })
            return
        }
        var data ={
            username:this.data.username,
            userclass:this.data.userclass,
            qa:this.data.qaList,
            text:this.data.text,
            show:'1',
            type:'result'
        }
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this =this;
        wx.cloud.callFunction({
            name: 'userinfo',
            data: data
        }).then(res => {
            wx.hideLoading()
            if (res.errMsg == "cloud.callFunction:ok") {
                console.log(res)
                wx.showToast({
                    title: '提交成功',
                  })
                  setTimeout(res=>{
                    _this.setData({
                        start:2,
                        textview:0
                    })
                  },500)
                
            } else {
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    submit2(){
        if(!this.data.region[0]){
            wx.showToast({
                title: '请选择您当前位置',
                icon:'none'
              })
            return
        }
        var info = true;
        this.data.qaList2.forEach(element => {
            if(!element.value){
                info = false
            }
        });
        if(!info){
            wx.showToast({
              title: '请完成上面选择',
              icon:'none'
            })
            return
        }
        if (!this.data.usermobile){
            wx.showToast({
                title: '请输入手机号码！',
                icon: 'none'
            })
            return
        }
        if (!app.common.isMobilePhone(this.data.usermobile)){
            wx.showToast({
                title: '请输入正确的手机号码！',
                icon: 'none'
            })
            return
        }
        var data ={
            username:this.data.username,
            userclass:this.data.userclass,
            usermobile:this.data.usermobile,
            qa:this.data.qaList2,
            text:this.data.text2,
            show:'2',
            type:'result',
            address:this.data.region[0]+'-'+this.data.region[1]+'-'+this.data.region[2]
        }
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var _this =this;
        wx.cloud.callFunction({
            name: 'userinfo',
            data: data
        }).then(res => {
            wx.hideLoading()
            if (res.errMsg == "cloud.callFunction:ok") {
                console.log(res)
                wx.showToast({
                  title: '提交成功',
                })
                
                wx.redirectTo({
                  url: '/pages/detail/detail',
                })
            } else {
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
        console.log(data)
    },
    // 截获竖向滑动
    catchTouchMove:function(res){
        return false
    },
    
    /**提交数据 */
    validateCodeBtn(){
        var mobile = this.data.mobile;
        var v_code = this.data.v_code;
        if (!mobile){
            wx.showToast({
                title: '请输入手机号码！',
                icon: 'none'
            })
            return
        }
        if (!app.common.isMobilePhone(mobile)){
            wx.showToast({
                title: '请输入正确的手机号码！',
                icon: 'none'
            })
            return
        }
        if (!v_code) {
            wx.showToast({
                title: '请输入验证码！',
                icon: 'none'
            })
            return
        }
        
        this.validateCodeFunc()
    },
    mobileInput(e){
        this.setData({
            mobile: e.detail
        })
    },
    vcodeInput(e) {
        this.setData({
            v_code: e.detail
        })
    },
    // 倒计时
    countdownFn() {
        var that = this
        if (that.data.second > 0) return;
        var second = 120;
        timePromise = setInterval(() => {
            if (second <= 0) {
                clearInterval(timePromise);
                timePromise = undefined;
            } else {
                second--;
                that.setData({
                    second: second<=0?0:second
                })
            }
        }, 1000);
    },
     // 获取二维码
     getCode(){
        var _this = this;
        var mobile = this.data.mobile;
        if (!mobile) {
            wx.showToast({
                title: '请输入手机号码！',
                icon: 'none'
            })
            return
        }
        if (!app.common.isMobilePhone(mobile)) {
            wx.showToast({
                title: '请输入正确的手机号码！',
                icon:'none'
            })
            return
        }
        if (this.data.second > 0) return;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        /**倒计时 */
        wx.cloud.callFunction({
            name: 'zhenzisms',
            data: {
                $url: 'sendCode',
                apiUrl: 'https://sms_developer.zhenzikj.com',
                message: '您的验证码为:${code}',
                number: mobile,
                seconds: 60,
                length: 6
            }
        }).then((res) => {
            res = res.result
            wx.hideLoading()
            if (res.code == "success") {
                _this.countdownFn()
                wx.showToast({
                    title: '发送成功!',
                    icon:"success"
                })
            }else{
                wx.showModal({
                    content: res.msg,
                    showCancel: false
                })
            }
            console.log(res.msg);
            }).catch((err) => {
                console.log('err', err)
                wx.hideLoading()
                wx.showModal({
                    content: '网络错误！',
                    showCancel: false
                })
            });
    },
    // 验证
    validateCodeFunc() {
        var _this = this;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        var mobile = this.data.mobile;
        var v_code = this.data.v_code;
        wx.cloud.callFunction({
            name: 'zhenzisms',
            data: {
                $url: 'validateCode',
                apiUrl: 'https://sms_developer.zhenzikj.com',
                number: mobile,
                code: v_code
            }
        }).then((res) => {
            res = res.result
            if (res.code == "success") {
                var data_info = {
                    code_mobile_creare_time: app.common.getNewTime(),
                    code_mobile: mobile,
                    isMember:1,
                    code_v_code: v_code,
                    type: 1,
                }
                wx.cloud.callFunction({
                    name: 'userinfo',
                    data: data_info
                }).then(async res => {
                    wx.hideLoading()
                    if (res.errMsg == "cloud.callFunction:ok") {
                        
                        wx.showToast({
                            title: '注册成功!',
                            icon: "success"
                        })
                        var userInfo = _this.data.userInfo;
                        userInfo.code_mobile = mobile;
                        if(res.result.stats.student){
                            _this.setData({
                                userInfo: userInfo,
                                loginShow: false,
                                current:1
                            })
                        }else{
                            _this.setData({
                                userInfo: userInfo,
                                loginShow: false
                            })
                            wx.navigateTo({
                              url: '/pages/search/search'
                            })
                        }
                        
                    } else {
                        wx.showModal({
                            content: res.errMsg,
                            showCancel: false
                        })
                    }
                })
            } else {
                wx.hideLoading()
                wx.showModal({
                    content: res.msg,
                    showCancel: false
                })
            }
        }).catch((e) => {
            wx.hideLoading()
            wx.showModal({
                content: '网络错误！',
                showCancel: false
            })
        });
    },
    // 获取手机号码
    getPhoneNumber: function(e) {
        console.log(e)
        if (!e.detail.encryptedData) {
                wx.showModal({
                content: '请允许获取手机号信息！',
                showCancel: false
            })
            return
        }
        var _this =this;
		wx.showLoading({
			title: '加载中',
			mask: true
		});
        wx.cloud.callFunction({
            name: 'openapi',
            data: {
                action: 'getcellphone',
                id: e.detail.cloudID,
            }
        }).then(res => {
            wx.hideLoading();
            console.log('res: ', res)
            if(res.errMsg=='cloud.callFunction:ok'){
                var userInfo = _this.data.userInfo
                userInfo.phoneNumber=res.result.list[0].data.phoneNumber||res.result.list[0].data.purePhoneNumber;
                
                _this.setData({
                    userInfo: userInfo,
                    loginShow: false
                })
            }else{
                wx.showModal({
                    content: res.errMsg,
                    showCancel: false
                })
            }
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let shareObj = {
            title: '',
            imageUrl: 'https://6465-demo-45za6-1301766206.tcb.qcloud.la/share-icon.png?sign=24f6e07c86389e8e97360a8d26a8c959&t=1586172640',
            // path: res.webViewUrl||appConfig.sharePath||'',
            path: "/pages/home/home",
        }
        return shareObj;
    }
})