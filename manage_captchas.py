#!/usr/bin/env python3
import os
import json
import argparse
import shutil
from datetime import datetime

class CaptchaManager:
    def __init__(self):
        self.base_dir = 'captcha_data'
        # Ensure base directory exists
        os.makedirs(self.base_dir, exist_ok=True)
        
    def list_captcha_types(self):
        """List all available CAPTCHA types"""
        types = [d for d in os.listdir(self.base_dir) 
                if os.path.isdir(os.path.join(self.base_dir, d))]
        return types
        
    def add_captcha_type(self, type_name):
        """Create a new CAPTCHA type directory"""
        type_dir = os.path.join(self.base_dir, type_name)
        if os.path.exists(type_dir):
            print(f"CAPTCHA type '{type_name}' already exists")
            return False
        
        os.makedirs(type_dir, exist_ok=True)
        # Create empty ground truth file
        with open(os.path.join(type_dir, 'ground_truth.json'), 'w') as f:
            json.dump({}, f, indent=2)
            
        print(f"Created new CAPTCHA type: {type_name}")
        return True
    
    def add_puzzle(self, type_name, image_path, answer, description=None):
        """Add a new puzzle to a CAPTCHA type"""
        type_dir = os.path.join(self.base_dir, type_name)
        if not os.path.exists(type_dir):
            print(f"Error: CAPTCHA type '{type_name}' does not exist")
            return False
        
        # Check if image exists
        if not os.path.exists(image_path):
            print(f"Error: Image file {image_path} does not exist")
            return False
        
        # Copy image to type directory
        image_filename = os.path.basename(image_path)
        destination = os.path.join(type_dir, image_filename)
        shutil.copy2(image_path, destination)
        
        # Load existing ground truth
        ground_truth_path = os.path.join(type_dir, 'ground_truth.json')
        try:
            with open(ground_truth_path, 'r') as f:
                ground_truth = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            ground_truth = {}
        
        # For dice count type, ensure answer is an integer
        if type_name == 'Dice_Count' and isinstance(answer, str):
            try:
                answer = int(answer)
            except ValueError:
                print("Error: For Dice_Count, answer must be a number")
                return False
        
        # Add new entry
        if not description:
            if type_name == 'Dice_Count':
                description = f"Contains multiple dice with numbers that sum to {answer}"
            else:
                description = f"CAPTCHA puzzle added on {datetime.now().strftime('%Y-%m-%d')}"
        
        ground_truth[image_filename] = {
            "sum" if type_name == 'Dice_Count' else "answer": answer,
            "description": description
        }
        
        # Save updated ground truth
        with open(ground_truth_path, 'w') as f:
            json.dump(ground_truth, f, indent=2)
        
        print(f"Successfully added {image_filename} to {type_name} with answer: {answer}")
        return True
    
    def list_puzzles(self, type_name):
        """List all puzzles for a specific CAPTCHA type"""
        type_dir = os.path.join(self.base_dir, type_name)
        if not os.path.exists(type_dir):
            print(f"Error: CAPTCHA type '{type_name}' does not exist")
            return False
        
        ground_truth_path = os.path.join(type_dir, 'ground_truth.json')
        try:
            with open(ground_truth_path, 'r') as f:
                ground_truth = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            print(f"No puzzles found for {type_name}")
            return []
        
        puzzles = []
        for filename, data in ground_truth.items():
            answer = data.get('sum' if type_name == 'Dice_Count' else 'answer', 'Unknown')
            description = data.get('description', 'No description')
            puzzles.append({
                'filename': filename,
                'answer': answer,
                'description': description
            })
        
        return puzzles

def main():
    parser = argparse.ArgumentParser(description="Manage CAPTCHA puzzles for benchmarking")
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # List CAPTCHA types
    list_types_parser = subparsers.add_parser('list-types', help='List all CAPTCHA types')
    
    # Add new CAPTCHA type
    add_type_parser = subparsers.add_parser('add-type', help='Add a new CAPTCHA type')
    add_type_parser.add_argument('type_name', help='Name of the new CAPTCHA type')
    
    # Add new puzzle
    add_puzzle_parser = subparsers.add_parser('add-puzzle', help='Add a new puzzle')
    add_puzzle_parser.add_argument('type_name', help='CAPTCHA type to add puzzle to')
    add_puzzle_parser.add_argument('image_path', help='Path to the image file')
    add_puzzle_parser.add_argument('answer', help='Answer/solution for the puzzle')
    add_puzzle_parser.add_argument('--description', help='Optional description')
    
    # List puzzles
    list_puzzles_parser = subparsers.add_parser('list-puzzles', help='List all puzzles for a CAPTCHA type')
    list_puzzles_parser.add_argument('type_name', help='CAPTCHA type to list puzzles for')
    
    args = parser.parse_args()
    manager = CaptchaManager()
    
    if args.command == 'list-types':
        types = manager.list_captcha_types()
        if types:
            print("Available CAPTCHA types:")
            for t in types:
                print(f"- {t}")
        else:
            print("No CAPTCHA types found.")
    
    elif args.command == 'add-type':
        manager.add_captcha_type(args.type_name)
    
    elif args.command == 'add-puzzle':
        manager.add_puzzle(args.type_name, args.image_path, args.answer, args.description)
    
    elif args.command == 'list-puzzles':
        puzzles = manager.list_puzzles(args.type_name)
        if puzzles:
            print(f"Puzzles for {args.type_name}:")
            for p in puzzles:
                print(f"- {p['filename']}: Answer={p['answer']}, Description: {p['description']}")
        else:
            print(f"No puzzles found for {args.type_name}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 