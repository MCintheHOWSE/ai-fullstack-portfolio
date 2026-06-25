import cv2
import torch
import time
import numpy as np
from deep_sort_realtime.deepsort_tracker import DeepSort
from ultralytics import YOLO

SOURCE_VIDEO_PATH = "content/highway.mp4"
OUTPUT_VIDEO_PATH = "content/speed_output.mp4"
CONF = 0.6

FRAME_WIDTH=30
FRAME_HEIGHT=100
SOURCE_POLYGONE = np.array([[18, 550], [1852, 608],[1335, 370], [534, 343]], dtype=np.float32)
BIRD_EYE_VIEW = np.array([[0, 0], [FRAME_WIDTH, 0], [FRAME_WIDTH, FRAME_HEIGHT],[0, FRAME_HEIGHT]], dtype=np.float32)
M = cv2.getPerspectiveTransform(SOURCE_POLYGONE, BIRD_EYE_VIEW)

def calculate_speed(distance, fps):
    return (distance * fps) * 3.6

def calculate_distance(p1, p2):
    return np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

cap = cv2.VideoCapture(SOURCE_VIDEO_PATH)
frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = int(cap.get(cv2.CAP_PROP_FPS))

pts = SOURCE_POLYGONE.astype(np.int32).reshape((-1, 1, 2))
polygon_mask = np.zeros((frame_height, frame_width), dtype=np.uint8)
cv2.fillPoly(polygon_mask, [pts], 255)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
writer = cv2.VideoWriter(OUTPUT_VIDEO_PATH, fourcc, fps, (frame_width, frame_height))

tracker = DeepSort(max_age=50)
model = YOLO("yolov9c.pt")
class_names = model.names
colors = np.random.RandomState(42).randint(0, 255, size=(max(class_names.keys())+1, 3))

prev_positions={}
speed_accumulator={}
track_history = {}
counted_tracks = set()

# Initialize counts
counts = {
    'South': {'Regular': 0, 'Truck': 0},
    'North': {'Regular': 0, 'Truck': 0}
}

while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model(frame, verbose=False)
    detect = []
    
    for pred in results:
        for box in pred.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence = float(box.conf[0])
            label = int(box.cls[0])

            if confidence < CONF:
                continue

            # Only count vehicles (car: 2, motorcycle: 3, bus: 5, truck: 7)
            if label not in [2, 3, 5, 7]:
                continue

            if polygon_mask[(y1 + y2) // 2, (x1 + x2) // 2] == 255:
                detect.append([[x1, y1, x2 - x1, y2 - y1], confidence, label])

    tracks = tracker.update_tracks(detect, frame=frame)
    
    for track in tracks:
        if not track.is_confirmed():
            continue
            
        track_id = track.track_id
        ltrb = track.to_ltrb()
        class_id = track.get_det_class()
        
        # Use fallback if ltrb is invalid
        if ltrb is None or len(ltrb) < 4:
            continue
            
        x1, y1, x2, y2 = map(int, ltrb)
        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(frame_width, x2), min(frame_height, y2)
        
        # Check if inside polygon
        cy, cx = (y1+y2)//2, (x1+x2)//2
        if polygon_mask[cy, cx] == 0:
            continue
            
        color = colors[class_id]
        B, G, R = map(int, color)
        text = f"{track_id} - {class_names.get(class_id, 'Unknown')}"
        center_pt = np.array([[cx, cy]], dtype=np.float32)
        transformed_pt = cv2.perspectiveTransform(center_pt[None, :, :], M)
        
        # Track history for counting
        if track_id not in track_history:
            track_history[track_id] = []
        track_history[track_id].append((cx, cy, class_id))
        
        # Counting logic
        if track_id not in counted_tracks and len(track_history[track_id]) >= 10:
            # y increased -> moving down -> South 
            # y decreased -> moving up -> North
            dy = track_history[track_id][-1][1] - track_history[track_id][0][1]
            if abs(dy) >= 20:
                direction = "South" if dy > 0 else "North"
                
                # Get the most frequent class ID over the tracking history to prevent single-frame flickering
                historical_classes = [h[2] for h in track_history[track_id]]
                majority_class = max(set(historical_classes), key=historical_classes.count)
                
                is_truck = (majority_class == 7)
                counted_tracks.add(track_id)
                
                if direction == "South":
                    if is_truck: counts['South']['Truck'] += 1
                    else: counts['South']['Regular'] += 1
                else:
                    if is_truck: counts['North']['Truck'] += 1
                    else: counts['North']['Regular'] += 1
        
        # Speed measurement
        avg_speed = 0
        if track_id in prev_positions:
            prev_position = prev_positions[track_id]
            distance = calculate_distance(prev_position, transformed_pt[0][0])
            speed = calculate_speed(distance, fps)
            
            if track_id not in speed_accumulator:
                speed_accumulator[track_id] = []
            speed_accumulator[track_id].append(speed)
            
            # keep max 100 observations
            if len(speed_accumulator[track_id]) > 100:
                speed_accumulator[track_id].pop(0)

            avg_speed = sum(speed_accumulator[track_id]) / len(speed_accumulator[track_id])
            
        prev_positions[track_id] = transformed_pt[0][0]

        # Draw bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), (B, G, R), 2)
        cv2.putText(frame, text, (x1 + 5, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Display speed if we have one
        if track_id in speed_accumulator:
            # Over 120 km/h -> Red, else Green
            if avg_speed > 120:
                speed_color = (0, 0, 255) # Red (BGR)
            else:
                speed_color = (0, 255, 0) # Green (BGR)
                
            speed_text = f"Speed: {avg_speed:.0f} km/h"
            cv2.rectangle(frame, (x1 - 1, y1-40), (x1 + len(speed_text) * 10, y1-20), speed_color, -1)
            cv2.putText(frame, speed_text, (x1 + 5, y1 - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)

    # Draw ROI polygon
    cv2.polylines(frame, [pts], isClosed=True, color=(255, 0, 0), thickness=2)

    # Overlay counting stats
    overlay_text = [
        "--- Southbound ---",
        f"Regular: {counts['South']['Regular']}",
        f"Truck: {counts['South']['Truck']}",
        "",
        "--- Northbound ---",
        f"Regular: {counts['North']['Regular']}",
        f"Truck: {counts['North']['Truck']}",
    ]
    
    y0 = 30
    for i, line in enumerate(overlay_text):
        cv2.putText(frame, line, (20, y0 + i*30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    writer.write(frame)

cap.release()
writer.release()
print("Processing complete. Video saved to", OUTPUT_VIDEO_PATH)
