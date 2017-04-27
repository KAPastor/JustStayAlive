package com.kylepastor.juststayalive;

import android.content.DialogInterface;
import android.content.res.AssetManager;
import android.graphics.Paint;
import android.os.Bundle;
import android.os.Parcelable;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentTransaction;
import android.support.v7.app.AlertDialog;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.opencsv.CSVReader;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public  class LobbyFragment extends Fragment {
    public static LobbyFragment newInstance(){
        LobbyFragment frag = new LobbyFragment();
        return frag;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                            Bundle savedInstanceState) {
        // Grab the root view which represents everything on the fragment itself
        View rootView = (View) inflater.inflate(R.layout.lobby_fragment, container, false);


        Button join_game_button = (Button) rootView.findViewById(R.id.join_game_button);
        join_game_button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                // Create fragment and give it an argument specifying the article it should show
                JoinGameFragment joinFragment = new JoinGameFragment();
                FragmentTransaction transaction = getActivity().getSupportFragmentManager().beginTransaction();
                transaction.setCustomAnimations(R.anim.enter_from_right, R.anim.exit_to_left);

                transaction.replace(R.id.fragment_container, joinFragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        });

        Button create_game_button = (Button) rootView.findViewById(R.id.create_game_button);
        create_game_button.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                // Create fragment and give it an argument specifying the article it should show
                CreateGameFragment createFragment = new CreateGameFragment();
                FragmentTransaction transaction = getActivity().getSupportFragmentManager().beginTransaction();
                transaction.setCustomAnimations(R.anim.enter_from_right, R.anim.exit_to_left);

                transaction.replace(R.id.fragment_container, createFragment);
                transaction.addToBackStack(null);
                transaction.commit();
            }
        });


        return rootView;
    }



    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
    }
}




