import os
import re

directory = r'c:\Users\Walido\Desktop\walid\src\pages'

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.astro'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Remove transition:persist from AstroPageLoader
            new_content = content.replace(' transition:persist', '')
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Reverted {path}")
