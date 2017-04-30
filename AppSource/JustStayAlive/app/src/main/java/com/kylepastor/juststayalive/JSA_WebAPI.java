package com.kylepastor.juststayalive;


import android.util.Log;
import android.view.View;

import java.io.IOException;
import java.util.Random;

// Handles all Web API calls
public class JSA_WebAPI {
    public void init(){
        Log.d("Test","test");
    }


    // Get Character Class: Is responsible for retrieving the users class from the game server
    public String getCharacterClass(){
        // For the time being we will generate a random class string as a placeholder
        String[] class_list = new String[2];
        class_list[0] = "thief";
        class_list[1] = "warrior";
        Random r = new Random();
        int rand_class_id = r.nextInt(2);
        return class_list[rand_class_id];
    }


    // Get Character Class: Is responsible for retrieving the users class from the game server
    public String create_game(View v, String gameID, String player_name){
        JSA_WebAPI_Transaction pass_user_request = new JSA_WebAPI_Transaction(v.getContext()); // can add params for a constructor if needed
        String data = "";
        String API_string = "http://192.168.0.196:3000/createGame?gameID=" + gameID + "&playerName=" + player_name;
        Log.d("ASASD",API_string);
        try {
            data = pass_user_request.execute(API_string).get();
        } catch (Exception e) {
        }
        return data;
    }
}
