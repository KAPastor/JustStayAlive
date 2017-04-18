package com.kylepastor.juststayalive;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Created by Kyle Pastor (Dev) on 2017-04-18.
 */

public class UpdateUserAction extends AsyncTask<String,Integer,String> {
    private Context mContext;
    ProgressDialog s;
    public UpdateUserAction (Context context){
        mContext = context;
    }

    public String getJSON(String url, int timeout) {
        HttpURLConnection c = null;
        try {
            URL u = new URL(url);
            c = (HttpURLConnection) u.openConnection();
            c.setRequestMethod("GET");
            c.setRequestProperty("Content-length", "0");
            c.setUseCaches(false);
            c.setAllowUserInteraction(false);
            c.setConnectTimeout(timeout);
            c.setReadTimeout(timeout);
            c.connect();
            int status = c.getResponseCode();

            switch (status) {
                case 200:
                case 201:
                    BufferedReader br = new BufferedReader(new InputStreamReader(c.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        sb.append(line+"\n");
                    }
                    br.close();
                    return sb.toString();
            }

        } catch (MalformedURLException ex) {
            Logger.getLogger(getClass().getName()).log(Level.SEVERE, null, ex);
        } catch (IOException ex) {
            Logger.getLogger(getClass().getName()).log(Level.SEVERE, null, ex);
        } finally {
            if (c != null) {
                try {
                    c.disconnect();
                } catch (Exception ex) {
                    Logger.getLogger(getClass().getName()).log(Level.SEVERE, null, ex);
                }
            }
        }
        return null;
    }




    @Override
    protected void onPreExecute() {
        /*
         *    do things before doInBackground() code runs
         *    such as preparing and showing a Dialog or ProgressBar
        */
        // Call the waiting dialog box
        s = ProgressDialog.show(mContext, "",
                "Waiting for other players to finish their turns...", true);
    }

    @Override
    protected void onProgressUpdate(Integer... values) {
        /*
         *    updating data
         *    such a Dialog or ProgressBar
        */

    }

    @Override
    protected String doInBackground(String... params) {

        String data = getJSON(params[0],1000000);

        return data;
    }

    @Override
    protected void onPostExecute(String result) {
        /*
         *    do something with data here
         *    display it or send to mainactivity
         *    close any dialogs/ProgressBars/etc...
        */
        Log.d("asasd",result);
        s.dismiss();
    }
}