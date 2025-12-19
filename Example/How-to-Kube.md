# Kubernetes Concepts & Mini Project

เอกสารนี้อธิบายแนวคิด Kubernetes ที่สำคัญ พร้อม Mini-Project ตัวอย่าง เพื่อใช้สำหรับการเรียน การสอบ และการใช้งานจริง

---

## 1. Cluster

### ความหมาย

Cluster คือกลุ่มของเครื่อง (Node) ที่ทำงานร่วมกันภายใต้ Kubernetes

### โครงสร้างหลัก

* **Master Node (Control Plane)**: ควบคุมการทำงานทั้งหมดของ Cluster
* **Worker Node**: ใช้รัน Pod และ Application

### เหตุผลที่ Production ต้องมี Master อย่างน้อย 3 เครื่อง

* ใช้ระบบ quorum ของ **etcd**
* รองรับ High Availability (HA)
* Master เสีย 1 เครื่อง ระบบยังทำงานต่อได้

> สำหรับ Lab หรือ Mini-Project สามารถใช้ 1 Master ได้

---

## 2. Single Node

### ความหมาย

* มี 1 Master Node
* มี 1 หรือหลาย Worker Node

### การใช้งาน

* เหมาะสำหรับ Lab / Learning / Mini-Project
* ไม่เหมาะกับ Production เพราะไม่มี HA

---

## 2.1 การคำนวณสเปก Master Node และ Worker Node

หัวข้อนี้อธิบายแนวคิด **การประเมินสเปก (CPU / RAM / Disk)** ของ Master และ Worker เพื่อใช้งานจริง

### บทบาทที่แตกต่างกัน

| Node        | หน้าที่หลัก                           |
| ----------- | ------------------------------------- |
| Master Node | ควบคุม Cluster, Scheduling, API, etcd |
| Worker Node | รัน Pod / Container / Application     |

---

### สเปก Master Node (Control Plane)

Master **ไม่เน้นรัน Application** แต่เน้นความเสถียรและการตอบสนองของระบบควบคุม

#### Resource ที่ Master ใช้

* kube-apiserver
* kube-scheduler
* kube-controller-manager
* etcd

#### สเปกแนะนำ

| ขนาดระบบ           | CPU     | RAM      | Disk       |
| ------------------ | ------- | -------- | ---------- |
| Lab / Mini-Project | 2 vCPU  | 4 GB     | 40–50 GB   |
| Small Production   | 4 vCPU  | 8 GB     | 100 GB SSD |
| Medium / Large     | 8+ vCPU | 16–32 GB | 200 GB SSD |

📌 **เหตุผล**

* etcd ใช้ RAM และ Disk I/O สูง
* API Server ต้องตอบสนองเร็ว

---

### สเปก Worker Node

Worker คือจุดที่ **Application รันจริง** → ต้องคำนวณจากจำนวน Pod

#### แนวคิดการคำนวณ

```text
Worker Resource ≥ (Resource ของ Pod × จำนวน Pod) + Buffer
```

#### ตัวอย่างการคำนวณ

สมมติ:

* 1 Pod ใช้ CPU = 0.5 Core
* 1 Pod ใช้ RAM = 512 MB
* ต้องการรัน 20 Pods

```text
CPU = 0.5 × 20 = 10 Cores
RAM = 512MB × 20 = 10 GB
```

➡️ Worker ควรมีอย่างน้อย:

* CPU ≥ 12 Cores (เผื่อระบบ)
* RAM ≥ 12–16 GB

---

### สเปก Worker แนะนำ (โดยประมาณ)

| ขนาดระบบ     | CPU       | RAM      | Disk      |
| ------------ | --------- | -------- | --------- |
| Lab          | 2–4 vCPU  | 4–8 GB   | 40 GB     |
| Mini-Project | 4–8 vCPU  | 8–16 GB  | 80–100 GB |
| Production   | 8–32 vCPU | 16–64 GB | 200 GB+   |

📌 Disk ของ Worker ใช้สำหรับ:

* Image Container
* Log
* EmptyDir Volume

---

### สรุปแนวคิดการออกแบบ

* **Master** → เน้นเสถียร ไม่เน้นแรงมาก
* **Worker** → คำนวณจาก Pod ที่จะรันจริง
* ควรเผื่อ Resource อย่างน้อย 20–30%
* Production ควรแยก Master กับ Worker เสมอ

---

> แนวคิดนี้ใช้ได้ทั้ง On-Premise, VM และ Cloud

## 3. Namespace

### ความหมาย

* มี 1 Master Node
* มี 1 หรือหลาย Worker Node

