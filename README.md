# Basic Login&Server 구현

## 클라이언트(안드로이드)

### 서버에 요청(outputstream) -> 서버의 응답(inputstream)

```java
 @Override
protected String doInBackground(Void... params) {
    // 1. 로그인 정보를 jsonString으로 서버에 전달
    Sign sign = new Sign();
    sign.id = mEmail;
    sign.pw = mPassword;
    Gson gson = new Gson();
    String jsonString = gson.toJson(sign);
    // 2. 서버의 response jsonString 받음
    String jsonResult = Remote.sendPost("http://192.168.0.244:8090/signin", jsonString);
    return jsonResult;
}

@Override
protected void onPostExecute(final String resultString) {
    // 3. 서버의 응답 내용을 바탕으로 유효 처리
    Result result = new Gson().fromJson(resultString, Result.class);
    if(result.isOk()){
        Toast.makeText(LoginActivity.this, "로그인 성공", Toast.LENGTH_SHORT).show();
    } else {
        Toast.makeText(LoginActivity.this, "로그인 실패", Toast.LENGTH_SHORT).show();
        mPasswordView.setError(getString(R.string.error_incorrect_password));
        mPasswordView.requestFocus();
    }
}
```

### Remote
```java
public static String sendPost(String address, String postData) {
    // 1. URL과 서버에 보낼 값을 인자로 받아 스트림으로 보내준다
    String result = "";
    try {
        URL url = new URL(address);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("POST");
        con.setDoOutput(true);
        OutputStream os = con.getOutputStream();
        os.write(postData.getBytes());
        os.flush();
        os.close();

        // 2. 서버에서 응답코드(메시지)와 json데이터(데이터베이스)를 받는다
        // 통신이 성공인지 체크
        if (con.getResponseCode() == HttpURLConnection.HTTP_OK) {
            // 여기서 부터는 파일에서 데이터를 가져오는 것과 동일
            InputStreamReader isr = new InputStreamReader(con.getInputStream());
            BufferedReader br = new BufferedReader(isr);
            String temp = "";
            while ((temp = br.readLine()) != null) {
                result += temp;
            }
            br.close();
            isr.close();
        } else {
            Log.e("ServerError", con.getResponseCode() + "");
        }
        con.disconnect();
    } catch (Exception e) {
        Log.e("Error", e.toString());
    }
    return result;
}
```

## Nodejs Server
- 1. url 분석 : pathname -> 쿼리스트링
- 2. 클라이언트에서 넘겨준 데이터 request에서 받기
- 3. json으로 넘어온 데이터 자바 객체로 변환 후 id, pw 유효값 확인
- 4. 확인되었다면 데이터베이스에서 일치하는 정보 찾아오기
- 5. json으로 db에서 받아온 사용자 정보 response에 담기.
- 6. 응답 코드, 메시지 담아서 최종 response 응답

```javaScript
var server = http.createServer((request, response)=>{
    // 1. url 분석 : pathname -> 쿼리스트링
    var url = u.parse(request.url);
    var cmds = url.pathname.split('/');
    if(cmds[1] == 'signin'){
        // 2. 클라이언트에서 넘겨준 데이터 request에서 받기
        var postData = '';
        request.on('data', (data)=>{
            postData += data;
        });
        // 3.json으로 넘어온 데이터 자바 객체로 변환 후 id, pw 유효값 확인
        // 넘어온 데이터가 객체인지 아닌지에 따라서 json으로 처리할 것인지 결정한다!!!!
        request.on('end', ()=>{
            // var query = qs.parse(postData); // postData : id=xxx&pw=1234;
            var query = JSON.parse(postData);
            if(!query.id || !query.pw){
                response.end('Wrond id or password');
            } else {
                // 4. 확인되었다면 데이터베이스에서 일치하는 정보 찾아오기
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

                        // 5. json으로 db에서 받아온 사용자 정보 response에 담기.
                        // 6. 응답 코드, 메시지 담아서 최종 response 응답
                        var resultObj = {
                            code : '',
                            msg : ''
                        }
                        resultObj.code = 400;
                        resultObj.msg = 'fail';
                        cursor.toArray((err, dataSet)=>{
                            if(dataSet.length > 0){
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
                    }
                });
            }
        });
        var query = qs.parse();
    } else {
        response.end('page not found');
    }
});
```

## MongoDb
- 1. 설치
- 2. 환경변수 설정(Path에 경로 지정)
- 3. 데이터베이스 서버 띄우기 : server 디렉토리에 data 만들고 'mongod --dbpath data경로' 실행
- 4. 데이터베이스 클라이언트 띄우기 : mongo.exe
- 5. 각종 명령어
    - db.collection.insert({:});
    - db.collection.find();
    - db.student.insert({});
    - db.student.find();
    - switch student(테이블 이름)
    - show tables
    - show databases
    - use 데이터베이스 이름
    - db.user.remove({})
- #참고 : 데이터베이스는 없을 때 연결하면 자동으로 데이터베이스 자체를 생성해줌
