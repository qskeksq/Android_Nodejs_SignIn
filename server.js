var http = require('http');
var mongo = require('mongodb').MongoClient;
var u = require('url');
var qs = require('querystring');

/**
 * 1. url 분석 : pathname -> 쿼리스트링
 * 2. 클라이언트에서 넘겨준 데이터 request에서 받기
 * 3. json으로 넘어온 데이터 자바 객체로 변환 후 id, pw 유효값 확인
 * 4. 확인되었다면 데이터베이스에서 일치하는 정보 찾아오기
 * 5. json으로 db에서 받아온 사용자 정보 response에 담기.
 * 6. 응답 코드, 메시지 담아서 최종 response 응답
 */
var server = http.createServer((request, response)=>{

    // 1.
    var url = u.parse(request.url);
    var cmds = url.pathname.split('/');
    if(cmds[1] == 'signin'){
        // 2.
        var postData = '';
        request.on('data', (data)=>{
            postData += data;
        });
        // 3.
        // 넘어온 데이터가 객체인지 아닌지에 따라서 json으로 처리할 것인지 결정한다!!!!
        request.on('end', ()=>{
            // var query = qs.parse(postData); // postData : id=xxx&pw=1234;
            var query = JSON.parse(postData);
            if(!query.id || !query.pw){
                response.end('Wrond id or password');
            } else {
                // 4.
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

                        // 5 & 6
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