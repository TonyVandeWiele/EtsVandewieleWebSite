import os
from PIL import Image

def optimize_images(directory, max_width=1920, quality=80):
    for filename in os.listdir(directory):
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            file_path = os.path.join(directory, filename)
            try:
                img = Image.open(file_path)
                
                # 1. Redimensionnement si trop large
                if img.width > max_width:
                    ratio = max_width / float(img.width)
                    new_height = int(float(img.height) * float(ratio))
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                    img.save(file_path, quality=quality, optimize=True)
                    print(f"Redimensionné : {filename}")

                # 2. Génération du WebP
                webp_path = os.path.splitext(file_path)[0] + ".webp"
                img.save(webp_path, "WEBP", quality=quality)
                print(f"Généré : {os.path.basename(webp_path)}")
            except Exception as e:
                print(f"Erreur sur {filename} : {e}")

if __name__ == "__main__":
    # Chemin vers le dossier images
    img_dir = os.path.join(os.getcwd(), "images")
    if os.path.exists(img_dir):
        optimize_images(img_dir)
    else:
        print(f"Dossier {img_dir} non trouvé.")
