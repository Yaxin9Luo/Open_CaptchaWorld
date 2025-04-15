# CAPTCHA Puzzle Benchmark Project Summary

## Project Overview
The CAPTCHA Puzzle Benchmark is a web application designed to test and evaluate multimodal LLM agents on various CAPTCHA-style puzzles. It provides a framework for creating, managing, and solving different types of visual puzzles that require perception and reasoning capabilities. The system presents random puzzles to users or agents, records their answers, and tracks performance metrics.

## Project Structure

```
CAPTCHA-Puzzle-Benchmark/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── manage_captchas.py      # CLI tool for managing CAPTCHA puzzles
├── rotate_images.py        # Utility for creating rotation puzzles
├── benchmark_results.json  # Log of user/agent attempts
├── static/                 # Static assets
│   ├── css/                
│   │   └── style.css       # CSS styling
│   └── js/                 
│       └── script.js       # Frontend JavaScript
├── templates/              
│   └── index.html          # Main HTML template
└── captcha_data/           # CAPTCHA puzzle data
    ├── Dice_Count/         # Dice counting puzzles
    ├── Geometry_Click/     # Geometry shape identification
    ├── Rotation_Match/     # Object rotation puzzles
    ├── Slide_Puzzle/       # Position slider puzzles
    ├── Unusual_Detection/  # Unusual item detection
    ├── Image_Recognition/  # Image recognition puzzles
    ├── Bingo/              # Bingo-style matching
    ├── Image_Matching/     # Image matching puzzles
    ├── Patch_Select/       # Grid patch selection
    ├── Dart_Count/         # Dart counting puzzles
    ├── Object_Match/       # Object matching puzzles
    ├── Select_Animal/      # Animal selection puzzles
    ├── Coordinates/        # Coordinate positioning puzzles
    └── Path_Finder/        # Path finding puzzles
```

## Dependencies
The project has the following key dependencies:

```
flask==2.0.1           # Web framework
werkzeug==2.0.2        # WSGI utilities
flask-cors==3.0.10     # Cross-origin resource sharing
pillow==9.4.0          # Image processing
```

## Key Components and Function Calling Logic

### Backend (Python)

#### 1. Core Application (`app.py`)
- Implements a Flask web server (port 5001)
- Main routes:
  - `/` - Serves the main web interface
  - `/api/get_puzzle` - Returns a random puzzle or a puzzle of specified type
  - `/api/check_answer` - Validates user answers
  - `/api/benchmark_results` - Records attempt results
   - `/api/types` - Returns available CAPTCHA types
  - `/captcha_data/<type>/<filename>` - Serves puzzle images

Key functions:
- `load_ground_truth(captcha_type)`: Loads puzzle data and answers
- `get_captcha_types()`: Returns available puzzle categories
- `get_puzzle()`: Selects and prepares puzzles for the frontend
- `check_answer()`: Validates submitted answers against ground truth

#### 2. CAPTCHA Management (`manage_captchas.py`)
CLI tool for managing CAPTCHA puzzles with commands:
- `list-types`: Lists all available CAPTCHA types
- `add-type`: Creates a new CAPTCHA category
- `add-puzzle`: Adds a new puzzle to a category
- `list-puzzles`: Lists all puzzles in a category

Key functions:
- `list_captcha_types()`: Returns all CAPTCHA categories
- `add_captcha_type(type_name)`: Creates a new category
- `add_puzzle(type_name, image_path, answer, description)`: Adds a new puzzle
- `list_puzzles(type_name)`: Lists puzzles in a category

#### 3. Rotation Puzzle Creator (`rotate_images.py`)
Utility for creating rotation-based puzzles:
- `rotate`: Creates rotated versions of an image
- `puzzle`: Creates a rotation puzzle entry
- `set`: Creates a complete set (rotated images + puzzle configuration)

Key functions:
- `create_rotated_versions(image_path, name_prefix, angles)`: Generates rotated images
- `create_puzzle(reference_image, object_image, correct_angle)`: Creates a puzzle definition
- `create_complete_set(reference_image, object_image, correct_angle)`: Complete puzzle setup

### Frontend (JavaScript/HTML)

#### 1. User Interface (`index.html`)
Simple responsive interface with:
- Title and benchmark stats (total, correct, accuracy)
- Puzzle display area
- Input controls (based on puzzle type)
- Submit button and result message

