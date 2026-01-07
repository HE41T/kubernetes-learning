# Kubernetes `kubectl describe` – การอธิบายเชิงการทำงานจริง (เชิงลึก)

เอกสารนี้อธิบายการใช้งานคำสั่ง `kubectl describe` โดยเน้น **การทำงานจริง**, **การ Debug**, และ **ความเข้าใจเชิงลึก** พร้อมคำอธิบายภาษาไทย เหมาะสำหรับการสอบ Kubernetes และใช้งานจริงใน Production

---

## แนวคิดหลักของ `kubectl describe`

`kubectl describe` ใช้สำหรับ **ดูรายละเอียดเชิงลึกของ Kubernetes Resource** ซึ่งเป็นข้อมูลที่ `kubectl get` ไม่แสดง เช่น:

* Events (เหตุการณ์ที่เกิดขึ้นจริง)
* สาเหตุ error / warning
* สถานะภายในของ resource

> ถ้า `kubectl get` = ดูภาพรวมสั้น ๆ
> `kubectl describe` = ดูว่า "เกิดอะไรขึ้นจริง ๆ"

---

## Kubernetes ทำอะไรเบื้องหลังเมื่อสั่ง `kubectl describe`

1. kubectl เรียก Kubernetes API Server
2. API Server ดึงข้อมูล:

   * `spec` (สิ่งที่ต้องการ)
   * `status` (สิ่งที่เกิดขึ้นจริง)
   * `events` ที่เกี่ยวข้อง
3. kubectl แสดงผลในรูปแบบที่มนุษย์อ่านเข้าใจง่าย

> ⚠️ คำสั่งนี้เป็น **Read-only** ไม่กระทบระบบ

---

## 1. Describe a Node

### แปล

แสดงรายละเอียดของ Node ที่ระบุชื่อ

```bash
kubectl describe nodes kubernetes-node-emt8.c.myproject.internal
```

### การทำงานจริง

ข้อมูลที่ได้ เช่น:

* Capacity / Allocatable (CPU, Memory)
* Conditions (Ready, DiskPressure, MemoryPressure)
* Pod ที่รันอยู่บน Node
* Events ของ Node

### ใช้เมื่อ

* Pod schedule ไม่ได้
* Node มีปัญหา
* ตรวจสอบ performance cluster

---

## 2. Describe a Pod by name

### แปล

ดูรายละเอียดของ Pod ชื่อ `nginx`

```bash
kubectl describe pods/nginx
```

### การทำงานจริง

แสดง:

* Container image
* Environment variables
* Volume mount
* Node ที่ Pod รันอยู่
* Events (CrashLoopBackOff, ImagePullBackOff ฯลฯ)

### ใช้เมื่อ

* Pod รันไม่ขึ้น
* Container crash

---

## 3. Describe a Pod from file

### แปล

ดูรายละเอียด Pod โดยอ้างอิงชนิดและชื่อจากไฟล์ `pod.json`

```bash
kubectl describe -f pod.json
```

### การทำงานจริง

* kubectl อ่าน `kind` และ `metadata.name`
* ดึง resource จริงจาก cluster

---

## 4. Describe all Pods

### แปล

ดูรายละเอียด Pod ทุกตัวใน namespace ปัจจุบัน

```bash
kubectl describe pods
```

### การทำงานจริง

* Describe ทุก Pod
* แสดง event ของแต่ละ Pod

⚠️ Output ยาวมาก

---

## 5. Describe Pods by label selector

### แปล

ดู Pod ที่มี label `name=myLabel`

```bash
kubectl describe po -l name=myLabel
```

### การทำงานจริง

* Kubernetes filter Pod ด้วย label
* Describe เฉพาะ Pod ที่ตรงเงื่อนไข

---

## 6. Describe Pods managed by ReplicationController

### แปล

ดู Pod ทั้งหมดที่ถูกสร้างโดย ReplicationController ชื่อ `frontend`

```bash
kubectl describe pods frontend
```

### การทำงานจริง

* Pod ที่ถูกสร้างโดย RC จะมี prefix เป็นชื่อ RC
* Kubernetes match ชื่อ Pod

### ใช้เมื่อ

* Debug scaling
* Pod ถูกสร้าง/ลบซ้ำ

---

## 7. Describe Resource (Generic)

### แปล

ดูรายละเอียด resource ตัวเดียวหรือหลายตัว

```bash
kubectl describe <resource> <name>
```

### ตัวอย่าง

```bash
kubectl describe deployment nginx
kubectl describe service frontend
kubectl describe pvc my-pvc
```

---

## เปรียบเทียบ `kubectl get` vs `kubectl describe`

| Command          | จุดประสงค์            |
| ---------------- | --------------------- |
| kubectl get      | ดูสถานะโดยรวม         |
| kubectl describe | ดูรายละเอียด + events |
| kubectl logs     | ดู log ใน container   |
| kubectl exec     | เข้า container        |

---

## Key Insight (สำคัญมาก)

* ปัญหา Kubernetes ส่วนใหญ่เริ่มแก้จาก `kubectl describe`
* Events ด้านล่างสุดมักบอกสาเหตุที่แท้จริง
* ใช้ร่วมกับ `get`, `logs`, `exec` เพื่อ Debug อย่างเป็นระบบ

---

> เอกสารนี้สามารถใช้เป็น Cheat Sheet, Lab Guide และ Reference สำหรับ Production ได้ทันที
