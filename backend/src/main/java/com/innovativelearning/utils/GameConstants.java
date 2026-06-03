package com.innovativelearning.utils;

public class GameConstants {
    public static final int MAX_PARTICIPANTS = 8;
    public static final int TRACK_LENGTH = 1000;
    public static final int ROOM_CODE_LENGTH = 6;
    public static final int QUESTION_TIME_SECONDS = 60;
    
    public static final int BASE_PROGRESS_NORMAL = 20;
    public static final int BASE_POINTS_NORMAL = 10;
    
    public static final int HELP_TRIGGER_NO_PROGRESS_COUNT = 3;
    public static final int BEHIND_DISTANCE_THRESHOLD = 100;
    public static final int BEHIND_POINTS_THRESHOLD = 30;
    public static final int DIFFICULTY_MIN = 1;
    public static final int DIFFICULTY_MAX = 10;
    public static final int DIFFICULTY_START = 5;
    public static final int DIFFICULTY_STEP_UP = 1;
    public static final int DIFFICULTY_STEP_DOWN = 1;
    
    public static final int DECISION_METER_MAX = 100;
    public static final int DECISION_FILL_PER_SECOND = 1;
    public static final int DECISION_FILL_PER_CORRECT = 2;
    
    public static final int HIGHWAY_PROGRESS_EQUIVALENT = 8;
    public static final int HIGHWAY_POINTS_MULTIPLIER = 3;
    public static final int HIGHWAY_FAIL_FREEZE_SECONDS = 2;
    public static final int HIGHWAY_FREEZE_SECONDS = 2;
    
    public static final int DIRT_ROAD_QUESTION_COUNT = 3;
    public static final int DIRT_ROAD_PROGRESS_PER_CORRECT = 10;
    
    public static final double PUNCTURE_SLOW_PERCENT = 0.5;
    public static final int PUNCTURE_DURATION_SECONDS = 4;
    
    public static final double BOOST_SPEED_MULTIPLIER = 1.5;
    public static final int BOOST_DURATION_SECONDS = 2;
    
    public static final int BEHIND_RANK_THRESHOLD = 3;

    // Added Batch A Constants
    public static final double TRACK_TOTAL_SCORE = 1000.0;
    public static final double SCORE_NORMAL_FRACTION = 20.0;
    public static final double SCORE_DIRT_FRACTION = 45.0;
    public static final double SCORE_HIGHWAY_FRACTION = 8.0;
    public static final int HIGHWAY_QUESTION_COUNT = 2;
    public static final int DIRT_QUESTION_COUNT = 3;
    public static final int LUCK_TRIGGER_QUESTIONS = 3;
    public static final int LUCK_TRIGGER_SECONDS = 180;
    public static final double LUCK_BOOST_MULTIPLIER = 1.5;
    public static final double LUCK_PUNCTURE_MULTIPLIER = 0.5;
}
