import os
import json
import random
from flask import Flask, render_template, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load ground truth data for a specific type
def load_ground_truth(captcha_type):
    path = os.path.join('captcha_data', captcha_type, 'ground_truth.json')
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

# Get available CAPTCHA types
def get_captcha_types():
    base_dir = 'captcha_data'
    if not os.path.exists(base_dir):
        return []
    return [d for d in os.listdir(base_dir) 
            if os.path.isdir(os.path.join(base_dir, d))]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/captcha_data/<captcha_type>/<filename>')
def serve_captcha(captcha_type, filename):
    return send_from_directory(os.path.join('captcha_data', captcha_type), filename)

@app.route('/api/get_puzzle', methods=['GET'])
def get_puzzle():
    # Check if we should return a random puzzle from any type
    is_random = request.args.get('random', 'false').lower() == 'true'
    
    # Get all available CAPTCHA types
    captcha_types = get_captcha_types()
    if not captcha_types:
        return jsonify({'error': 'No CAPTCHA types found'}), 404
    
    if is_random:
        # Select a random CAPTCHA type
        puzzle_type = random.choice(captcha_types)
    else:
        # Get puzzle type from query parameter
        puzzle_type = request.args.get('type', 'Dice_Count')
        # Check if puzzle type exists
        if puzzle_type not in captcha_types:
            return jsonify({'error': f'Invalid puzzle type: {puzzle_type}'}), 400
    
    # Load ground truth for the selected type
    ground_truth = load_ground_truth(puzzle_type)
    if not ground_truth:
        return jsonify({'error': f'No puzzles found for type: {puzzle_type}'}), 404
    
    puzzle_files = list(ground_truth.keys())
    
    # Select a random puzzle
    selected_puzzle = random.choice(puzzle_files)
    
    # Get the appropriate question prompt based on puzzle type
    if puzzle_type == "Dice_Count":
        prompt = ground_truth[selected_puzzle].get('prompt', "Sum up the numbers on the dice")
    elif puzzle_type == "Geometry_Click":
        prompt = ground_truth[selected_puzzle].get("question", "Click on the geometric shape")
    elif puzzle_type == "Rotation_Match":
        prompt = ground_truth[selected_puzzle].get("prompt", "Use the arrows to rotate the object to match the reference direction")
    else:
        prompt = ground_truth[selected_puzzle].get("prompt", "Solve the CAPTCHA puzzle")
    
    # Add input_type to tell the frontend what kind of input to show
    input_type = "text"
    if puzzle_type == "Dice_Count":
        input_type = "number"
    elif puzzle_type == "Geometry_Click":
        input_type = "click"
    elif puzzle_type == "Rotation_Match":
        input_type = "rotation"
    
    # For Rotation_Match, include additional data needed for the interface
    additional_data = {}
    if puzzle_type == "Rotation_Match":
        # Get reference image and object base name
        reference_image = ground_truth[selected_puzzle].get("reference_image")
        object_base_image = ground_truth[selected_puzzle].get("object_base_image")
        
        if not reference_image or not object_base_image:
            # If missing required fields, try another puzzle or fall back
            return jsonify({'error': f'Invalid rotation puzzle data: {selected_puzzle}'}), 500
        
        # Format paths for these images
        ref_path = f'/captcha_data/{puzzle_type}/{reference_image}'
        
        # Get object base name without extension to construct rotated image paths
        object_base = os.path.splitext(object_base_image)[0]
        
        # Construct the initial object image path (0 degrees rotation)
        object_path = f'/captcha_data/{puzzle_type}/{object_base}_0.png'
        
        additional_data = {
            "reference_image": ref_path,
            "object_image": object_path,
            "object_base": object_base,
            "current_angle": 0
        }
    
    response_data = {
        'puzzle_type': puzzle_type,
        'image_path': f'/captcha_data/{puzzle_type}/{selected_puzzle}' if puzzle_type != "Rotation_Match" else None,
        'puzzle_id': selected_puzzle,
        'prompt': prompt,
        'input_type': input_type,
        'debug_info': f"Type: {puzzle_type}, Input: {input_type}, Puzzle: {selected_puzzle}"
    }
    
    # Add any additional data for specific puzzle types
    if additional_data:
        response_data.update(additional_data)
    
    return jsonify(response_data)

