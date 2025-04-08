# CAPTCHA Puzzle Benchmark

A web-based environment for testing and benchmarking Multimodal LLM Agents on CAPTCHA-style puzzles.

## Setup

1. Install required packages:
   ```
   pip install -r requirements.txt
   ```

2. Run the Flask application:
   ```
   python app.py
   ```

3. Open your browser and navigate to `http://localhost:5001`

The application automatically presents random CAPTCHA puzzles as soon as the page loads, with no user interaction required to start.

## Adding New Puzzles

### Using the Command Line Tool

This project includes a command-line tool for easily managing CAPTCHA puzzles:

```bash
# List available CAPTCHA types
python manage_captchas.py list-types

# Add a new CAPTCHA type
python manage_captchas.py add-type Text_Recognition

# Add a new puzzle to an existing type
python manage_captchas.py add-puzzle Dice_Count /path/to/new_dice.png 42

# List all puzzles for a type
python manage_captchas.py list-puzzles Dice_Count
```

### Manual Method

To manually add new dice counting puzzles:

1. Place the puzzle image in the `captcha_data/Dice_Count/` directory
2. Update the `ground_truth.json` file in the same directory with the correct sum value

Example ground truth entry:
```json
"dice4.png": {
  "sum": 25,
  "description": "Contains multiple dice with numbers that sum to 25"
}
```

## Adding New CAPTCHA Types

To create a new type of CAPTCHA puzzle:

1. Create a new directory under `captcha_data/` (e.g., `captcha_data/Text_Recognition/`)
2. Add your puzzle images to the new directory
3. Create a `ground_truth.json` file with the following format:

```json
{
  "image1.png": {
    "answer": "captcha text",
    "description": "Description of the puzzle"
  },
  "image2.png": {
    "answer": "another text",
    "description": "Another CAPTCHA puzzle"
  }
}
```

The application will automatically include the new CAPTCHA type in the random puzzle selection.

## Testing Multimodal LLM Agents

To use this environment for testing agents:

1. Start the server and access the web interface
2. The agent should use browser tools to:
   - View the displayed CAPTCHA image
   - Identify the correct solution based on the puzzle type
   - Enter the answer in the input field
   - Submit the answer

When the answer is submitted, a new random puzzle will automatically appear after a brief delay.

## Benchmark Results

Results are logged to `benchmark_results.json` in the project root. Each entry includes:
- The puzzle type
- The puzzle ID
- The user's (or agent's) answer
- The correct answer
- Whether the answer was correct
- Timestamp of the attempt

You can use these logs to calculate metrics such as:
- Accuracy per CAPTCHA type
- Response time
- Types of errors made

## Expanding the Benchmark

This framework supports different types of CAPTCHA puzzles:
- Dice counting (numbers)
- Text recognition (text)
- Object counting (numbers)
- Pattern matching (text/numbers)
- Image classification (text)
- Logic puzzles (text/numbers)

For each new puzzle type, just follow the instructions in the "Adding New CAPTCHA Types" section. 