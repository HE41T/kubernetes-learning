# Kubernetes `kubectl delete` – การอธิบายเชิงการทำงานจริง (เชิงลึก)

เอกสารนี้อธิบายการใช้งานคำสั่ง `kubectl delete` โดยเน้น **การทำงานจริง (Practical)**, **ความเข้าใจเชิงลึก (Deep Understanding)** และ **คำอธิบายภาษาไทย** เหมาะสำหรับการเรียนรู้ การสอบ และการใช้งาน Kubernetes ในระบบจริง โดยเฉพาะ Production Environment

---

## แนวคิดพื้นฐานของ `kubectl delete`

`kubectl delete` ใช้สำหรับ **ลบ Kubernetes Resource ออกจาก Cluster**

> ⚠️ สิ่งสำคัญที่ต้องเข้าใจ
>
> * การลบไม่ได้หมายความว่า Application จะหยุดเสมอไป
> * Controller (Deployment / ReplicaSet) อาจสร้าง Pod ใหม่ทันที

---

## Kubernetes ทำอะไรเบื้องหลังเมื่อสั่ง `kubectl delete`

1. `kubectl` ส่งคำสั่ง DELETE ไปยัง Kubernetes API Server
2. API Server ใส่ค่า `deletionTimestamp` ให้ resource
3. ตรวจสอบและรัน `finalizers` (ถ้ามี)
4. Controller และ kubelet ทำ cleanup
5. Container ถูกหยุด (SIGTERM → SIGKILL)
6. Resource ถูกลบออกจาก etcd

---

## 1. Delete Pod using JSON file

### แปล

ลบ Pod โดยอ้างอิงชนิดและชื่อจากไฟล์ `pod.json`

```bash
kubectl delete -f ./pod.json
```

### การทำงานจริง

* kubectl อ่าน `kind` และ `metadata.name` จากไฟล์
* ลบ resource จริงใน cluster
* ไฟล์ JSON **ไม่ถูกลบ**

### ใช้เมื่อ

* ใช้ workflow แบบ declarative
* ลบ resource ที่เคยสร้างจากไฟล์เดียวกัน

---

## 2. Delete resources using Kustomize directory

### แปล

ลบ resource ทั้งหมดจาก directory ที่มี `kustomization.yaml`

```bash
kubectl delete -k dir
```

### การทำงานจริง

* kubectl build kustomize
* ได้ manifest ชุดหนึ่ง
* ลบ resource ทุกตัวตาม manifest นั้น

### ใช้เมื่อ

* GitOps workflow
* ลบ environment ทั้งชุด (dev / test)

---

## 3. Delete resources using wildcard JSON files

### แปล

ลบ resource จากทุกไฟล์ที่ลงท้ายด้วย `.json`

```bash
kubectl delete -f '*.json'
```

### การทำงานจริง

* Wildcard ถูกขยายโดย shell
* kubectl รับหลายไฟล์พร้อมกัน
* ลบ resource ตามแต่ละไฟล์

### ใช้เมื่อ

* Cleanup resource จำนวนมาก
* Lab / test environment

---

## 4. Delete resource from stdin

### แปล

ลบ Pod โดยรับ JSON จาก standard input (stdin)

```bash
cat pod.json | kubectl delete -f -
```

### การทำงานจริง

* `-f -` หมายถึงอ่านข้อมูลจาก stdin
* ใช้ได้ดีกับ pipeline และ automation

### ใช้เมื่อ

* CI/CD pipeline
* Script ที่ไม่ต้องเก็บไฟล์ถาวร

---

## 5. Delete Pods and Services by name

### แปล

ลบ Pod และ Service ที่ชื่อ `baz` และ `foo`

```bash
kubectl delete pod,service baz foo
```

### การทำงานจริง

* ลบหลาย resource type
* ลบหลายชื่อในคำสั่งเดียว

### ใช้เมื่อ

* Cleanup resource เฉพาะจุด
* แก้ปัญหาเร่งด่วน

---

## 6. Delete resources by label selector

### แปล

ลบ Pod และ Service ที่มี label `name=myLabel`

```bash
kubectl delete pods,services -l name=myLabel
```

### การทำงานจริง

* Kubernetes ค้น resource ที่ label match
* ลบทุกตัวที่ตรง selector

⚠️ **อันตรายมากหากใช้ label ผิด**

### ใช้เมื่อ

* ลบ application ทั้งชุด
* Cleanup environment

---

## 7. Delete Pod with minimal delay

### แปล

ลบ Pod ทันที โดยไม่รอ graceful shutdown

```bash
kubectl delete pod foo --now
```

### การทำงานจริง

* เทียบเท่า `--grace-period=0`
* kubelet ส่ง SIGKILL
* Container ถูก kill ทันที

### ใช้เมื่อ

* Pod ค้าง (hang)
* Debug ฉุกเฉิน

---

## 8. Force delete Pod on a dead Node

### แปล

บังคับลบ Pod ที่อยู่บน Node ที่ตายแล้ว

```bash
kubectl delete pod foo --force
```

### การทำงานจริง

* ข้ามการสื่อสารกับ kubelet
* ลบ object ออกจาก etcd โดยตรง
* Container อาจยังรันอยู่จริง (ถ้า node กลับมา)

⚠️ **ใช้เฉพาะกรณีจำเป็นจริง ๆ**

---

## 9. Delete all Pods

### แปล

ลบ Pod ทั้งหมดใน namespace ปัจจุบัน

```bash
kubectl delete pods --all
```

### การทำงานจริง

* ถ้า Pod ถูกสร้างโดย Deployment/RS → ถูกสร้างใหม่ทันที
* ถ้าเป็น Pod เดี่ยว → หายถาวร

### ใช้เมื่อ

* Restart application ทั้ง namespace
* Debug rollout

---

## 10. Delete resources using multiple methods

### แปล

สามารถลบ resource ได้หลายรูปแบบ

```bash
kubectl delete <options>
```

### วิธีที่รองรับ

* จากไฟล์: `-f file.yaml`
* จาก stdin: `-f -`
* จากชื่อ resource: `pod/foo`
* จาก label selector: `-l key=value`
* ลบทั้งหมด: `--all`

---

## ตารางสรุปผลกระทบของการ Delete (สำคัญมาก)

| Resource             | ผลที่เกิดขึ้น              |
| -------------------- | -------------------------- |
| Pod (จาก Deployment) | ถูกสร้างใหม่อัตโนมัติ      |
| Pod (เดี่ยว)         | หายถาวร                    |
| Service              | Traffic หยุดทันที          |
| Label selector       | ลบหลาย resource พร้อมกัน   |
| --force              | เสี่ยงเกิด ghost container |

---

## Key Insight (ห้ามพลาด)

* `kubectl delete` ลบ **object** ไม่ได้หมายถึงฆ่า app ทันที
* Controller จะพยายามรักษา desired state
* ใช้ `--force` และ `--now` อย่างระมัดระวัง
* Production ต้องเข้าใจ **graceful shutdown** ให้ชัดเจน

---

> เอกสารนี้สามารถใช้เป็นไฟล์สรุปสอบ Kubernetes, Lab Guide หรือ Reference สำหรับการดูแลระบบ Production ได้ทันที
