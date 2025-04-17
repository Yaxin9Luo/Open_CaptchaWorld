# CAPTCHAs Project Summary

## Overview

This project is a web-based environment for testing and benchmarking Multimodal LLM Agents on CAPTCHA-style puzzles. It provides a platform to evaluate and compare how artificial intelligence systems perform on a variety of visual puzzles that are similar to CAPTCHAs (Completely Automated Public Turing tests to tell Computers and Humans Apart).

## Project Structure

```
CAPTCHAs/
├── app.py                    # Main Flask application
├── manage_captchas.py        # CLI tool for managing CAPTCHA data
├── rotate_images.py          # Utility for generating rotated images
├── benchmark_results.json    # Record of benchmark results
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
├── captcha_data/             # Directory containing CAPTCHA types and puzzles
│   ├── Dice_Count/          
│   ├── Geometry_Click/       
│   ├── Rotation_Match/       
│   ├── Slide_Puzzle/         
│   ├── Unusual_Detection/    
│   ├── Image_Recognition/    
│   ├── Bingo/                
│   ├── Image_Matching/       
│   ├── Patch_Select/         
│   ├── Dart_Count/           
│   ├── Object_Match/         
│   ├── Select_Animal/        
│   ├── Coordinates/          
│   ├── Path_Finder/          
│   ├── Place_Dot/            
│   ├── Connect_icon/         
│   ├── Click_Order/          
│   ├── Hold_Button/          
│   └── Misleading_Click/     
├── static/                   # Static assets
│   ├── css/
│   │   └── style.css         # CSS styling
│   └── js/
│       └── script.js         # Frontend JavaScript code
└── templates/                # HTML templates
    └── index.html            # Main application page
```

## Dependencies

The project relies on the following Python packages:
- Flask (v2.0.1): Web framework
- Werkzeug (v2.0.2): WSGI utility library
- Flask-CORS (v3.0.10): Cross-Origin Resource Sharing extension
- Pillow (v9.4.0): Image processing library

Frontend libraries:
- Pure JavaScript (no external frameworks used)
- CSS for styling

## Core Components

### 1. Backend (Flask Application)

The backend is implemented in `app.py` and provides the following functionality:

#### API Endpoints:
- `/` - Serves the main web interface
- `/captcha_data/<captcha_type>/<filename>` - Serves CAPTCHA images
- `/api/get_puzzle` - Returns a random CAPTCHA puzzle
- `/api/check_answer` - Validates user answers
- `/api/get_ground_truth` - Returns ground truth data for debugging
- `/api/benchmark_results` - Records benchmark results
- `/api/types` - Lists available CAPTCHA types

#### Key Functions:
- `load_ground_truth(captcha_type)`: Loads puzzle solutions
- `get_captcha_types()`: Gets available CAPTCHA types
- `get_puzzle()`: Selects and serves a random puzzle
- `check_answer()`: Validates user submissions
- `record_benchmark()`: Records benchmark results

### 2. Frontend

The frontend is implemented with HTML, CSS, and JavaScript:

#### Structure:
- `index.html`: Single-page interface that displays puzzles and collects user input
- `script.js`: Handles UI interactions, CAPTCHA rendering, and answer submission
- `style.css`: Styling for the web interface

#### Key JavaScript Functions:
- `loadNewPuzzle()`: Fetches and displays a new puzzle
- `submitAnswer()`: Sends user answers to the backend
- `setupXXX()`: Set of functions to initialize each puzzle type (e.g., `setupRotationControls()`, `setupSlidePuzzle()`)
- `updateStats()`: Updates the benchmark statistics display

### 3. CAPTCHA Types and Handling

The application supports 20 different types of CAPTCHAs, each with specific handling logic:

1. **Dice_Count**: Count and sum numbers on dice
2. **Geometry_Click**: Click on a specific geometric shape
3. **Rotation_Match**: Rotate an object to match a reference orientation
4. **Slide_Puzzle**: Drag a component to a target position
5. **Unusual_Detection**: Identify unusual items in a grid
6. **Image_Recognition**: Select images matching a description
7. **Bingo**: Swap positions to create a line of matching images
8. **Image_Matching**: Match similar images
9. **Patch_Select**: Select grid squares containing specific objects
10. **Dart_Count**: Select an image where darts sum to a target number
11. **Object_Match**: Match the number of objects to a reference
12. **Select_Animal**: Identify a specific animal in a grid
13. **Coordinates**: Move an object to specified coordinates
14. **Path_Finder**: Navigate to a target position
15. **Place_Dot**: Place a dot at a specific location
16. **Connect_icon**: Connect matching icons
17. **Click_Order**: Click items in a specific sequence
18. **Hold_Button**: Hold a button for a specified duration
19. **Misleading_Click**: Click in the correct area avoiding distractions
20. **Pick_Area**: Select a specific area in an image

### 4. Data Management

CAPTCHA data is managed using the following components:

#### Data Structure:
- Each CAPTCHA type has its own directory in `captcha_data/`
- Each directory contains puzzle images and a `ground_truth.json` file with answers
- Ground truth format varies by puzzle type but typically includes:
  - Correct answer
  - Prompt/question
  - Additional puzzle-specific metadata

#### Management Tool:
The `manage_captchas.py` script provides a CLI for:
- Listing available CAPTCHA types
- Adding new CAPTCHA types
- Adding new puzzles with their solutions
- Listing existing puzzles

## Data Flow and Dependencies

### Application Initialization
1. Flask app initializes and loads available CAPTCHA types
2. Frontend loads and requests a random puzzle

### Puzzle Serving Process
1. Frontend calls `/api/get_puzzle`
2. Backend selects a random CAPTCHA type and puzzle
3. Backend constructs a response with puzzle metadata and UI instructions
4. Frontend renders the appropriate puzzle interface

### Answer Submission Process
1. User interacts with the puzzle interface
2. Frontend collects and formats the answer
3. Answer is submitted to `/api/check_answer`
4. Backend validates the answer against ground truth
5. Result is returned to the frontend
6. Frontend updates stats and loads a new puzzle
7. Benchmark result is recorded to `benchmark_results.json`

## Benchmark Results Storage

Results are stored in `benchmark_results.json` as line-delimited JSON with each entry containing:
- Puzzle type
- Puzzle ID
- User's answer
- Correct answer
- Boolean indicating correctness
- Timestamp

## Extending the System

### Adding New CAPTCHA Types
1. Create a new directory under `captcha_data/`
2. Add puzzle images
3. Create a `ground_truth.json` file with solutions
4. Add handling logic in `app.py` for:
   - Puzzle serving
   - Answer validation
5. Add frontend rendering logic in `script.js`

### Adding New Puzzles
Use the CLI tool:
```
python manage_captchas.py add-puzzle <type_name> <image_path> <answer>
```

Or manually:
1. Add image to the type's directory
2. Update the `ground_truth.json` file with the solution

## Usage Instructions

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the application:
   ```
   python app.py
   ```

3. Access the web interface at `http://localhost:5001`

## Test Environment for LLM Agents

This environment is designed for testing how well multimodal LLM agents can:
1. Perceive and understand visual puzzles
2. Extract relevant information
3. Generate appropriate solutions
4. Interact with web interfaces

The benchmark results can be analyzed to evaluate agent performance across different CAPTCHA types, identifying strengths and areas for improvement. 