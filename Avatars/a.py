import os
import json

base_path = './characters'
categories = os.listdir(base_path)
manifest = {}

for cat in categories:
    folder = os.path.join(base_path, cat)
    if os.path.isdir(folder):
        manifest[cat] = [f for f in os.listdir(folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

with open('manifest.json', 'w') as f:
    json.dump(manifest, f, indent=2)

print("manifest.json updated.")
