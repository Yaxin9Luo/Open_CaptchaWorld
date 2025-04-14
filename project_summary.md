# CAPTCHA Puzzle Benchmark: Project Summary

## Overview
The CAPTCHA Puzzle Benchmark is a web-based environment for testing and benchmarking Multimodal LLM (Large Language Model) Agents on CAPTCHA-style puzzles. The system presents various types of visual challenges that require different interaction methods and cognitive skills to solve, making it an ideal benchmark for testing AI capabilities.

## Project Structure

```
├── app.py                   # Main Flask application
├── benchmark_results.json   # Log of benchmark results
├── captcha_data/            # Directory containing all CAPTCHA puzzles
│   ├── Bingo/               # Bingo puzzle type
│   ├── Dart_Count/          # Dart counting puzzle type  
│   ├── Dice_Count/          # Dice counting puzzle type
│   ├── Geometry_Click/      # Geometry clicking puzzle type
│   ├── Image_Matching/      # Image matching puzzle type
│   ├── Image_Recognition/   # Image recognition puzzle type
│   ├── Patch_Select/        # Patch selection puzzle type
│   ├── Rotation_Match/      # Rotation matching puzzle type
│   ├── Slide_Puzzle/        # Slide puzzle type
│   └── Unusual_Detection/   # Unusual detection puzzle type
├── manage_captchas.py       # CLI tool for managing CAPTCHA puzzles
├── requirements.txt         # Python dependencies
├── rotate_images.py         # Tool for creating rotation puzzles
├── static/                  # Static web assets
│   ├── css/                 # CSS styles
│   │   └── style.css        # Main stylesheet
│   └── js/                  # JavaScript files
│       └── script.js        # Main client-side logic
└── templates/               # HTML templates
    └── index.html           # Main page template
```

## Dependencies

### Backend (Python)
- **Flask (2.0.1)**: Web framework
- **Werkzeug (2.0.2)**: WSGI utility library
- **Flask-CORS (3.0.10)**: Cross-Origin Resource Sharing extension
- **Pillow (9.4.0)**: Image processing library

### Frontend
- **Vanilla JavaScript**: No external JS frameworks
- **CSS**: Custom styling

## CAPTCHA Types and Interactions

The system supports multiple CAPTCHA types, each requiring different interaction methods:

| CAPTCHA Type | Description | Interaction Method |
|--------------|-------------|-------------------|
| Dice_Count | Count the sum of dice values | Number input |
| Geometry_Click | Click on specific geometric shape | Click |
| Rotation_Match | Rotate object to match reference | Rotation controls |
| Slide_Puzzle | Position a component correctly | Dragging |
| Unusual_Detection | Find unusual items in grid | Multiselect |
| Image_Recognition | Select images matching description | Grid selection |
| Bingo | Swap tiles to create matching line | Tile swapping |
| Image_Matching | Match images using arrow controls | Navigation controls |
| Patch_Select | Select grid cells with specific objects | Grid selection |

## Core Components

### Backend (app.py)

The main Flask application provides RESTful endpoints:

1. **`/`**: Serves the main page
2. **`/captcha_data/<captcha_type>/<filename>`**: Serves CAPTCHA images
3. **`/api/get_puzzle`**: Returns a random or specific puzzle
4. **`/api/check_answer`**: Validates submitted answers
5. **`/api/benchmark_results`**: Records benchmark results
6. **`/api/types`**: Lists available CAPTCHA types

Key functions:
- `load_ground_truth()`: Loads answer data for puzzles
- `get_captcha_types()`: Gets available CAPTCHA types
- `get_puzzle()`: Selects and configures puzzles based on type

### Frontend (script.js)

The client-side JavaScript manages the user interface and interactions:

- **Puzzle Loading**: `loadNewPuzzle()` fetches and displays puzzles
- **Answer Submission**: `submitAnswer()` validates and submits answers
- **Type-Specific UI**: Different setup functions for each CAPTCHA type:
  - `setupRotationControls()`: For rotation puzzles
  - `setupSlidePuzzle()`: For slide puzzles
  - `setupUnusualDetectionGrid()`: For unusual detection
  - `setupImageRecognition()`: For image recognition
  - `setupBingoSwap()`: For bingo puzzles
  - `setupImageMatching()`: For image matching
  - `setupPatchSelectGrid()`: For patch selection

### Data Structure (captcha_data/)

Each CAPTCHA type folder contains:
- Image files for the puzzles
- `ground_truth.json` with answers and metadata

Example structure for Dice_Count:
```json
{
  "dice10.png": {
    "sum": 73,
    "description": "Contains multiple dice with numbers that sum to 73"
  }
}
```

## Utility Tools

### manage_captchas.py

CLI tool for managing CAPTCHA puzzles:
- List available CAPTCHA types
- Add new CAPTCHA types
- Add new puzzles to existing types
- List puzzles for a specific type

Usage examples:
```bash
python manage_captchas.py list-types
python manage_captchas.py add-type Text_Recognition
python manage_captchas.py add-puzzle Dice_Count /path/to/new_dice.png 42
```

### rotate_images.py

Tool for creating rotation puzzles:
- Create rotated versions of images at different angles
- Set up rotation puzzles with reference images
- Generate complete puzzle sets

Usage examples:
```bash
python rotate_images.py rotate image.png
python rotate_images.py puzzle reference.png object.png 90
python rotate_images.py set reference.png object.png 90
```

## Data Flow

1. The user/agent accesses the web interface
2. The front-end requests a random puzzle via `/api/get_puzzle`
3. Server selects a puzzle, constructs response with puzzle metadata
4. Front-end sets up appropriate UI based on puzzle type
5. User/agent interacts with the puzzle
6. Answer is submitted via `/api/check_answer`
7. Server validates the answer against ground truth
8. Result is recorded in benchmark_results.json
9. New puzzle is automatically loaded

## Benchmark Results

Results are logged to `benchmark_results.json` with:
- Puzzle type
- Puzzle ID
- User's/agent's answer
- Correct answer
- Whether the answer was correct
- Timestamp

## Extending the Benchmark

New CAPTCHA types can be added by:
1. Creating a new directory under `captcha_data/`
2. Adding puzzle images
3. Creating a `ground_truth.json` file with answers
4. The system will automatically include the new type in random selection 