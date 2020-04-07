

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
   var userlist = await db.collection('db_userinfo').get()
   userlist = userlist.data||[]
    var res={}, t,aaa=[];
   for(let i=0;i<userlist.length;i++){
       if(userlist[i].code_mobile){
           var data ={}
           data.updata_time = db.serverDate();
           t = await db.collection('db_teacher').where({
                mobile: userlist[i].code_mobile,
                status: 1
            }).get()
            if (t.data.length) {
                data.teacher = t.data[0];
                data.student = 0;
                res = await db.collection('db_userinfo').where({
                    openId: userlist[i].openId
                }).update({
                    data: data
                })
                res.event = data
                res.t =t
            }else{
                
                data.student = 1;
                res = await db.collection('db_userinfo').where({
                    openId: userlist[i].openId
                }).update({
                    data: data
                })
                res.event = data
            }
       }
    }

    return {
        res:res
    };
}