package com.kylepastor.juststayalive;

import android.content.DialogInterface;
import android.content.res.AssetManager;
import android.graphics.drawable.Drawable;
import android.support.v4.app.Fragment;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
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


// BASE SKILL FRAGMENT:  This class shows the basic skills and UI for the actions a player may take.
// The class should be flexible enough to allow random character classes to be loaded in based on
// values in a local CSV file deligated by the web API.
public  class BaseSkillsFragment extends Fragment {
    // When creating the viewpager we must pass back an instance of the fragment so we can make changes
    public static BaseSkillsFragment newInstance(){
        BaseSkillsFragment frag = new BaseSkillsFragment();
        return frag;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                            Bundle savedInstanceState) {
        // Grab the root view which represents everything on the fragment itself
        View rootView = (View) inflater.inflate(R.layout.base_skills_fragment, container, false);

        // Next we need to set the character class assets based on the input csv (or string definition
        // given by the API)
        String class_name = ((GameplayActivity)getActivity()).getCharacterClass();
        setClassAssets(class_name,rootView);

        // Set the various click events for the base skills buttons
        setClassClickEvents(rootView);

        return rootView;
    }


    // Set Class Assets: Is public and is responsible for the building of the class UI and details
    public void setClassAssets(String class_name,View rootView){
        // Open the asset manager so we can grab the local csv files that define the build
        AssetManager assetManager = getContext().getAssets();
        try {
            // Open and read an input steam and parse the csv based on the input string
            InputStream csvStream = assetManager.open(class_name + ".csv");
            InputStreamReader csvStreamReader = new InputStreamReader(csvStream);
            CSVReader csvReader = new CSVReader(csvStreamReader);

            // Each line is parsed with the CSV reader class and then we make the adjustments to the assets
            String[] line;
            TextView text;
            Button button;
            ImageView imageView;

            // Load and read the CSV and update the view.  Can be extended later if need be.
            while ((line = csvReader.readNext()) != null) {
                switch (line[0]) {
                    case "class_name":
                        text = (TextView) getActivity().findViewById(R.id.class_name);
                        text.setText(line[1]);
                    case "class_main_image":
                        imageView = (ImageView) rootView.findViewById(R.id.class_image);
                        int imageResource = rootView.getResources().getIdentifier(line[1], "drawable", getContext().getPackageName());
                        imageView.setImageResource(imageResource);
                    case "health":
                        text = (TextView) getActivity().findViewById(R.id.health_points);
                        text.setText(line[1]);
                    case "consumption":
                        text = (TextView) getActivity().findViewById(R.id.consumption);
                        text.setText(line[1]);
                    case "private_gather":
                        button = (Button) rootView.findViewById(R.id.gather_private_button);
                        button.setText("Gather " + line[1] + " private resources");
                    case "group_gather":
                        button = (Button) rootView.findViewById(R.id.group_resource_button);
                        button.setText("Gather " + line[1] + " group resources");
                    case "attack":
                        button = (Button) rootView.findViewById(R.id.attack_button);
                        button.setText("Attack someone for " + line[1] + " damage");
                    case "heal":
                        button = (Button) rootView.findViewById(R.id.heal_button);
                        button.setText("Heal " + line[1] + " HP");
                    default:
                        Log.d("setClassAssets ERROR:",line[1]);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    };

    // Set Class Click Events: These link the button press with the dialogs and API web calls
    public void setClassClickEvents(View rootView){
        Button gather_private= (Button) rootView.findViewById(R.id.gather_private_button);
        gather_private.setOnClickListener(new View.OnClickListener() {
            public void onClick(View view) {
                final View v;
                v = view;
                AlertDialog.Builder builder = new AlertDialog.Builder(view.getContext());
                builder.setTitle("PRIVATE GATHER");
                builder.setMessage("safsdfs")
                        .setCancelable(true)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                UpdateUserAction pass_user_request = new UpdateUserAction(v.getContext()); // can add params for a constructor if needed
                                pass_user_request.execute("http://192.168.0.191:3000/notes");
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
    }
}




