package com.kylepastor.juststayalive;

import android.os.Bundle;
import android.support.v4.view.ViewPager;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
// GameplayActivity handles all of the actual game user interactions and storing of the local state data
public class GameplayActivity extends AppCompatActivity  {
    private String character_class_name;


    private String gameID;
    private String player_name;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Grab the passed game data from create or join fragments
        Bundle b = getIntent().getExtras();
        if(b != null)
            gameID = b.getString("gameID");
            player_name = b.getString("player_name");
            Log.d("GAMEPLAY", gameID);
            Log.d("GAMEPLAY", player_name);


        // Call the webAPI class
        JSA_WebAPI myAPI_conn = new JSA_WebAPI();
        myAPI_conn.init();
        character_class_name = myAPI_conn.getCharacterClass();




        setContentView(R.layout.gameplay_activity);
        // Instantiate a ViewPager and a PagerAdapter.
        ViewPager viewPager = (ViewPager) findViewById(R.id.gameplay_viewpager);
        viewPager.setAdapter(new GameplayFragmentPagerAdapter(getSupportFragmentManager()));
        viewPager.setCurrentItem(1);





        ActionBar actionBar = getSupportActionBar();
        if (actionBar != null) {
            actionBar.hide();
        }

        View decorView = getWindow().getDecorView();
        int uiOptions = View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_FULLSCREEN;
        decorView.setSystemUiVisibility(uiOptions);








    }

    public String getCharacterClass(){
        return character_class_name;
    };


    @Override
    protected void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);


    }


}