### การใช้งาน

* เหมาะสำหรับ Lab / Learning / Mini-Project
* ไม่เหมาะกับ Production เพราะไม่มี HA

---

## 3. Namespace

### ความหมาย

Namespace คือการแบ่งพื้นที่ภายใน Cluster เพื่อแยกการทำงานของแต่ละระบบ

### ตัวอย่างการใช้งาน

* แยก Service
* แยก Environment (dev / prod)
* ใช้ร่วมกับ RBAC เพื่อควบคุมสิทธิ์

```text
namespace:
- buy-svc
- payment-svc
```

---

## 4. Network Policy

### ความหมาย

Network Policy ใช้ควบคุมว่า Pod ไหนสามารถติดต่อกับ Pod อื่นได้บ้าง

### Scenario (3-Tier Application)

```text
Frontend → Backend → Database
❌ Frontend → Database (ห้าม)
```

### ประโยชน์

* เพิ่มความปลอดภัย
* ลดความเสี่ยงจากการโจมตีโดยตรงไปที่ DB

---

## 5. Autoscale (HPA)

### ความหมาย

Horizontal Pod Autoscaler (HPA) คือการเพิ่ม-ลดจำนวน Pod อัตโนมัติตาม Load

### ตัวอย่าง

```text
minReplicas = 10
maxReplicas = 20
```

### ประโยชน์

* รองรับ Traffic สูง
* ประหยัด Resource เมื่อ Load ลดลง

---

## 6. RBAC (Role-Based Access Control)

### ความหมาย

RBAC คือระบบกำหนดสิทธิ์ว่าใครสามารถทำอะไรใน Kubernetes ได้

### ตัวอย่างสิทธิ์

* อ่าน Pod ได้
* ลบ Pod ไม่ได้
* เข้าถึงเฉพาะ Namespace ที่กำหนด

---

## 7. Service Account

### ความหมาย

Service Account คือ Account สำหรับ Pod หรือ Application

### การใช้งาน

* ให้ Pod เรียก Kubernetes API
* ใช้ร่วมกับ RBAC เพื่อจำกัดสิทธิ์

---

## 8. Ingress

### ความหมาย

Ingress คือทางเข้า (HTTP/HTTPS) จากภายนอก Cluster

### การใช้งานในระบบ

```text
Internet → Ingress → Frontend Service
```

> Backend และ Database จะไม่ถูกเปิดให้เข้าจากภายนอก

---

## 9. Egress

### ความหมาย

Egress คือการควบคุมการออกจาก Pod ไปยังภายนอก

### ประโยชน์

* ควบคุมการเข้าถึง Internet
* ลดความเสี่ยงจาก Malware

---

## 10. Persistent Volume (PV / PVC)

### ปัญหา

Pod ถูกลบหรือ Restart → ข้อมูลหาย

### แนวทางแก้ไข

ใช้ Storage ที่แยกออกจาก Pod

### องค์ประกอบ

* **PV (Persistent Volume)**: Storage จริง
* **PVC (Persistent Volume Claim)**: คำขอใช้ Storage

### ตัวอย่าง

```text
Storage Type: HDD
Size: 20GB
ใช้กับ Database
```

---

## 11. Resource Limit

### ความหมาย

กำหนดขอบเขตการใช้ CPU และ RAM ของแต่ละ Pod

### ตัวอย่าง

```text
RAM = 10
CPU = 100
```

### ประโยชน์

* ป้องกัน Pod ใช้ Resource เกิน
* เพิ่มความเสถียรของ Cluster

---

# Mini-Project: Kubernetes Single Node

## โครงสร้างระบบ

```text
Cluster:
- 1 Master Node
- 1 Worker Node
```

## Application Architecture (3-Tier)

```text
Frontend (nginx)
   ↓
Backend
   ↓
Database (PV / PVC)
```

## Namespace

```text
- buy-svc
- payment-svc
```

## Network & Security

* Ingress เปิดให้เข้าที่ Frontend เท่านั้น
* Network Policy:

  * Frontend → Backend (อนุญาต)
  * Backend → Database (อนุญาต)
  * Frontend → Database (ไม่อนุญาต)

## Scaling

```text
HPA:
- min = 10
- max = 20
```

## Storage

```text
Persistent Volume:
- Type: HDD
- Size: 20GB
```

## Security & Control

* ใช้ RBAC
* ใช้ Service Account
* กำหนด Resource Limit ทุก Pod

---

> เอกสารนี้สามารถใช้เป็น Cheat Sheet สำหรับสอบ และเป็นแนวทางออกแบบระบบ Kubernetes ได้จริง
