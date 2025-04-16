# CAPTCHA Puzzle Benchmark Project Summary

## Project Overview

The CAPTCHA Puzzle Benchmark is a web-based platform designed to test and evaluate the performance of Multimodal LLM Agents on various CAPTCHA-style puzzles. The system presents different types of visual challenges that require understanding and interpreting images, then providing appropriate responses. The platform automatically logs benchmark results, enabling performance analysis across different puzzle types.

## Project Structure

```
.
├── app.py                    # Main Flask application
├── benchmark_results.json    # Log of puzzle attempts and results
├── captcha_data/             # Directory containing all puzzle types and images
│   ├── Bingo/                # Bingo-style puzzles
│   ├── Connect_icon/         # Icon connection puzzles
│   ├── Coordinates/          # Coordinate-based puzzles
│   ├── Dart_Count/           # Dart counting puzzles
│   ├── Dice_Count/           # Dice counting puzzles
│   ├── Geometry_Click/       # Geometry shape recognition puzzles
│   ├── Image_Matching/       # Image matching puzzles
│   ├── Image_Recognition/    # Image recognition puzzles
│   ├── Object_Match/         # Object matching puzzles
│   ├── Patch_Select/         # Patch selection puzzles
│   ├── Path_Finder/          # Path finding puzzles
│   ├── Place_Dot/            # Dot placement puzzles
│   ├── Rotation_Match/       # Rotation matching puzzles
│   ├── Select_Animal/        # Animal selection puzzles
│   ├── Slide_Puzzle/         # Slider puzzles
│   └── Unusual_Detection/    # Unusual item detection puzzles
├── manage_captchas.py        # CLI tool for managing CAPTCHA puzzles
├── requirements.txt          # Project dependencies
├── rotate_images.py          # Utility for creating rotation puzzles
├── static/                   # Static assets
│   ├── css/
│   │   └── style.css         # Main stylesheet
│   └── js/
│       └── script.js         # Main JavaScript file
└── templates/                # HTML templates
    └── index.html            # Main application page
```

## Dependencies

The project relies on the following Python packages:
- Flask (v2.0.1): Web application framework
- Werkzeug (v2.0.2): WSGI utility library for Flask
- Flask-CORS (v3.0.10): Cross-Origin Resource Sharing extension
- Pillow (v9.4.0): Python Imaging Library for image processing

## Key Components

### Backend (Flask Application)

The backend is built with Flask and provides several API endpoints:

1. **Main Endpoints**:
   - `/`: Serves the main HTML page
   - `/captcha_data/<captcha_type>/<filename>`: Serves CAPTCHA images
   - `/captcha_data/<captcha_type>/<subdir>/<filename>`: Serves CAPTCHA images in subdirectories

2. **API Endpoints**:
   - `/api/get_puzzle`: Returns a random puzzle or a puzzle of a specific type
   - `/api/check_answer`: Validates user answers against ground truth
   - `/api/benchmark_results`: Records benchmark results
   - `/api/types`: Lists available CAPTCHA types
   - `/api/get_ground_truth`: Provides ground truth data for debugging

### Frontend

The frontend is built with vanilla JavaScript and CSS:

1. **HTML Structure** (`index.html`):
   - Simple UI with a puzzle display area, prompt, input field, and submission button
   - Statistics display showing total attempts, correct answers, and accuracy

2. **JavaScript Logic** (`script.js`):
   - Handles puzzle loading and display
   - Manages user interactions for different puzzle types
   - Implements specialized UI components for various puzzle types (rotation controls, grid displays, etc.)
   - Submits answers and processes results
   - Updates statistics

3. **CSS Styling** (`style.css`):
   - Responsive design for puzzle display
   - Styling for interactive elements
   - Visual feedback for correct/incorrect answers

### CAPTCHA Types and Interaction Methods

The system supports various CAPTCHA types, each requiring different interaction methods:

