var http = require('http');
var mongo = require('mongodb').MongoClient;
var u = require('url');
var qs = require('querystring');

var server = http.createServer((request, response)=>{

    var url = u.parse(request.url);
    var cmds = url.pathname.split('/');

    if(cmds[1] == 'signin'){
            // post로 넘어온 데이터를 읽는다
            var postData = '';
            request.on('data', (data)=>{
                postData += data;
            });
            // 넘어온 데이터가 객체인지 아닌지에 따라서 json으로 처리할 것인지 결정한다!!!!
            request.on('end', ()=>{
                // var query = qs.parse(postData); // postData : id=xxx&pw=1234;
                var query = JSON.parse(postData);
                if(!query.id || !query.pw){
                    response.end('Wrond id or password');
                } else {
                    // mongo db 주소 구조 = 프로토콜://주소:포트/데이터베이스이름 -> db 변수에 전달
                    mongo.connect("mongodb://localhost:27017/testdb", (err, db)=>{
                        if(err) {
                            response.write(err);
                            response.end();
                        } else {
                            // db 검색
                            console.log(query);
                            var cursor = db.collection('user').find(query); // 쿼리의 구조 = json object
                            // console.log(cursor);
                            // 데이터셋의 처리방법 2가지
                            // 1. forEach : 동기
                            // 2. each : 비동기
                            var resultObj = {
                                code : '',
                                msg : ''
                            }
                            // var result = 'fail';
                            resultObj.code = 400;
                            resultObj.msg = 'fail';
                            cursor.toArray((err, dataSet)=>{
                                if(dataSet.length > 0){
                                    // result = "ok";
                                    resultObj.code = 200;
                                    resultObj.msg = 'ok'
                                }
                                console.log(dataSet);
                                // 보내기 이전에 객체를 string으로 바꿔준다
                                result = JSON.stringify(resultObj);
                                console.log(result);                                
                                response.write(result);
                                response.end();
                            });
                            // db.collection('user').insert({name:'hong', age:19});
                        }
                    });
                }
            });

        var query = qs.parse();
    } else {
        response.end('page not found');
    }
});

server.listen(8090, ()=>{
    console.log('server is running...');
});