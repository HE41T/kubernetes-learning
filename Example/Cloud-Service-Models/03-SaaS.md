# ☁️ Software as a Service (SaaS)

> โมดูลสุดท้ายของ Cloud Service Model
> **SaaS คือซอฟต์แวร์สำเร็จรูปที่พร้อมใช้งานทันที**

---

## 📌 สรุปเนื้อหา: SaaS (ซอฟต์แวร์พร้อมใช้)

**SaaS (Software as a Service)** คือโมเดล Cloud ที่ "สำเร็จรูปที่สุด"
ผู้ให้บริการดูแลทุกอย่าง ผู้ใช้แค่เปิดเว็บแล้วใช้งาน

---

## 1️⃣ SaaS คืออะไร? (The Definition)

### 🏢 Provider ทำอะไรบ้าง?

Provider ดูแลทั้งหมดตั้งแต่ต้นจนจบ:

* Hardware
* OS
* Runtime Environment
* Application
* Data & Security

### 👤 User ทำอะไร?

> 🌐 เปิด Web Browser → Login → ใช้งาน

ไม่ต้องรู้ ไม่ต้องสน:

* Server อยู่ไหน
* ใช้ Kubernetes หรือ Docker หรือไม่

### 🔎 ตัวอย่าง SaaS

* Gmail
* Microsoft 365
* Dropbox
* Salesforce
* Zoom

---

## 2️⃣ ลักษณะเด่นของ SaaS (Characteristics)

### 🌍 Internet Based

* ต้องมีอินเทอร์เน็ตจึงจะใช้งานได้
* ❌ เน็ตล่ม = ทำงานไม่ได้

---

### 🧩 Multitenancy (หัวใจของ SaaS)

* แอปเดียว รองรับผู้ใช้จำนวนมาก
* ใช้ **Code ชุดเดียว** แต่แยกข้อมูลของแต่ละ User

> ตัวอย่าง: Facebook ใช้โค้ดชุดเดียว
> แต่ข้อมูลผู้ใช้ไม่ปนกัน

---

### 💳 Subscription Model

* จ่ายรายเดือน / รายปี
* เลิกใช้ = หยุดจ่าย
* ไม่ต้องแบกรับค่า Server ระยะยาว

---

## 3️⃣ ปัญหาและความเสี่ยง (The Issues) ⚠️

### 🌐 Network Dependence

* SaaS ผูกกับอินเทอร์เน็ตโดยตรง
* "เน็ตล่ม = จบเห่"

---

### 🧭 Browser Risks

* ถ้า Browser ติด Malware
* ข้อมูลใน SaaS ก็เสี่ยงตามไปด้วย

---

### 📦 Lack of Portability (ย้ายยาก)

📖 ตัวอย่าง:

* ใช้ Salesforce เก็บข้อมูลลูกค้ามา 10 ปี
* วันหนึ่งอยากย้ายผู้ให้บริการ

📌 ปัญหาที่เจอ:

* โครงสร้างข้อมูลไม่เหมือนกัน
* Export ข้อมูลยากมาก

> เปรียบเหมือนย้ายบ้านพร้อม Built-in ทั้งหลัง 😅

---

# 🧪 LAB: The SaaS Provider

> 🎭 Lab นี้คุณจะรับบทเป็น **ผู้ให้บริการ SaaS**

### แนวคิดของ Lab

* Lab PaaS: ต้อง Upload Code (HTML)
* Lab SaaS: **User ไม่ต้องแตะ Code เลย**

🎯 เป้าหมาย:

> Deploy แอป "File Manager Online"
> ให้ User Login แล้วใช้งานได้ทันที

---

## Step 1️⃣ สวมบท Provider (Deploy Application)

เราจะใช้ Image:

> **filebrowser/filebrowser**
> แอปจัดการไฟล์ผ่านเว็บ (คล้าย Google Drive ส่วนตัว)

### 📄 สร้างไฟล์ `saas-app.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-saas-drive
spec:
  replicas: 1
  selector:
    matchLabels:
      app: saas-drive
  template:
    metadata:
      labels:
        app: saas-drive
    spec:
      initContainers:
      - name: init-db
        image: filebrowser/filebrowser:latest
        command: ["/bin/sh", "-c"]
        args:
          - |
            echo "Starting Init..."
            if [ ! -f /srv/database.db ]; then
              filebrowser config init -d /srv/database.db
            fi

            # สร้าง user admin (รหัสผ่านยาว)
            filebrowser users add admin adminpassword123 --perm.admin -d /srv/database.db || true

            echo "Init Complete!"
        volumeMounts:
        - name: data-store
          mountPath: /srv
      containers:
      - name: filebrowser
        image: filebrowser/filebrowser:latest
        args: ["-d", "/srv/database.db", "--address", "0.0.0.0", "--port", "8080"]
        ports:
        - containerPort: 8080
        volumeMounts:
        - name: data-store
          mountPath: /srv
      volumes:
      - name: data-store
        emptyDir: {}
```

### ▶️ สั่ง Deploy

```bash
kubectl apply -f saas-app.yaml
```

---

## Step 2️⃣ สวมบท User (Usage)

User ไม่สนว่าข้างหลังใช้เทคโนโลยีอะไร
สนแค่ว่า **มี URL ให้เข้าไหม**

### 1. ตรวจสอบสถานะ

```bash
kubectl get pods
```

รอจนสถานะเป็น `Running`

---

### 2. เปิดทางเข้า (Port Forward)

```bash
kubectl port-forward deployment/my-saas-drive 5050:8080 --address 0.0.0.0
```

---

### 3. เข้าใช้งานผ่าน Browser

```
http://<IP-Master-Node>:5050
```

**Login:**

* Username: `admin`
* Password: `adminpassword123`

---

### 4. ทดลองใช้งาน

* Upload ไฟล์
* สร้าง Folder
* เปลี่ยนชื่อไฟล์

---

## 🔍 วิเคราะห์ผลลัพธ์ (SaaS vs PaaS)

| มุมมอง          | PaaS       | SaaS          |
| --------------- | ---------- | ------------- |
| บทบาท           | Developer  | End User      |
| ต้องเตรียม Code | ✅ HTML     | ❌ ไม่ต้อง     |
| การใช้งาน       | Deploy แอป | Login แล้วใช้ |

---

## 🌱 Open SaaS (แนวคิดเสริม)

**Open SaaS** คือการใช้ Open Source Software มาทำเป็น SaaS

### ✅ ข้อดี

* Export ข้อมูลได้
* ย้าย Cloud ได้ง่าย
* ลดความเสี่ยง Vendor Lock-in

> ตัวอย่าง: FileBrowser ที่ใช้ใน Lab นี้

---

## 🎉 สรุปจบซีรีส์ Cloud & Kubernetes Lab

คุณได้ทดลองครบทั้ง 3 โมเดลแล้ว:

* **IaaS**
  เช่าเครื่องเปล่า → ดูแล OS เอง

* **PaaS**
  เช่ารันไทม์ → Deploy Code

* **SaaS**
  เช่าแอป → Login แล้วใช้

---

> 💡 Kubernetes คือรากฐานที่ทรงพลัง
> เพราะสามารถใช้สร้างได้ทั้ง IaaS, PaaS และ SaaS
> บน Infrastructure ของเราเอง

---

🎯 พร้อมจะไปต่อหัวข้อไหน?

* Security บน Kubernetes
* Cloud Cost Management
* DevOps / GitOps
* หรือพักย่อยข้อมูลก่อน 😉
