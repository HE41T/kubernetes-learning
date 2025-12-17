# ☁️ Infrastructure as a Service (IaaS)

> โมเดล Cloud ที่ **ดิบที่สุด** และ **ให้อิสระกับผู้ใช้มากที่สุด**
> เปรียบได้กับบริการอย่าง **AWS EC2** หรือ **Google Compute Engine**

---

## 📌 สรุปภาพรวม

**IaaS (Infrastructure as a Service)** คือการเช่า **โครงสร้างพื้นฐานทาง IT** แบบเสมือน ผู้ให้บริการจะดูแลแค่ระดับ Hardware ส่วนที่เหลือคุณต้องจัดการเองทั้งหมด

---

## 1️⃣ IaaS ให้อะไรเราบ้าง? (The Resources)

IaaS คือการเช่า **"Hardware เสมือน"** โดยสิ่งที่คุณจะได้รับคือ

* **Virtual Machine (VM)** 🖥️
  เครื่องคอมพิวเตอร์เสมือน (CPU / RAM)

* **Disk Storage** 💾
  ฮาร์ดดิสก์เปล่า ๆ ให้คุณจัดการเอง

* **Networking** 🌐
  เช่น Virtual Network (VLAN), IP Address, Load Balancer

**สรุปแบบเข้าใจง่าย:**

> 🏠 ผู้ให้บริการให้แค่ **โครงบ้าน + น้ำไฟ + อินเทอร์เน็ต**
> 🛋️ การตกแต่งบ้าน ลงเฟอร์นิเจอร์ และดูแลทุกอย่าง = **หน้าที่ของคุณ**

---

## 2️⃣ ข้อดีของ IaaS (Benefits) — ทำไม Admin ถึงชอบ?

### 🔑 Full Control (Root Access)

* ได้สิทธิ์ **Root / Administrator** เต็มรูปแบบ
* อยากลง OS อะไร? ปรับ Kernel ยังไง? 👉 ทำได้หมด

### 🕰️ Legacy Support

* แอปเก่ามากที่รันได้แค่ **Windows Server 2008** หรือ Linux รุ่นโบราณ
* IaaS ตอบโจทย์ เพราะคุณเลือก OS เองได้

### 📈 Scalability

* อยากได้เครื่องเพิ่ม 👉 **กดปุ่มเดียว** VM ใหม่มาเลย
* ไม่ต้องรอสั่งซื้อ Server เป็นเดือนเหมือนสมัยก่อน

---

## 3️⃣ ปัญหาและความเสี่ยง (The Dark Side) 💀

### ⚠️ Legacy Vulnerabilities (ช่องโหว่ของของเก่า)

* คุณเลือก OS เองได้ก็จริง…
* แต่ถ้าเลือก **Windows XP** หรือ **Ubuntu 14.04** (EOL แล้ว)

📌 **ผลลัพธ์:**

* เสี่ยงโดนแฮกสูงมาก
* Cloud Provider **ไม่รับผิดชอบ** (Shared Responsibility)

---

### 🧟 VM Sprawl (ซอมบี้ VM)

* สร้าง VM ง่ายเกินไป → เทสเสร็จแล้วลืมลบ
* VM พวกนี้จะ:

  * 💸 กินเงิน
  * 🔓 ไม่ได้ Patch
  * กลายเป็นช่องโหว่ของระบบ

---

### 🗑️ Data Erase Practices (ข้อมูลตกค้าง)

* Disk บน Cloud เป็น **Shared Disk**

❓ คำถามสำคัญ:

> ลบไฟล์แล้ว… **มันหายจริงไหม?** หรือแค่ลบ Shortcut?

📌 Cloud Provider ต้องมีมาตรฐานการลบข้อมูล (เช่น **DoD Wipe Standard**)
เพื่อป้องกันไม่ให้ลูกค้าคนถัดไปกู้ข้อมูลของคุณได้

---

# 🧪 LAB: The IaaS Administrator

> 🎭 คุณจะรับบทเป็น **ผู้ดูแลระบบ (Admin)**

### แนวคิดของ Lab

* Kubernetes = **IaaS Provider**
* Pod = **VM ที่คุณเช่า**
* คุณต้องดูแล Software เองทั้งหมด

---

## Step 1️⃣ สร้างเครื่องเปล่า (Provision VM)

สร้าง Pod ที่เป็น Debian เปล่า ๆ 1 ตัว

```bash
# สร้าง Pod ชื่อ my-server (เปรียบเหมือนเช่า VM)
kubectl run my-server --image=debian:latest --command -- sleep infinity
```

---

## Step 2️⃣ เข้าไปจัดการเครื่อง (Full Control)

### 1. Remote เข้าเครื่อง

```bash
kubectl exec -it my-server -- bash
```

### 2. ลองรันคำสั่งพื้นฐาน

```bash
curl google.com
```

📌 ผลลัพธ์:

* `command not found`
* เพราะนี่คือ **เครื่องเปล่าจริง ๆ**

---

### 3. ติดตั้ง Software เอง (หน้าที่ของ IaaS User)

```bash
apt-get update
apt-get install -y curl vim htop
```

---

### 4. ทดลองใช้งาน

```bash
htop
```

> ออกจากโปรแกรมด้วย `F10` หรือ `q`

---

## Step 3️⃣ จำลองปัญหา Legacy Vulnerability

### 1. ออกจาก Pod เดิม

```bash
exit
```

### 2. ลบ Pod เดิม

```bash
kubectl delete pod my-server
```

---

### 3. สร้าง Pod รุ่นโบราณ (Alpine 3.1)

```bash
kubectl run legacy-server --image=alpine:3.1 --command -- sleep infinity
```

> ⚠️ Image นี้เก่ากว่า **10 ปี**

---

### 4. เข้าไปดูภายใน

```bash
kubectl exec -it legacy-server -- sh
```

### 5. ลองติดตั้ง Software

```bash
apk add curl
```

📌 สิ่งที่อาจเจอ:

* Repo หาไม่เจอ
* หรือได้ `curl` เวอร์ชันที่มีช่องโหว่ (เช่น **SSL Heartbleed**)

---

### 🧠 บทเรียนจาก Step นี้

> Cloud Provider ให้เครื่องคุณได้
> แต่ **ความปลอดภัยของ OS = ความรับผิดชอบของคุณ**

---

## Step 4️⃣ จำลอง VM Sprawl (ซอมบี้กินเงิน)

ในโลกจริง:

* ถ้าคุณสร้าง `legacy-server` ทิ้งไว้
* ต่อให้ไม่ใช้ → **ยังโดนคิดเงิน**

### วิธีที่ถูกต้อง

```bash
# เช็คว่ามีอะไรเปิดค้างไว้บ้าง
kubectl get pods

# ลบ Pod ที่ไม่ใช้แล้ว
kubectl delete pod legacy-server
```

---

## ✅ สรุป Lab นี้สอนอะไร?

* **IaaS = อิสระ** 🕊️
  อยากลงอะไร ทำได้หมด

* **Responsibility = ภาระ** 🧑‍💻
  ต้องดูแล OS, Patch, Security เอง

* **Risk = ความเสี่ยง** ⚠️
  เลือก Image ผิด → ระบบไม่ปลอดภัยทันที

---

> 💡 IaaS เหมาะกับทีมที่ต้องการอิสระสูง
> แต่ก็ต้องพร้อมรับผิดชอบความเสี่ยงทั้งหมดด้วยเช่นกัน
