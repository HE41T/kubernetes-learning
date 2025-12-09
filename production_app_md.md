# production-app.yaml Documentation

## 1. The Code (ตัวอย่างโค้ดฉบับเต็ม)

```yaml
# --- ส่วนที่ 1: ผู้จัดการ (Deployment) ---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-web-manager          # ชื่อของตัว Deployment
spec:
  replicas: 3                   # จำนวน Pod ที่อยากได้
  selector:                     # ตัวกรองเพื่อหาลูกน้อง
    matchLabels:
      app: nginx-demo           # "ฉันดูแลเฉพาะเด็กที่มีป้ายชื่อนี้"
  template:                     # แม่พิมพ์ (Blueprint) สำหรับสร้าง Pod
    metadata:
      labels:
        app: nginx-demo         # <--- ป้ายชื่อที่จะแปะให้ Pod (สำคัญมาก)
    spec:
      containers:
      - name: my-nginx
        image: nginx:1.23
        ports:
        - containerPort: 80

---
# --- ส่วนที่ 2: ประชาสัมพันธ์ (Service) ---
apiVersion: v1
kind: Service
metadata:
  name: my-web-service          # ชื่อของตัว Service
spec:
  type: NodePort                # รูปแบบการเปิดประตู (เปิด Port ที่เครื่อง Server)
  selector:                     # ตัวกรองเพื่อหา Pod ที่จะส่งคนไปหา
    app: nginx-demo             # "ส่งคนไปที่ Pod ที่มีป้ายชื่อนี้เท่านั้น"
  ports:
    - port: 80                  # Port ภายใน (Service Port)
      targetPort: 80            # Port ของ Pod (Container Port)
      nodePort: 30099           # Port ภายนอก (เข้าผ่าน IP Server)
```

---

## 2. Code Anatomy (ชำแหละทีละบรรทัด)

### ส่วนที่ 1: Deployment (ผู้จัดการ)
- **apiVersion: apps/v1**  
  Deployment เป็น logic ที่ซับซ้อนกว่า Pod จึงอยู่ในหมวด apps/v1
- **kind: Deployment**  
  บอก Kubernetes ว่าเราต้องการสร้างผู้จัดการที่ scale และ auto-heal ได้
- **metadata → name: my-web-manager**  
  ชื่อ Deployment สำหรับใช้สั่งงาน
- **spec**  
  เริ่มบอกสเปคการทำงาน
- **replicas: 3**  
  ต้องมี Pod รันอยู่ 3 ตัวเสมอ ขาดไม่ได้ เกินก็ไม่เอา
- **selector → matchLabels → app: nginx-demo**  
  Deployment จะดูแลเฉพาะ Pod ที่มีป้ายชื่อนี้เท่านั้น
- **template**  
  แม่พิมพ์สำหรับสร้าง Pod ใหม่ทั้งหมด
- **template → metadata → labels → app: nginx-demo**  
  จุดสำคัญที่สุด! ต้องตรงกับ selector
- **template → spec**  
  ระบุสเปคจริงของ Pod
- **containers → name / image / ports**  
  ใช้ nginx:1.23 และเปิด port 80

### เครื่องหมาย `---`
เป็นตัวแบ่ง YAML เพื่อแยกหลาย object ในไฟล์เดียว

---

### ส่วนที่ 2: Service (ประชาสัมพันธ์)
- **apiVersion: v1**  
  Service เป็น component network พื้นฐาน
- **kind: Service**  
  ตัวกลาง Load Balancer ภายใน
- **metadata → name: my-web-service**  
  ชื่อ Service ใช้เรียกผ่าน DNS ภายใน Cluster
- **spec**  
  ระบุการตั้งค่า network
- **type: NodePort**  
  เปิด port จาก node ให้เข้าถึงได้จากภายนอก
- **selector → app: nginx-demo**  
  ส่ง traffic ให้เฉพาะ Pod ที่มีป้ายนี้
- **ports → port / targetPort / nodePort**  
  การจับคู่ port ทั้งบริการและ Pod ภายใน

---

## 3. สรุปความสัมพันธ์ (The "Magic" Triangle)
สิ่งที่ผูกมัด Deployment + Pod + Service เข้าด้วยกันคือ key เดียว: **nginx-demo**

```
Template Label → app: nginx-demo
Deployment Selector → app: nginx-demo
Service Selector → app: nginx-demo
```

หากเขียนผิดแม้เพียงตัวเดียว เช่น `ngin-demo` ระบบจะทำงานผิดทันที เช่นหา Pod ไม่เจอหรือไม่ส่ง traffic

---

> ไฟล์นี้เป็นรูปแบบ Markdown เพื่ออ่านง่าย ดูดี และเหมาะสำหรับใช้ใน GitHub Repository หรือ Knowledge Base ของคุณ

