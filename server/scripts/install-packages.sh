# chmod +x scripts/install-packages.sh (คำสั่งให้สิทธิ์การรันสคริปต์)
# ./scripts/install-packages.sh (คำสั่งในการดาวน์โหลดแพ็คเกจ)

#!/bin/bash

# สคริปต์นี้ใช้เพื่อติดตั้งแพ็กเกจจากไฟล์ requirements.txt
while IFS= read -r package; do
  # ติดตั้งแพ็กเกจแต่ละตัวที่ระบุในไฟล์
  npm install "$package"
done < requirements.txt

# ติดตั้ง nodemon
npm install -g nodemon 

# เสร็จสิ้นการติดตั้งแพ็กเกจ
echo "ติดตั้งแพ็กเกจทั้งหมดเสร็จสิ้นแล้ว!"