
import base64
import json
import os
from typing import Dict, Any

def encode_game_state(state_dict: Dict[str, Any]) -> str:
    """
    Encode a game state dictionary to base64 string
    """
    try:
        json_string = json.dumps(state_dict, indent=None, separators=(',', ':'))
        encoded_bytes = base64.b64encode(json_string.encode('utf-8'))
        return encoded_bytes.decode('utf-8')
    except Exception as e:
        print(f"❌ Error encoding game state: {e}")
        return ""

def decode_game_state(base64_string: str) -> Dict[str, Any]:
    """
    Decode a base64 string back to game state dictionary
    """
    try:
        decoded_bytes = base64.b64decode(base64_string.encode('utf-8'))
        json_string = decoded_bytes.decode('utf-8')
        return json.loads(json_string)
    except Exception as e:
        print(f"❌ Error decoding game state: {e}")
        return {}

def save_state_to_file(state_dict: Dict[str, Any], filename: str) -> bool:
    """
    Save game state dictionary to JSON file
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(state_dict, f, indent=2, ensure_ascii=False)
        print(f"✅ State saved to {filename}")
        return True
    except Exception as e:
        print(f"❌ Error saving state to file: {e}")
        return False

def load_state_from_file(filename: str) -> Dict[str, Any]:
    """
    Load game state dictionary from JSON file
    """
    try:
        if not os.path.exists(filename):
            print(f"⚠️ File {filename} does not exist")
            return {}
        
        with open(filename, 'r', encoding='utf-8') as f:
            state_dict = json.load(f)
        print(f"✅ State loaded from {filename}")
        return state_dict
    except Exception as e:
        print(f"❌ Error loading state from file: {e}")
        return {}

def create_level_state_file(level_id: int, state_dict: Dict[str, Any], output_dir: str = "level_states") -> str:
    """
    Create a level state file with base64 encoded data
    """
    try:
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        encoded_state = encode_game_state(state_dict)
        level_file = {
            "level_id": level_id,
            "state_data": encoded_state,
            "metadata": {
                "created_at": "2025-01-27",
                "version": "1.0",
                "description": f"Level {level_id} game state"
            }
        }
        
        filename = os.path.join(output_dir, f"level_{level_id}.json")
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(level_file, f, indent=2)
        
        print(f"✅ Level {level_id} state file created: {filename}")
        return filename
    except Exception as e:
        print(f"❌ Error creating level state file: {e}")
        return ""

# Example usage and testing
if __name__ == "__main__":
    print("🎮 B64 Game State Tools Demo")
    print("=" * 40)
    
    # Load example state
    example_state = load_state_from_file("example-state-dictionary.json")
    
    if example_state:
        print("\n📁 Example state loaded:")
        print(f"  Level: {example_state.get('level', 'Unknown')}")
        print(f"  Players: {len(example_state.get('players', []))}")
        print(f"  Enemies: {len(example_state.get('enemies', []))}")
        print(f"  Bosses: {len(example_state.get('bosses', []))}")
        print(f"  Terrain: {len(example_state.get('terrain', []))}")
        
        # Encode the state
        encoded = encode_game_state(example_state)
        print(f"\n🔐 Encoded state length: {len(encoded)} characters")
        print(f"First 100 chars: {encoded[:100]}...")
        
        # Decode it back
        decoded = decode_game_state(encoded)
        print(f"\n🔓 Decoded successfully: {decoded.get('level', 'Unknown') == example_state.get('level', 'Unknown')}")
        
        # Create level state file
        create_level_state_file(1, example_state)
        
        # Test multiple levels
        for level_num in [2, 3, 4, 5]:
            # Modify state for different levels
            modified_state = example_state.copy()
            modified_state['level'] = level_num
            modified_state['background'] = f"/static/maps/level_{level_num}.png"
            modified_state['music'] = f"/static/audio/background/{level_num}.mp3"
            
            # Add more enemies for higher levels
            if level_num > 2:
                for i in range(level_num - 2):
                    new_enemy = {
                        "id": f"enemy_{3 + i}",
                        "name": f"E{3 + i}",
                        "hp": 60 + (level_num * 10),
                        "maxHp": 60 + (level_num * 10),
                        "row": 0 + (i % 3),
                        "col": 2 + i,
                        "type": "enemy",
                        "img": "/static/enemies/ember/ember_alcolyte.png",
                        "abilities": ["basic_attack"],
                        "equipment": [],
                        "stats": {
                            "attack": 25 + (level_num * 5),
                            "defense": 15 + (level_num * 3),
                            "speed": 10,
                            "magic": 5
                        }
                    }
                    modified_state['enemies'].append(new_enemy)
            
            create_level_state_file(level_num, modified_state)
    
    print("\n✅ Demo completed!")
    print("\nFiles created:")
    print("  - level_states/level_1.json")
    print("  - level_states/level_2.json") 
    print("  - level_states/level_3.json")
    print("  - level_states/level_4.json")
    print("  - level_states/level_5.json")