#### 2. Client-side Logic (`script.js`)
Handles all frontend functionality:
- Puzzle loading and display
- Different input methods:
  - Text/number input for basic puzzles
  - Click detection for geometry puzzles
  - Rotation controls for rotation puzzles
  - Sliding controls for position puzzles
  - Grid selection for unusual detection
  - Multiple selection for recognition puzzles
  - Image swapping for bingo puzzles
- Answer validation and result display
- Benchmark statistics tracking

Key functions:
- `loadNewPuzzle()`: Fetches and displays a new puzzle
- `submitAnswer()`: Submits the user's answer
- Various input handling: `handleImageClick()`, `setupRotationControls()`, `setupSlidePuzzle()`, etc.
- `recordBenchmarkResult(result)`: Logs attempt results

## Data Structure

### CAPTCHA Data Organization
Each CAPTCHA type has its own directory with:
- Image files for the puzzles
- `ground_truth.json` file with correct answers and metadata

Example ground truth format (varies by puzzle type):
```json
{
  "dice10.png": {
    "sum": 73,
    "description": "Contains multiple dice with numbers that sum to 73"
  },
  "image1.jpg": {
    "answer": "fox",
    "description": "Image containing a fox"
  }
}
```

### Benchmark Results
Results are stored in `benchmark_results.json` as a series of JSON objects:
```json
{
  "puzzle_type": "Dice_Count",
  "puzzle_id": "dice10.png",
  "user_answer": "73",
  "correct_answer": 73,
  "correct": true,
  "timestamp": "2025-04-11T08:48:02.423Z"
}
```

## Puzzle Types and Input Methods

| Puzzle Type | Description | Input Method |
|-------------|-------------|--------------|
| Dice_Count | Count sum of numbers on dice | Number input |
| Geometry_Click | Click on geometric shapes | Image click |
| Rotation_Match | Rotate object to match reference | Rotation controls |
| Slide_Puzzle | Position slider component | Drag slider |
| Unusual_Detection | Find unusual items | Multi-select grid |
| Image_Recognition | Match images to description | Image grid selection |
| Bingo | Swap images to form a line | Cell swapping |
| Image_Matching | Match pairs of images | Arrow selection |
| Patch_Select | Select grid squares with objects | Grid selection |
| Dart_Count | Match dart sum to target | Arrow selection |
| Object_Match | Match object counts | Arrow selection |
| Select_Animal | Select specific animal | Image selection |
| Coordinates | Move object to target position | Arrow controls |

## Function Call Flow

1. **Server Startup**:
   - Flask app initializes
   - Static routes and API endpoints are registered

2. **Initial Page Load**:
   - Client requests the index.html page
   - Page loads with script.js
   - `loadNewPuzzle()` is called automatically

3. **Puzzle Retrieval**:
   - Frontend makes AJAX request to `/api/get_puzzle`
   - Server selects random puzzle type and puzzle
   - Backend prepares puzzle data based on type
   - Frontend receives puzzle data and configures UI

4. **User Interaction**:
   - User interacts with appropriate input method
   - Frontend registers and validates input
   - User submits answer via button or auto-submit

5. **Answer Verification**:
   - Frontend sends answer to `/api/check_answer`
   - Backend compares answer with ground truth
   - Result returned to frontend
   - Frontend displays result and updates stats

6. **Result Recording**:
   - Backend logs attempt to benchmark_results.json
   - Frontend updates displayed statistics
   - New puzzle is automatically loaded

7. **Puzzle Management** (via CLI):
   - Admin can add new puzzles with manage_captchas.py
   - New puzzles are immediately available in rotation

## Extending the Framework
New CAPTCHA types can be added by:
1. Creating a new directory under `captcha_data/`
2. Adding puzzle images
3. Creating a `ground_truth.json` file with answers
4. Updating the input handling in `app.py` and `script.js`

## Usage Guide

### Running the Application

```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py

# Access the application
# Open browser to http://localhost:5001
```

### Managing CAPTCHA Puzzles

```bash
# List available CAPTCHA types
python manage_captchas.py list-types

# Add a new puzzle to an existing type
python manage_captchas.py add-puzzle Dice_Count /path/to/image.png 42

# List all puzzles for a type
python manage_captchas.py list-puzzles Dice_Count
```

## Conclusion

The CAPTCHA Puzzle Benchmark provides a flexible framework for testing AI agents' ability to solve visual and interactive puzzles. Its modular design allows for easy extension with new puzzle types and integration into broader evaluation systems. 