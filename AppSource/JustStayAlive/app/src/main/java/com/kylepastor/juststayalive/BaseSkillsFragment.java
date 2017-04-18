package com.kylepastor.juststayalive;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.os.AsyncTask;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBar;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.app.AlertDialog;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Toast;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;


public  class BaseSkillsFragment extends Fragment {



    public static BaseSkillsFragment newInstance(){
        BaseSkillsFragment frag = new BaseSkillsFragment();
        return frag;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                            Bundle savedInstanceState) {
        View rootView = (View) inflater.inflate(
                R.layout.base_skills_fragment, container, false);


        setSkillClickEvents(rootView);

//        final LinearLayout lol = (LinearLayout) rootView.findViewById(R.id.base_skill_layout);
//
//        final ImageView view1 = (ImageView) rootView.findViewById(R.id.class_image);
//        final ImageView view2 = (ImageView) rootView.findViewById(R.id.class_image_2);
//
//
//        lol.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
////                FlipAnimation flipAnimation = new FlipAnimation(view1,view2);
////                if (view1.getVisibility() == View.GONE) {
////                    flipAnimation.reverse();
////                }else{
////                    view1.startAnimation(flipAnimation);
////                }
//            }
//        });




        return rootView;
    }






    public void setSkillClickEvents(View rootView){
        Button gather_private= (Button) rootView.findViewById(R.id.gather_private_button);
        gather_private.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                UpdateUserAction myTask = new UpdateUserAction(); // can add params for a constructor if needed
                myTask.execute("https://jsonplaceholder.typicode.com/posts/1");


                final View v;
                v = view;
                AlertDialog.Builder builder = new AlertDialog.Builder(view.getContext());
                builder.setTitle("PRIVATE GATHER");
                builder.setMessage("safsdfs")
                        .setCancelable(true)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {




//                                // Call the waiting dialog box
//                                ProgressDialog s = ProgressDialog.show(v.getContext(), "",
//                                        "Waiting for other players to finish their turns...", true);
                            }
                        });
                AlertDialog alert = builder.create();
                alert.show();  //<-- See This!
            }
        });

        Button gather_group= (Button) rootView.findViewById(R.id.group_resource_button);
        gather_group.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                AlertDialog alertDialog = new AlertDialog.Builder(view.getContext()).create(); //Read Update
                alertDialog.setTitle("ACTION GROUP GATHER");
                alertDialog.setMessage("This is where we send your even to the server (or set it for later)");
                alertDialog.show();  //<-- See This!
            }
        });

        Button attack= (Button) rootView.findViewById(R.id.attack_button);
        attack.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                AlertDialog alertDialog = new AlertDialog.Builder(view.getContext()).create(); //Read Update
                alertDialog.setTitle("ACTION ATTACK");
                alertDialog.setMessage("Pull list of players from server");
                alertDialog.show();  //<-- See This!
            }
        });
        Button heal= (Button) rootView.findViewById(R.id.heal_button);
        heal.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                AlertDialog alertDialog = new AlertDialog.Builder(view.getContext()).create(); //Read Update
                alertDialog.setTitle("ACTION HEAL");
                alertDialog.setMessage("Send command to add health to the server for the game");
                alertDialog.show();  //<-- See This!
            }
        });



    }


    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
//
//        // Grab the image view
//        final ImageView view1 = (ImageView) getActivity().findViewById(R.id.class_image);
//        final ImageView view2 = (ImageView) getActivity().findViewById(R.id.class_image_2);
//
//
//        // Now we are going to set a click event listener to see when someone taps the card
//        view1.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                Toast.makeText(getActivity(),"Text!",Toast.LENGTH_SHORT).show();
//
//                FlipAnimation flipAnimation = new FlipAnimation(view1,view2);
//                if (view1.getVisibility() == View.GONE) {
//                    flipAnimation.reverse();
//                }else{
//                    view1.startAnimation(flipAnimation);
//                }
//            }
//        });


    }



    public void omg(){
        Log.d("LOL","ZMG");
    }

}




