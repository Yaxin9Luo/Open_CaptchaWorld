#!/usr/bin/env python3
import os
import argparse
import json
from PIL import Image

class RotationCaptchaCreator:
    def __init__(self, output_dir='captcha_data/Rotation_Match'):
        """Initialize the rotation CAPTCHA creator with output directory"""
        self.output_dir = output_dir
        
        # Create output directory if it doesn't exist
        os.makedirs(output_dir, exist_ok=True)
        self.ground_truth_path = os.path.join(output_dir, 'ground_truth.json')
        
        # Load existing ground truth if available
        if os.path.exists(self.ground_truth_path):
            with open(self.ground_truth_path, 'r') as f:
                self.ground_truth = json.load(f)
        else:
            self.ground_truth = {}
            
    def create_rotated_versions(self, image_path, name_prefix=None, angles=None):
        """
        Create rotated versions of an image
        
        Args:
            image_path: Path to the image to rotate
            name_prefix: Prefix for the output filename (defaults to original filename)
            angles: List of angles to rotate the image (defaults to [0, 45, 90, 135, 180, 225, 270, 315])
        
        Returns:
            List of paths to the generated images
        """
        if angles is None:
            angles = [0, 45, 90, 135, 180, 225, 270, 315]
            
        if name_prefix is None:
            name_prefix = os.path.splitext(os.path.basename(image_path))[0]
            
        # Load the image
        try:
            img = Image.open(image_path)
        except Exception as e:
            print(f"Error opening image {image_path}: {e}")
            return []
            
        # Create rotated versions
        output_paths = []
        for angle in angles:
            # Rotate the image
            rotated_img = img.rotate(-angle, expand=True)  # Negative for clockwise rotation
            
            # Create output filename
            output_filename = f"{name_prefix}_{angle}.png"
            output_path = os.path.join(self.output_dir, output_filename)
            
            # Save the rotated image
            rotated_img.save(output_path)
            output_paths.append(output_path)
            
            print(f"Created rotated image: {output_path}")
            
        return output_paths
        
    def create_puzzle(self, reference_image, object_image, correct_angle, prompt=None, description=None):
        """
        Create a rotation puzzle by adding to the ground truth
        
        Args:
            reference_image: Path to the reference image (e.g., pointing hand)
            object_image: Path to the object image to be rotated
            correct_angle: The angle at which the object correctly matches the reference
            prompt: Instructions for the user (defaults to standard instruction)
            description: Description of the puzzle
        """
        # Copy reference image to output directory
        ref_filename = os.path.basename(reference_image)
        ref_output_path = os.path.join(self.output_dir, ref_filename)
        
        try:
            # Copy reference image if not already in output directory
            if reference_image != ref_output_path:
                Image.open(reference_image).save(ref_output_path)
            
            # Generate puzzle ID
            object_basename = os.path.splitext(os.path.basename(object_image))[0]
            puzzle_id = f"puzzle_{object_basename}_{os.path.splitext(ref_filename)[0]}.json"
            
            # Default prompt and description
            if prompt is None:
                prompt = "Use the arrows to rotate the object to face in the direction of the reference."
                
            if description is None:
                description = f"Rotation puzzle requiring alignment of object with reference direction"
                
            # Add to ground truth
            self.ground_truth[puzzle_id] = {
                "reference_image": ref_filename,
                "object_base_image": os.path.basename(object_image),
                "correct_angle": correct_angle,
                "prompt": prompt,
                "description": description,
                "answer": correct_angle  # Answer field for compatibility with existing code
            }
            
            # Save updated ground truth
            with open(self.ground_truth_path, 'w') as f:
                json.dump(self.ground_truth, f, indent=2)
                
            print(f"Created puzzle: {puzzle_id}")
            
        except Exception as e:
            print(f"Error creating puzzle: {e}")
    
    def create_complete_set(self, reference_image, object_image, correct_angle, angles=None):
        """Create a complete set: rotated versions of the object and puzzle entry"""
        # Create rotated versions
        object_basename = os.path.splitext(os.path.basename(object_image))[0]
        self.create_rotated_versions(object_image, object_basename, angles)
        
        # Create puzzle entry
        self.create_puzzle(reference_image, object_image, correct_angle)
        
def main():
    parser = argparse.ArgumentParser(description="Create rotation puzzles for CAPTCHA")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Rotate command
    rotate_parser = subparsers.add_parser("rotate", help="Create rotated versions of an image")
    rotate_parser.add_argument("image", help="Image to rotate")
    rotate_parser.add_argument("--output-dir", help="Output directory (default: captcha_data/Rotation_Match)")
    rotate_parser.add_argument("--angles", type=int, nargs="+", help="Angles to rotate (default: 0 90 180 270)")
    rotate_parser.add_argument("--prefix", help="Prefix for output filenames")
    
    # Create puzzle command
    puzzle_parser = subparsers.add_parser("puzzle", help="Create a rotation puzzle")
    puzzle_parser.add_argument("reference", help="Reference image (e.g., pointing hand)")
    puzzle_parser.add_argument("object", help="Object image to be rotated")
    puzzle_parser.add_argument("angle", type=int, help="Correct rotation angle")
    puzzle_parser.add_argument("--output-dir", help="Output directory (default: captcha_data/Rotation_Match)")
    puzzle_parser.add_argument("--prompt", help="Instructions for the user")
    puzzle_parser.add_argument("--description", help="Description of the puzzle")
    
    # Create complete set command
    set_parser = subparsers.add_parser("set", help="Create a complete set (rotated images + puzzle)")
    set_parser.add_argument("reference", help="Reference image (e.g., pointing hand)")
    set_parser.add_argument("object", help="Object image to be rotated")
    set_parser.add_argument("angle", type=int, help="Correct rotation angle")
    set_parser.add_argument("--output-dir", help="Output directory (default: captcha_data/Rotation_Match)")
    set_parser.add_argument("--angles", type=int, nargs="+", help="Angles to rotate (default: 0 90 180 270)")
    
    args = parser.parse_args()
    
    # Use specified output directory or default
    output_dir = args.output_dir if hasattr(args, 'output_dir') and args.output_dir else 'captcha_data/Rotation_Match'
    creator = RotationCaptchaCreator(output_dir)
    
    if args.command == "rotate":
        creator.create_rotated_versions(args.image, args.prefix, args.angles)
    
    elif args.command == "puzzle":
        creator.create_puzzle(args.reference, args.object, args.angle, args.prompt, args.description)
    
    elif args.command == "set":
        creator.create_complete_set(args.reference, args.object, args.angle, args.angles)
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 