@app.route('/api/get_ground_truth', methods=['POST'])
def get_ground_truth():
    """Return ground truth data for debugging purposes"""
    data = request.json
    puzzle_type = data.get('puzzle_type')
    puzzle_id = data.get('puzzle_id')
    
    if not puzzle_type or not puzzle_id:
        return jsonify({'error': 'Missing puzzle_type or puzzle_id'}), 400
    
    ground_truth = load_ground_truth(puzzle_type)
    
    if puzzle_id not in ground_truth:
        return jsonify({'error': 'Invalid puzzle ID'}), 400
    
    # Return the ground truth for the specified puzzle
    puzzle_data = ground_truth[puzzle_id]
    
    return jsonify({
        'answer': puzzle_data.get('answer'),
        'question': puzzle_data.get('question'),
        'description': puzzle_data.get('description')
    })

@app.route('/api/check_answer', methods=['POST'])
def check_answer():
    data = request.json
    puzzle_type = data.get('puzzle_type', 'Dice_Count')
    puzzle_id = data.get('puzzle_id')
    user_answer = data.get('answer')
    
    # Validate input
    if not puzzle_id or user_answer is None:
        return jsonify({'error': 'Missing puzzle_id or answer'}), 400
    
    ground_truth = load_ground_truth(puzzle_type)
    
    if puzzle_id not in ground_truth:
        return jsonify({'error': 'Invalid puzzle ID'}), 400
    
    # Get correct answer based on puzzle type
    is_correct = False
    
    if puzzle_type == 'Dice_Count':
        # For dice count, ensure we're comparing numbers
        try:
            correct_answer = ground_truth[puzzle_id].get('sum')
            is_correct = int(user_answer) == int(correct_answer)
        except ValueError:
            return jsonify({'error': 'Invalid answer format'}), 400
            
    elif puzzle_type == 'Geometry_Click':
        # For geometry click, check if click is within the correct area
        try:
            # Get the area boundaries from ground truth
            correct_answer = ground_truth[puzzle_id].get('answer')
            
            # Extract coordinates
            user_x, user_y = user_answer
            
            # Check if the new format is used (with area)
            if isinstance(correct_answer, dict) and 'area' in correct_answer:
                # Get area coordinates (top-left and bottom-right corners)
                top_left, bottom_right = correct_answer['area']
                min_x, min_y = top_left
                max_x, max_y = bottom_right
                
                # Check if click is within the defined area
                is_correct = (min_x <= user_x <= max_x) and (min_y <= user_y <= max_y)
                
                # Return the shape type as part of the correct answer
                shape_type = correct_answer.get('type', 'shape')
                correct_answer_info = {
                    'type': shape_type,
                    'area': correct_answer['area']
                }
            else:
                # Fall back to the old format with distance calculation
                correct_x, correct_y = correct_answer
                
                # Calculate distance and check if within tolerance (25 pixels)
                tolerance = 25
                distance = ((user_x - correct_x) ** 2 + (user_y - correct_y) ** 2) ** 0.5
                is_correct = distance <= tolerance
                correct_answer_info = correct_answer
        except (ValueError, TypeError, KeyError):
            return jsonify({'error': 'Invalid answer format for Geometry_Click'}), 400
    
    elif puzzle_type == 'Rotation_Match':
        # For rotation match, check if the angle matches the correct answer
        try:
            # Get the correct angle from ground truth
            correct_angle = ground_truth[puzzle_id].get('correct_angle')
            
            # User answer should be the current rotation angle
            user_angle = int(user_answer)
            
            # Check if angles match (using modulo to handle full rotations)
            is_correct = user_angle % 360 == correct_angle % 360
            correct_answer_info = correct_angle
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid answer format for Rotation_Match'}), 400
    
    else:
        # For other types, compare as strings (case insensitive)
        correct_answer = ground_truth[puzzle_id].get('answer')
        is_correct = str(user_answer).lower() == str(correct_answer).lower()
        correct_answer_info = correct_answer
    
    # Get the appropriate answer field based on puzzle type
    if puzzle_type == 'Dice_Count':
        answer_key = 'sum'
    else:
        answer_key = 'answer'
    
    return jsonify({
        'correct': is_correct,
        'user_answer': user_answer,
        'correct_answer': ground_truth[puzzle_id].get(answer_key)
    })

@app.route('/api/benchmark_results', methods=['POST'])
def record_benchmark():
    data = request.json
    
    # Add timestamp if not provided
    if 'timestamp' not in data:
        from datetime import datetime
        data['timestamp'] = datetime.now().isoformat()
    
    # In a real system, you would save this data to a database
    # For this example, we'll just print it to the console
    print(f"Benchmark results: {data}")
    
    # You could store this in a log file as well
    with open('benchmark_results.json', 'a') as f:
        f.write(json.dumps(data) + '\n')
    
    return jsonify({'status': 'success'})

@app.route('/api/types', methods=['GET'])
def get_types():
    """Get available CAPTCHA types"""
    return jsonify({
        'types': get_captcha_types()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) 