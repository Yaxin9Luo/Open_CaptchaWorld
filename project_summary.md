# CAPTCHA Puzzle Benchmark - Project Summary

## Overview

The CAPTCHA Puzzle Benchmark is a web-based environment designed for testing and benchmarking Multimodal LLM (Large Language Model) Agents on CAPTCHA-style puzzles. The system presents various types of CAPTCHA challenges that test AI systems' capability to interpret, reason about, and interact with visual content.

## Project Structure

```
├── app.py                   # Main Flask application server
├── manage_captchas.py       # Command-line tool for managing CAPTCHA puzzles
├── rotate_images.py         # Utility for creating rotation puzzles
├── requirements.txt         # Python dependencies
├── benchmark_results.json   # Logs of benchmark attempts
├── README.md                # Project documentation
│
├── static/                  # Static web assets
│   ├── css/
│   │   └── style.css        # CSS styling for the web interface
│   └── js/
│       └── script.js        # Frontend JavaScript logic
│
├── templates/               # Flask HTML templates
│   └── index.html           # Main page template
│
└── captcha_data/            # CAPTCHA puzzle data organized by type
    ├── Dice_Count/
    ├── Geometry_Click/
    ├── Rotation_Match/
    ├── Slide_Puzzle/
    ├── Unusual_Detection/
    ├── Image_Recognition/
    ├── Bingo/
    ├── Image_Matching/
    └── Patch_Select/
```

## Dependencies

### Python Dependencies
- Flask (2.0.1) - Web framework
- Werkzeug (2.0.2) - WSGI utility library
- Flask-CORS (3.0.10) - Cross-Origin Resource Sharing extension
- Pillow (9.4.0) - Image processing library

### Frontend Dependencies
The project uses vanilla JavaScript without external libraries for the frontend.

## Core Components and Their Interactions

### Backend (Python)

1. **app.py**
   - Main Flask application controller
   - Handles HTTP routes and API endpoints
   - Key endpoints:
     - `/` - Serves the main page
     - `/api/get_puzzle` - Returns a random or specified puzzle
     - `/api/check_answer` - Validates user answers
     - `/api/benchmark_results` - Records benchmark attempts
     - `/api/types` - Lists available CAPTCHA types

2. **manage_captchas.py**
   - Command-line tool for puzzle management
   - Provides functionality to:
     - List CAPTCHA types
     - Add new CAPTCHA types
     - Add new puzzles to existing types
     - List all puzzles for a specific type

3. **rotate_images.py**
   - Utility for creating rotation-based CAPTCHAs
   - Generates rotated versions of objects
   - Creates puzzles requiring alignment to reference images

### Frontend (JavaScript/HTML)

1. **index.html**
   - Main interface template
   - Contains containers for:
     - CAPTCHA image display
     - User input controls
     - Benchmark statistics

2. **script.js**
   - Handles frontend logic including:
     - Loading puzzles
     - Puzzle UI customization based on type
     - User interaction handlers
     - Answer submission
     - Benchmark statistics tracking

3. **style.css**
   - Styles for all UI components
   - Responsive design elements
   - Special styling for different CAPTCHA types

## CAPTCHA Types and Implementation Details

The project supports multiple types of CAPTCHA puzzles, each with specific UI requirements and validation logic:

1. **Dice_Count**
   - **Description**: Users count the sum of numbers on multiple dice
   - **Input Type**: number
   - **Files**: captcha_data/Dice_Count/

2. **Geometry_Click**
   - **Description**: Users click on specific geometric shapes
   - **Input Type**: click (coordinates)
   - **Files**: captcha_data/Geometry_Click/

3. **Rotation_Match**
   - **Description**: Users rotate an object to match a reference orientation
   - **Input Type**: rotation (angle selection)
   - **Files**: captcha_data/Rotation_Match/
   - **Special Files**: rotate_images.py (creates rotation puzzles)

4. **Slide_Puzzle**
   - **Description**: Users drag a component to the correct position
   - **Input Type**: slide (position)
   - **Files**: captcha_data/Slide_Puzzle/

5. **Unusual_Detection**
   - **Description**: Users identify unusual items in a grid
   - **Input Type**: multiselect
   - **Files**: captcha_data/Unusual_Detection/

6. **Image_Recognition**
   - **Description**: Users select images matching a description
   - **Input Type**: image_grid
   - **Files**: captcha_data/Image_Recognition/

7. **Bingo**
   - **Description**: Users swap positions to line up matching images
   - **Input Type**: bingo_swap
   - **Files**: captcha_data/Bingo/

8. **Image_Matching**
   - **Description**: Users match images using arrow controls
   - **Input Type**: image_matching
   - **Files**: captcha_data/Image_Matching/

9. **Patch_Select**
   - **Description**: Users select grid squares containing specific objects
   - **Input Type**: patch_select
   - **Files**: captcha_data/Patch_Select/

## Key Data Structures

### Ground Truth Format
Each CAPTCHA type has a `ground_truth.json` file defining correct answers:

```json
{
  "image1.png": {
    "answer": "value",
    "description": "Description of the puzzle"
  }
}
```

Special fields may exist for different puzzle types, such as:
- `sum` for Dice_Count
- `correct_angle` for Rotation_Match
- `correct_patches` for Patch_Select

### Benchmark Results Format
Results are stored in `benchmark_results.json`:

```json
[
  {
    "puzzle_type": "Dice_Count",
    "puzzle_id": "dice1.png",
    "user_answer": "15",
    "correct_answer": "15",
    "is_correct": true,
    "timestamp": "2023-05-22T14:30:22.123Z"
  }
]
```

## Application Flow

1. **Server Initialization**
   - Flask app starts on port 5001
   - CAPTCHA types and puzzles are loaded

2. **Frontend Initialization**
   - Page loads and requests a random puzzle from `/api/get_puzzle`
   - UI is dynamically configured based on puzzle type

3. **User Interaction**
   - User interacts with the puzzle (clicking, typing, dragging, etc.)
   - Frontend handles puzzle-specific interactions

4. **Answer Submission**
   - User submits an answer
   - Answer is sent to `/api/check_answer` for validation
   - Result is displayed and recorded
   - A new puzzle is automatically loaded

5. **Benchmark Recording**
   - Results are stored in `benchmark_results.json`
   - Frontend statistics are updated

## Extending the System

### Adding New CAPTCHA Types
1. Create a directory under `captcha_data/`
2. Add puzzle images
3. Create a `ground_truth.json` file with answers
4. The system will automatically include the new type

### Adding New Puzzles
Use the command-line tool:
```bash
python manage_captchas.py add-puzzle Dice_Count /path/to/new_dice.png 42
```

## Debugging Information

For debugging purposes, the application provides:
1. A debug mode flag in script.js (currently set to `false`)
2. Debug info in API responses
3. Console logging for key events
4. Access to ground truth data through the API (for testing)

## Important File Locators

- **Main Application**: app.py
- **Frontend Logic**: static/js/script.js
- **Styling**: static/css/style.css
- **HTML Template**: templates/index.html
- **CAPTCHA Data**: captcha_data/[TYPE]/
- **Benchmark Results**: benchmark_results.json
- **CAPTCHA Management Tool**: manage_captchas.py
- **Rotation Utility**: rotate_images.py 