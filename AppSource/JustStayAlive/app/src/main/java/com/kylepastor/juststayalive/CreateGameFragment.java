package com.kylepastor.juststayalive;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;

public  class CreateGameFragment extends Fragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                            Bundle savedInstanceState) {
        // Grab the root view which represents everything on the fragment itself
        final View rootView = (View) inflater.inflate(R.layout.create_game_fragment, container, false);



        // Instance the api
        final JSA_WebAPI myAPI_conn = new JSA_WebAPI();

        // Set up the click events on join to start with the calls to the API
        Button create_game_button = (Button) rootView.findViewById(R.id.create_game_button);
        create_game_button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                // Need to collect the text from the textEdit elements and do quick error checking.
                // Then use these inputs to call to the API to create a game.
                EditText gameID_et = (EditText)rootView.findViewById(R.id.gameID_editText);
                String gameID = gameID_et.getText().toString();

                EditText player_name_et = (EditText)rootView.findViewById(R.id.player_name_editText);
                String player_name = player_name_et.getText().toString();
                // DO ERROR CHECKING ON INPUT HERE

                Log.d("test",gameID);
                Log.d("test",player_name);

                // Now that we have the player name and game ID request we call the API method
                String  create_return = myAPI_conn.create_game(rootView,gameID,player_name);
                Log.d("adaaaaaaaa0",create_return);
            }
        });





        return rootView;
    }


    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
    }
}




