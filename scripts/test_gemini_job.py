import requests
import json
import time
import sys

BASE_URL = "http://127.0.0.1:9090/api"

def get_gemini_model():
    """Finds and returns the Gemini 2.5 Flash model configuration."""
    print("Fetching models...")
    try:
        # Using v2/models API
        response = requests.get(f"{BASE_URL}/v2/models/", params={"model_format": "api"})
        response.raise_for_status()
        data = response.json()
        
        # Searching for the specific Gemini 2.5 Flash model
        for model in data.get("models", []):
            if model.get("source") == "invokeai/gemini-2-5-flash":
                print(f"Found Gemini 2.5 Flash model: {model.get('name')} (Key: {model.get('key')})")
                return model
        
        print("Gemini 2.5 Flash model not found.")
        return None
    except Exception as e:
        print(f"Error fetching models: {e}")
        return None

def check_queue_idle(queue_id="default"):
    """Checks if the queue is idle (no pending or in-progress items)."""
    print(f"Checking status for queue: {queue_id}...")
    try:
        # Using v1/queue API
        response = requests.get(f"{BASE_URL}/v1/queue/{queue_id}/status")
        response.raise_for_status()
        status = response.json()
        
        queue_status = status.get("queue", {})
        pending = queue_status.get("pending", 0)
        in_progress = queue_status.get("in_progress", 0)
        
        print(f"Queue Status - Pending: {pending}, In Progress: {in_progress}")
        
        if pending == 0 and in_progress == 0:
            return True
        else:
            return False
            
    except Exception as e:
        print(f"Error checking queue status: {e}")
        return False

def submit_gemini_job(model_config):
    """Submits a Gemini 2.5 Flash generation job."""
    print("Submitting Gemini 2.5 Flash job...")
    
    # Construct the graph
    # Node 1: Gemini Generation
    gemini_node = {
        "id": "gemini_gen",
        "type": "gemini_2_5_flash_image_gen",
        "prompt": "A futuristic city with flying cars, neon lights, cyberpunk style, high detail",
        "model": model_config  # Passing the full model config
    }
    
    # Data flow: The gemini node outputs an image, but we usually want to save it or display it.
    # The simpler graph just runs the generation. The invocation saves the image to the gallery implicitly 
    # if it's connected to nothing? No, we likely need to ensure it's "used" or at least the node is executed.
    # In the session queue, we just need to provide the graph. The execution will produce the image.
    
    graph = {
        "nodes": {
            "gemini_gen": gemini_node
        },
        "edges": []
    }

    batch = {
        "origin": "QuantiMax",
        "destination": "sandbox", # Using sandbox or None to avoid gallery
        "graph": graph,
        "runs": 1
    }
    
    payload = {
        "batch": batch,
        "prepend": False
    }
    
    try:
        # Using v1/queue API
        response = requests.post(f"{BASE_URL}/v1/queue/default/enqueue_batch", json=payload)
        response.raise_for_status()
        result = response.json()
        print("Job submitted successfully!")
        print(f"Enqueued Batch ID: {result.get('batch', {}).get('batch_id')}")
        print(f"Item IDs: {result.get('item_ids')}")
        return result
    except Exception as e:
        print(f"Error submitting job: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response Content: {e.response.text}")
        return None


def main():
    print("--- Gemini API Test Script ---")
    
    # 1. Get Model
    model_config = get_gemini_model()
    if not model_config:
        print("Aborting: Could not find Gemini 2.5 Flash model.")
        sys.exit(1)
        
    # 2. Check Queue
    is_idle = check_queue_idle()
    if not is_idle:
        print("Queue is not idle. Skipping job submission.")
        sys.exit(0)
        
    # 3. Submit Job
    print("Queue is idle. Proceeding with job submission...")
    result = submit_gemini_job(model_config)
    
    if result:
        batch_id = result.get('batch', {}).get('batch_id')
        print(f"Monitoring Batch ID: {batch_id}")
        
        for _ in range(10):
            time.sleep(2)
            try:
                # v1/queue/{queue_id}/b/{batch_id}/status
                response = requests.get(f"{BASE_URL}/v1/queue/default/b/{batch_id}/status")
                response.raise_for_status()
                status = response.json()
                print(f"Batch Status: Pending={status.get('pending')}, In Progress={status.get('in_progress')}, Completed={status.get('completed')}, Failed={status.get('failed')}")
                
                if status.get('completed') > 0 or status.get('failed') > 0:
                    break
            except Exception as e:
                print(f"Error checking batch status: {e}")

        # 5. Get Result
        if status.get('completed') > 0:
            print("Job completed. Fetching result...")
            try:
                # We know there is only 1 item in this batch
                item_ids = result.get('item_ids', [])
                if not item_ids:
                    print("No item IDs found.")
                    return

                item_id = item_ids[0]
                # v1/queue/{queue_id}/i/{item_id}
                response = requests.get(f"{BASE_URL}/v1/queue/default/i/{item_id}")
                response.raise_for_status()
                queue_item = response.json()
                
                # Extract image name from session results
                # session -> results -> <node_id> -> image -> image_name
                session = queue_item.get('session', {})
                results = session.get('results', {})
                
                image_name = None
                for node_id, node_output in results.items():
                    if 'image' in node_output:
                        image_name = node_output['image'].get('image_name')
                        if image_name:
                            print(f"Found image in node {node_id}")
                            break
                            
                if image_name:
                    image_url = f"{BASE_URL}/v1/images/i/{image_name}/full"
                    print(f"FAILED: Image URL: {image_url}") # Labeling as FAILED just to grab attention if needed, but here implies Success really. User asked for URL.
                    print(f"SUCCESS: Generated Image URL: {image_url}")
                else:
                    print("Could not find image output in session results.")
                    print(f"Debug - Results keys: {list(results.keys())}")
                    if results:
                        first_key = list(results.keys())[0]
                        print(f"Debug - First result: {results[first_key]}")
                    
            except Exception as e:
                print(f"Error fetching result: {e}")


if __name__ == "__main__":
    main()

