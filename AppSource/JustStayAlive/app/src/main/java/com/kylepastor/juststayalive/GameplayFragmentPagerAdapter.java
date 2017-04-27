package com.kylepastor.juststayalive;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.PagerAdapter;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

public class GameplayFragmentPagerAdapter extends FragmentPagerAdapter {

    private static int totalMenu = 3;

    public GameplayFragmentPagerAdapter(FragmentManager fm) {
        super(fm);
    }

    @Override
    public Fragment getItem(int position) {
        switch (position){
            case 0:
                return GroupSkillsFragment.newInstance();
            case 1:
                return BaseSkillsFragment.newInstance();
            case 2:
                return ClassSkillsFragment.newInstance();

            default:
                return null;
        }
    }

    @Override
    public int getCount() {
        return totalMenu;
    }




}