# CAPTCHA Puzzle Benchmark Project Summary

## Project Overview

This project is a web-based environment for testing and benchmarking Multimodal LLM Agents on CAPTCHA-style puzzles. It provides a simple interface that automatically presents random CAPTCHA puzzles, accepts user/agent answers, and records performance metrics.

## Project Structure

```
/
├── app.py                   # Main Flask application
├── manage_captchas.py       # Command-line tool for managing CAPTCHA puzzles
├── requirements.txt         # Project dependencies
├── benchmark_results.json   # Log of benchmark results
├── README.md                # Project documentation
├── static/                  # Static web assets
│   ├── css/
│   │   └── style.css        # Application styling
│   └── js/
│       └── script.js        # Frontend JavaScript code
├── templates/               # HTML templates
│   └── index.html           # Main application page
└── captcha_data/            # CAPTCHA puzzles organized by type
    └── Dice_Count/          # Example CAPTCHA type
        ├── ground_truth.json # Correct answers for this type
        ├── dice1.png        # Puzzle image
        ├── dice2.png        # Puzzle image
        └── dice3.png        # Puzzle image
```

## Dependencies

The project uses the following dependencies:

```
flask==2.0.1         # Web framework
werkzeug==2.0.2      # WSGI utility library used by Flask
flask-cors==3.0.10   # Cross-Origin Resource Sharing for Flask
pillow==9.4.0        # Python Imaging Library for image processing
```

## Key Components

### Backend (Python)

#### 1. Main Application (`app.py`)

The core Flask application that:
- Serves the web interface
- Provides API endpoints for getting puzzles and checking answers
- Records benchmark results

**Key Functions:**
- `load_ground_truth(captcha_type)`: Loads answer data for a specific type of CAPTCHA
- `get_captcha_types()`: Returns available CAPTCHA types from the filesystem
- `get_puzzle()`: API endpoint that selects and returns a random puzzle
- `check_answer()`: API endpoint that validates user answers
- `record_benchmark()`: API endpoint for logging benchmark results

#### 2. CAPTCHA Manager (`manage_captchas.py`)

A command-line utility for managing CAPTCHA puzzles that:
- Lists available CAPTCHA types
- Creates new CAPTCHA types
- Adds new puzzles to existing types
- Lists puzzles for a specific type

**Key Components:**
- `CaptchaManager` class: Core functionality for managing CAPTCHA data
- Command-line interface via `argparse`

### Frontend (HTML/CSS/JavaScript)

#### 1. User Interface (`templates/index.html`)

A single-page application that:
- Displays CAPTCHA images
- Provides an input field for answers
- Shows result feedback
- Displays benchmark statistics

#### 2. Frontend Logic (`static/js/script.js`)

JavaScript code that:
- Manages the UI state
- Fetches random puzzles from the server
- Submits user answers for verification
- Updates benchmark statistics
- Records results to the server

**Key Functions:**
- `loadNewPuzzle()`: Fetches a new random puzzle from the server
- `submitAnswer()`: Sends the user's answer to the server for verification
- `updateStats()`: Updates the UI with current benchmark statistics
- `recordBenchmarkResult()`: Sends results to the server for logging

#### 3. Styling (`static/css/style.css`)

CSS styling for the web interface.

### Data Storage

#### 1. CAPTCHA Data (`captcha_data/`)

Organized by CAPTCHA type, each containing:
- Puzzle images
- A `ground_truth.json` file with correct answers

Example structure for `Dice_Count`:
```json
{
  "dice1.png": {
    "sum": 85,
    "description": "Contains multiple dice with numbers that sum to 85"
  },
  "dice2.png": {
    "sum": 67,
    "description": "Contains multiple dice with numbers that sum to 67"
  }
}
```

#### 2. Benchmark Results (`benchmark_results.json`)

A JSON Lines file containing logged benchmark attempts:
```json
{
  "puzzle_type": "Dice_Count",
  "puzzle_id": "dice1.png",
  "user_answer": "85",
  "correct_answer": 85,
  "is_correct": true,
  "timestamp": "2025-04-08T08:51:19.990Z"
}
```

## Function Call Flow

1. **Application Start**:
   - Flask server starts (`app.py`)
   - Web interface loads (`index.html`)
   - Frontend JavaScript initializes and calls `loadNewPuzzle()`

2. **Puzzle Loading**:
   - Frontend → Backend: `GET /api/get_puzzle?random=true`
   - Backend: Selects a random puzzle type and puzzle
   - Backend → Frontend: Returns puzzle details (image path, type, prompt)
   - Frontend: Displays the puzzle image and prompt

3. **Answer Submission**:
   - User/Agent enters an answer
   - Frontend → Backend: `POST /api/check_answer` with answer data
   - Backend: Validates answer against ground truth
   - Backend → Frontend: Returns validation result
   - Frontend: Displays result and updates statistics

4. **Benchmark Logging**:
   - Frontend → Backend: `POST /api/benchmark_results` with attempt data
   - Backend: Appends data to `benchmark_results.json`

5. **New Puzzle Cycle**:
   - Frontend: Automatically calls `loadNewPuzzle()` after a short delay
   - (Process repeats)

## Adding New CAPTCHA Types

The project is designed to be easily extensible with new CAPTCHA types:

1. Use the command-line tool: `python manage_captchas.py add-type New_Type_Name`
2. Add puzzle images to the new directory
3. Add correct answers to the `ground_truth.json` file

The application automatically discovers and includes new CAPTCHA types without requiring code changes.

## Important Locations for Modification

- **Add new CAPTCHA types**: Use `manage_captchas.py` or create directories in `captcha_data/`
- **Modify web interface**: Edit `templates/index.html` and `static/css/style.css`
- **Change behavior/logic**: Edit `app.py` for backend or `static/js/script.js` for frontend
- **Extend API endpoints**: Add new routes in `app.py` 