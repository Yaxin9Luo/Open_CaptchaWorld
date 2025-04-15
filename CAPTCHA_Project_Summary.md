# CAPTCHA Puzzle Benchmark - Technical Documentation

## Project Overview

The CAPTCHA Puzzle Benchmark is a web-based environment designed for testing and benchmarking Multimodal LLM Agents on various CAPTCHA-style puzzles. The application presents different types of CAPTCHA challenges and records performance metrics to evaluate how effectively agents can solve these challenges.

## Project Structure

### Directory Overview

```
.
├── app.py                    # Main Flask application server
├── benchmark_results.json    # Logging of benchmark results
├── captcha_data/             # Storage for all CAPTCHA puzzle types
│   ├── Bingo/                # Bingo game puzzles
│   ├── Dart_Count/           # Dart counting puzzles
│   ├── Dice_Count/           # Dice counting puzzles
│   ├── Geometry_Click/       # Geometry click-based puzzles
│   ├── Image_Matching/       # Image matching puzzles
│   ├── Image_Recognition/    # Image recognition puzzles
│   ├── Patch_Select/         # Patch selection puzzles
│   ├── Rotation_Match/       # Rotation matching puzzles
│   ├── Select_Animal/        # Animal selection puzzles
│   ├── Slide_Puzzle/         # Sliding puzzle challenges
│   └── Unusual_Detection/    # Unusual item detection puzzles
├── manage_captchas.py        # CLI tool for managing CAPTCHA puzzles
├── requirements.txt          # Python dependencies
├── rotate_images.py          # Utility for rotating puzzle images
├── static/                   # Static web assets
│   ├── css/                  # CSS stylesheets
│   │   └── style.css         # Main stylesheet
│   └── js/                   # JavaScript files
│       └── script.js         # Main client-side logic
└── templates/                # HTML templates
    └── index.html            # Main page template
```

## Core Components

### Backend Architecture (app.py)

The backend is built with Flask and provides several key API endpoints:

1. **Routes**:
   - `/` - Serves the main application page
   - `/captcha_data/<captcha_type>/<filename>` - Serves CAPTCHA images
   - `/api/get_puzzle` - Returns data for a random or specific puzzle
   - `/api/check_answer` - Validates submitted answers
   - `/api/benchmark_results` - Records benchmark outcomes
   - `/api/types` - Returns available CAPTCHA types

2. **Key Functions**:
   - `load_ground_truth(captcha_type)`: Loads answer data for puzzles
   - `get_captcha_types()`: Returns available CAPTCHA types from filesystem
   - `check_answer()`: Validates user-submitted answers against ground truth

### Frontend Architecture (static/js/script.js)

The frontend is built with vanilla JavaScript and handles:

1. **UI Components**:
   - Dynamic puzzle rendering based on puzzle type
   - Specialized interaction methods for different puzzle types
   - Answer submission and validation
   - Benchmark statistics display

2. **Key Functions**:
   - `loadNewPuzzle()`: Fetches and renders a new puzzle
   - Various setup functions for different puzzle types (`setupRotationControls()`, `setupSlidePuzzle()`, etc.)
   - `submitAnswer()`: Sends answers to server and processes responses
   - `updateStats()`: Updates the UI with benchmark statistics

## Data Model

### Ground Truth Format

Each CAPTCHA type has a `ground_truth.json` file with the following structure:

```json
{
  "image1.png": {
    "answer": "expected answer",
    "description": "Description of the puzzle"
  }
}
```

The format varies slightly by puzzle type:
- **Dice_Count**: `{"sum": 42}`
- **Geometry_Click**: `{"area": [[x1, y1], [x2, y2]], "type": "shape_type"}`
- **Rotation_Match**: `{"reference_image": "ref.png", "correct_angle": 90}`

### Benchmark Results Format

Results are logged to `benchmark_results.json` with the structure:

```json
{
  "puzzle_type": "Dice_Count",
  "puzzle_id": "dice1.png",
  "user_answer": "42",
  "correct_answer": 42,
  "correct": true,
  "timestamp": "2023-04-11T08:48:02.423Z"
}
```

## CAPTCHA Types and Interaction Methods

| Type | Input Method | Description | Answer Format |
|------|--------------|-------------|--------------|
| Dice_Count | number | Calculate dice number sum | Integer |
| Geometry_Click | click | Click on geometric shapes | [x, y] coordinates |
| Rotation_Match | rotation | Match object orientation | Angle (degrees) |
| Slide_Puzzle | slide | Position slider correctly | [x, y] coordinates |
| Unusual_Detection | multiselect | Find unusual items | Array of indices |
| Image_Recognition | image_grid | Select matching images | Array of indices |
| Bingo | bingo_swap | Swap images to form lines | [index1, index2] |
| Image_Matching | image_matching | Match images | Option index |
| Patch_Select | patch_select | Select grid squares | Array of indices |
| Dart_Count | dart_count | Match dart value sums | Option index |
| Select_Animal | select_animal | Identify specific animals | Index selection |

## Dependencies

The project has the following dependencies:

```
flask==2.0.1
werkzeug==2.0.2
flask-cors==3.0.10
pillow==9.4.0
```

## Data Flow and System Interaction

### Request-Response Flow

1. **Initial Page Load**:
   - Browser loads `index.html`
   - JavaScript initializes and requests a random puzzle

2. **Puzzle Loading**:
   - Frontend calls `/api/get_puzzle?random=true`
   - Backend selects a random puzzle from available types
   - Frontend renders appropriate UI based on puzzle type

3. **Answer Submission**:
   - User/agent interacts with the puzzle (click, type, select, etc.)
   - On submission, answer is sent to `/api/check_answer`
   - Backend validates answer against ground truth
   - Result is returned to frontend and logged to benchmark results

4. **Automatic Progression**:
   - After answer submission, a new random puzzle loads automatically
   - Benchmark statistics are updated in the UI

### Component Dependencies

```
index.html
  └── script.js (Client-side logic)
      ├── API calls to app.py
      └── DOM manipulation

app.py (Flask server)
  ├── Serves index.html
  ├── Provides API endpoints
  └── Reads/writes ground truth and benchmark data

captcha_data/ (Data storage)
  └── <Type>/
      ├── Images
      └── ground_truth.json

manage_captchas.py
  └── CLI tool to modify captcha_data/
```

## Extension Points

### Adding New CAPTCHA Types

1. Create a new directory in `captcha_data/`
2. Add puzzle images 
3. Create `ground_truth.json` with appropriate answer format
4. Update `app.py` to handle the new input type
5. Add specialized rendering and interaction logic in `script.js`

### Enhancing Benchmark Metrics

1. Modify `/api/benchmark_results` endpoint to capture additional data
2. Update the frontend statistics display
3. Implement more advanced analytics in a separate module

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