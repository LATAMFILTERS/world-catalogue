import easyocr
import cv2
import numpy as np
import sys
import json

def generate_text_mask(image_path, output_path):
    img = cv2.imread(image_path)
    h, w = img.shape[:2]
    
    mask = np.zeros((h, w), dtype=np.uint8)
    
    # 1. EasyOCR — detecta texto con coordenadas exactas
    reader = easyocr.Reader(['en'], gpu=False)
    results = reader.readtext(image_path)
    
    detected = []
    for (bbox, text, conf) in results:
        if conf > 0.1:
            pts = np.array(bbox, dtype=np.int32)
            cv2.fillPoly(mask, [pts], 255)
            detected.append({"text": text, "conf": round(conf, 2)})
    
    # 2. OpenCV — detecta zonas rojas (rectangulo Fleetguard)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_red1 = np.array([0, 80, 80])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 80, 80])
    upper_red2 = np.array([180, 255, 255])
    red_mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    red_mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    red_mask = cv2.bitwise_or(red_mask1, red_mask2)
    mask = cv2.bitwise_or(mask, red_mask)
    
    # 3. Dilatar para cubrir bordes de letras completamente
    kernel = np.ones((10, 10), np.uint8)
    mask = cv2.dilate(mask, kernel, iterations=2)
    
    cv2.imwrite(output_path, mask)
    print(json.dumps({"status": "OK", "detected": detected, "mask": output_path}))

if __name__ == "__main__":
    generate_text_mask(sys.argv[1], sys.argv[2])
