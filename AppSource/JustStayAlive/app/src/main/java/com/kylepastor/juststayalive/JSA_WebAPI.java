package com.kylepastor.juststayalive;


import android.util.Log;

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
}
