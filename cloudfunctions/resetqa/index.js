

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
    var userlist = await db.collection('db_userinfo').get()
    userlist = userlist.data||[];
    var resend=[],res2=[]
    for(let i=0;i<userlist.length;i++){
        var resultRes= await db.collection('db_qa_result').where({
            openId: userlist[i].openId,
            status:1
        }).get()
        res2.push(userlist[i].openId)
        resultRes = resultRes.data||[];
        if(resultRes.length == 2&&!userlist[i].result_qa){
            res = await db.collection('db_userinfo').where({
                openId: userlist[i].openId
            }).update({
                data:{
                    result_qa:1
                }
            })
            resend.push(userlist[i].openId)
        }
    }
    
    return res2;
}