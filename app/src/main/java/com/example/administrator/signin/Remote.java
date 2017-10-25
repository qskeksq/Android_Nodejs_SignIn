package com.example.administrator.signin;

import android.util.Log;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by Administrator on 2017-10-25.
 */
public class Remote {

    public static String sendPost(String address, String postData) {
        String result = "";
        try {
            URL url = new URL(address);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            // 데이터를 전송
//            String postTemp = "";
//            Set<Map.Entry<String, String>> keySet = postData.keySet();
//            for (Object key : postData.keySet()) {
//                postTemp += "&";
//                postTemp += key + "=" + postData.get(key);
//            }
//            postTemp = postTemp.substring(1);

            con.setDoOutput(true);
            OutputStream os = con.getOutputStream();
            os.write(postData.getBytes());
            os.flush();
            os.close();

            Log.e("코드", con.getResponseCode() + "");
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
        Log.e("결과", result);
        return result;
    }
}