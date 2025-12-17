# 🧩 Platform as a Service (PaaS)

> โมดูลนี้คือ **Platform-as-a-Service (PaaS)**
> โมเดล Cloud ที่ช่วยให้คุณโฟกัสกับการพัฒนาแอป โดยไม่ต้องปวดหัวกับระบบพื้นฐาน

---

## 🏢 เปรียบเทียบให้เห็นภาพ

* **IaaS** = เช่าที่ดินเปล่า 🏗️
  ได้อิสระสูง แต่ต้องสร้างบ้านเองทุกขั้นตอน

* **PaaS** = เช่าห้องในคอนโดหรู 🏙️✨
  มีเฟอร์นิเจอร์ครบ มีแม่บ้านดูแลระบบให้
  ❌ แต่ไม่สามารถทุบกำแพงหรือแก้โครงสร้างได้

---

## 📌 สรุปเนื้อหา: PaaS (แพลตฟอร์มพร้อมใช้)

**PaaS** คือแพลตฟอร์มที่เตรียมสภาพแวดล้อมสำหรับรันแอปไว้ให้ครบแล้ว
Developer มีหน้าที่หลักคือ **เขียนโค้ด → Upload → Run**

---

## 1️⃣ PaaS ให้อะไรเราบ้าง? (The Offering)

### 🧰 สิ่งที่ PaaS เตรียมไว้ให้

* **Runtime Environment** (เช่น Web Server, App Server)
* ระบบ Deploy แอป
* ระบบ Scale อัตโนมัติ
* ระบบ Security และ Patch

### 👨‍💻 สำหรับ Developer

> ✍️ เขียนโค้ดอย่างเดียว แล้วกด Upload

### 🏢 สำหรับ Provider

Provider จะเป็นคนดูแลทั้งหมด ได้แก่

* OS
* Patch Update
* Security
* Auto-scaling
* Hardware

### 🔎 ตัวอย่างบริการ PaaS

* Google App Engine
* Heroku
* AWS Elastic Beanstalk
* Kubernetes (Managed Service)

---

## 2️⃣ ข้อดีของ PaaS (Benefits) — ทำไม Developer ชอบ?

### 🧹 Lower Admin Overhead

* ไม่ต้อง `apt-get update`
* ไม่ต้องแก้ปัญหา OS
* สบายกว่า Lab IaaS ชัดเจน 😄

### 📈 Scalability

* ระบบขยายตัวอัตโนมัติตาม Load งาน

### 💰 Cost Effective

* ไม่ต้องซื้อ Server มารอ
* จ่ายตามการใช้งานจริง

### 🎯 Focus on Code

* เอาเวลาไปเขียนโค้ดสร้างมูลค่า
* ไม่ต้องเฝ้า Server

---

## 3️⃣ ปัญหาและความเสี่ยง (The Issues) 🔒

### 🔗 Vendor Lock-in (การถูกผูกขาด)

📖 ตัวอย่าง:

* คุณเขียนโค้ดโดยใช้ API เฉพาะของ **Google App Engine**

📌 ผลที่ตามมา:

* วันหนึ่ง Provider ขึ้นราคา
* ❌ ย้ายไป AWS ไม่ได้
* ❌ ต้องรื้อเขียนโค้ดใหม่เกือบทั้งหมด

> เปรียบเหมือนแต่งคอนโดแบบ Built-in
> พอย้ายออก → ยกเฟอร์นิเจอร์ไปไม่ได้

---

## 4️⃣ ประเภทของ PaaS (Types of PaaS)

### 🧩 Stand-alone PaaS

* เครื่องมือเฉพาะทาง
* แยกเป็นแพลตฟอร์มเดี่ยว

### ➕ Add-on PaaS

* ส่วนเสริมที่ทำงานร่วมกับ SaaS
* เช่น Script เสริมใน Salesforce

### 🌍 Open PaaS

* ใช้ Open Source เช่น Cloud Foundry, Kubernetes
* ✔️ ลดความเสี่ยง Vendor Lock-in

---

# 🧪 LAB: The PaaS Developer

> 🎭 คุณรับบทเป็น **Developer**

### ภารกิจ

* Lab IaaS: ต้องลง `curl`, `vim`, `htop` เอง → วุ่นวาย
* Lab นี้: **ไม่ยุ่งกับ OS เลย**

🎯 โจทย์:

> "ผมมีโค้ด HTML หน้าเว็บอยู่ไฟล์หนึ่ง
> ช่วยเอามันขึ้นเว็บให้หน่อย โดยที่ผมไม่ต้องแตะ OS"

---

## Step 1️⃣ เตรียมโค้ด (The Code)

สมมติคุณเขียนหน้าเว็บเสร็จแล้ว 1 ไฟล์
เราจะเก็บโค้ดนี้ไว้ใน **ConfigMap** (เปรียบเสมือนการ Upload Code)

```bash
# 1. สร้างไฟล์ index.html
echo "<h1>Hello! This is PaaS on Kubernetes</h1><p>I focus on Code, not OS.</p>" > index.html

# 2. อัปโหลดโค้ดเข้าสู่ระบบ
kubectl create configmap my-web-code --from-file=index.html
```

---

## Step 2️⃣ รันบนแพลตฟอร์ม (The Platform)

* ใช้ **Nginx Image** เป็น Platform
* Developer ไม่เข้าไปจัดการภายใน
* แค่ Mount โค้ดเข้าไป

### 📄 สร้างไฟล์ `paas-deploy.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-paas-web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: paas-web
  template:
    metadata:
      labels:
        app: paas-web
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        volumeMounts:
        - name: code-volume
          mountPath: /usr/share/nginx/html
      volumes:
      - name: code-volume
        configMap:
          name: my-web-code
```

### ▶️ สั่งรัน

```bash
kubectl apply -f paas-deploy.yaml
```

---

## Step 3️⃣ ทดสอบใช้งาน

### 1. ตรวจสอบ Pod

```bash
kubectl get pods
```

### 2. Port Forward

```bash
kubectl port-forward deployment/my-paas-web 8080:80 --address 0.0.0.0
```

### 3. เปิด Browser

```
http://<IP-Master-Node>:8080
```

📌 ผลลัพธ์:

* แสดงข้อความ **"Hello! This is PaaS..."**

> กด `Ctrl + C` เพื่อหยุดการทดสอบ

---

## Step 4️⃣ จำลองฟีเจอร์ Scalability

PaaS ที่ดีต้องขยายได้ง่าย

```bash
# ลูกค้าบอกเว็บช้า ขอเพิ่มเป็น 5 เครื่อง
kubectl scale deployment my-paas-web --replicas=5
```

### ตรวจสอบผลลัพธ์

```bash
kubectl get pods
```

📌 สิ่งที่เกิดขึ้น:

* Pod เพิ่มเป็น **5 ตัวทันที**
* ไม่ต้องติดตั้ง OS ใหม่
* ไม่ต้อง Config เพิ่ม

---

## ✅ สรุป Lab นี้สอนอะไร?

* **Abstraction** 🎭
  ไม่ต้องยุ่งกับ `apt-get` หรือ Linux เลย

* **Deployment Speed** 🚀
  เร็วกว่า Lab IaaS อย่างเห็นได้ชัด

* **Scalability** 📈
  เพิ่มจำนวนเครื่องได้ภายในไม่กี่วินาที

---

> 💡 PaaS เหมาะกับทีมที่อยากพัฒนาแอปได้เร็ว
> และยอมแลกอิสระบางส่วน เพื่อความสะดวกและความเสถียร
