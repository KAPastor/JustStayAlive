package com.kylepastor.juststayalive;


import android.util.Log;
import android.view.View;

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
        // Need to now contact the server methods to:
        // 1. See if the game ID exists -> Return error;
        // 2. If game ID is free assign it -> Then
        //  a) Add player as host of the game

        JSA_WebAPI_Transaction pass_user_request = new JSA_WebAPI_Transaction(v.getContext()); // can add params for a constructor if needed
        pass_user_request.execute("http://192.168.0.196:3000/checkGameID?game_ID=test");
        return "lol";
    }
}