| Puzzle Type | Input Type | Description |
|-------------|------------|-------------|
| Dice_Count | number | Calculate the sum of dice values |
| Geometry_Click | click | Click on a specific geometric shape |
| Rotation_Match | rotation | Rotate an object to match a reference direction |
| Slide_Puzzle | slide | Drag a slider component to the correct position |
| Unusual_Detection | multiselect | Select unusual items in an image |
| Image_Recognition | image_grid | Select images matching a description |
| Bingo | bingo_swap | Swap images to align identical ones |
| Image_Matching | image_matching | Match images on left and right |
| Patch_Select | patch_select | Select grid squares containing specific objects |
| Dart_Count | dart_count | Select the correct dart count image |
| Object_Match | object_match | Match number of objects between images |
| Select_Animal | select_animal | Select a specific animal from options |
| Coordinates | image_matching | Move characters to specific positions |
| Path_Finder | image_matching | Navigate through a path |
| Place_Dot | place_dot | Place a dot at the end of a path |

## Data Structure

Each CAPTCHA type has its own directory with:
1. Puzzle images
2. A `ground_truth.json` file containing the correct answers and metadata

Example ground truth structure:
```json
{
  "image1.png": {
    "answer": "captcha text",
    "description": "Description of the puzzle"
  },
  "image2.png": {
    "sum": 25,
    "description": "Contains multiple dice with numbers that sum to 25"
  }
}
```

## Benchmark Results

Results are logged to `benchmark_results.json` in the following format:
```json
{
  "puzzle_type": "Dice_Count",
  "puzzle_id": "dice1.png",
  "user_answer": "42",
  "correct_answer": 42,
  "correct": true,
  "timestamp": "2025-04-11T08:48:02.423Z"
}
```

This enables the analysis of:
- Accuracy per CAPTCHA type
- Response time
- Types of errors made

## Utility Tools

### manage_captchas.py

A command-line utility for managing CAPTCHA puzzles with the following functions:
- List available CAPTCHA types
- Add new CAPTCHA types
- Add new puzzles to existing types
- List puzzles for a specific type

Usage:
```bash
# List available CAPTCHA types
python manage_captchas.py list-types

# Add a new CAPTCHA type
python manage_captchas.py add-type Text_Recognition

# Add a new puzzle
python manage_captchas.py add-puzzle Dice_Count path/to/image.png 42
```

### rotate_images.py

A utility specifically for creating rotation-based puzzles:
- Creates rotated versions of images at specified angles
- Generates puzzle metadata for the Rotation_Match CAPTCHA type
- Combines reference and object images into complete rotation puzzles

Usage:
```bash
# Create a complete rotation puzzle set
python rotate_images.py set reference.png object.png 90
```

## File Dependencies and Call Flow

### Main Application Flow:

1. `app.py` initializes the Flask application and defines routes
2. User accesses the website via the root URL (`/`)
3. `index.html` is served with the basic UI structure
4. `script.js` initializes and calls `/api/get_puzzle` to load a random puzzle
5. Puzzle images are loaded from `/captcha_data/` paths
6. User interacts with the puzzle using the appropriate input mechanism
7. On submission, `script.js` calls `/api/check_answer` to validate the answer
8. Results are displayed to the user and recorded via `/api/benchmark_results`
9. A new puzzle is automatically loaded after a brief delay

### CAPTCHA Management Flow:

1. `manage_captchas.py` is used to add or manage CAPTCHA puzzles
2. New puzzles are added to the appropriate directory in `captcha_data/`
3. Ground truth files are updated with new puzzle information
4. The application automatically includes new puzzles in the random selection

## Key Functionality by File

### app.py
- Flask application setup
- Route definitions
- Puzzle selection logic
- Answer validation
- Result recording

### script.js
- DOM manipulation
- AJAX calls to backend API
- UI interaction handling
- Specialized UI components for each puzzle type
- Statistics tracking

### manage_captchas.py
- CLI interface for CAPTCHA management
- Ground truth file manipulation
- Image file handling

### rotate_images.py
- Image rotation using Pillow
- Generation of rotation puzzles
- Ground truth file creation for rotation puzzles

## Conclusion

The CAPTCHA Puzzle Benchmark is a comprehensive platform for testing and evaluating the performance of AI agents on visual puzzles. Its modular design allows for easy extension with new puzzle types, and the automatic logging of results enables detailed performance analysis. The system supports a wide range of interaction methods, making it suitable for evaluating multimodal AI capabilities across different visual understanding tasks. 