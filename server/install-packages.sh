# chmod +x install-packages.sh (คำสั่งให้สิทธิ์การรันสคริปต์)
# ./install-packages.sh (คำสั่งในการดาวน์โหลดแพ็คเกจ)

#!/bin/bash
# สคริปต์นี้ใช้เพื่อติดตั้งแพ็กเกจจากไฟล์ requirements.txt
# ตรวจสอบว่าไฟล์ requirements.txt มีข้อมูลหรือไม่
if [ ! -s ./requirements.txt ]; then
  echo "ไฟล์ requirements.txt ว่างเปล่า!"
  exit 1
fi

# อ่านและติดตั้งแพ็กเกจแต่ละตัวที่ระบุในไฟล์
while IFS= read -r package; do
  echo "กำลังติดตั้ง $package..."
  npm install "$package"
done < ./requirements.txt

# ติดตั้ง nodemon ในระดับ dev
npm install --save-dev nodemon 

# เสร็จสิ้นการติดตั้งแพ็กเกจ
echo "ติดตั้งแพ็กเกจทั้งหมดเสร็จสิ้นแล้ว!"
