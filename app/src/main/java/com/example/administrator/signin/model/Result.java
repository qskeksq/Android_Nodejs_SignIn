package com.example.administrator.signin.model;

/**
 * Created by Administrator on 2017-10-25.
 */

public class Result {

    public static final String OK = "200";
    public static final String FAIL = "400";



    public String code;
    public String msg;

    public boolean isOk(){
        return OK.equals(code);
    }

}
