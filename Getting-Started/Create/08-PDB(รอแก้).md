# PodDisruptionBudget (PDB) in Kubernetes

**PodDisruptionBudget (PDB)** คือ resource ใน Kubernetes สำหรับควบคุมจำนวน Pod ที่สามารถถูกหยุดหรือ disrupted ได้ในเวลาเดียวกัน

* ป้องกัน downtime ของ application
* ใช้กับ Pod ที่สำคัญหรือมี replicas

---

## 1. สร้าง PDB พื้นฐาน

```bash
kubectl create poddisruptionbudget my-pdb --selector=app=rails --min-available=1
```

**อธิบาย**

* `my-pdb` = ชื่อ PDB
* `--selector` = เลือก Pod ที่มี label `app=rails`
* `--min-available` = กำหนดจำนวน Pod ที่ต้อง available อย่างน้อย 1

**เชิงการทำงานจริง**

* ป้องกันการ scale down หรือ maintenance ที่ทำให้ Pod หายพร้อมกันจน service ล่ม
* Useful สำหรับ critical microservices

---

## 2. PDB แบบเปอร์เซ็นต์

```bash
kubectl create pdb my-pdb --selector=app=nginx --min-available=50%
```

**อธิบาย**

* `--min-available=50%` = ต้องมีอย่างน้อย 50% ของ Pod ที่ match selector อยู่
* Useful เมื่อจำนวน Pod มากและต้องการความยืดหยุ่น

---

## 3. ตรวจสอบ PDB

```bash
kubectl get pdb
kubectl describe pdb my-pdb
```

**เชิงการทำงานจริง**

* ตรวจสอบว่า PDB ถูกบังคับใช้ถูกต้องหรือไม่
* Useful สำหรับ debug ปัญหา downtime หรือ disruption

---

## 4. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ PDB สำหรับ application สำคัญและมี replicas มากกว่า 1
* ระบุ selector ให้ชัดเจน ไม่ใช้ default label ทั้งหมด
* กำหนด `min-available` หรือ `max-unavailable` ให้เหมาะสมกับจำนวน replicas
* ตรวจสอบผลกระทบต่อ rolling updates และ node maintenance
* ใช้ PDB ร่วมกับ Deployment / StatefulSet เพื่อทำ high availability

### สิ่งที่ไม่ควรทำ (Don't)

* ตั้ง `min-available` = 0 สำหรับ Pod สำคัญ เพราะอาจทำให้ downtime เกิดขึ้นพร้อมกัน
* ใช้ PDB กับ Pod ที่มี replicas 1 เพียงตัวเดียว เพราะไม่มีประโยชน์
* ตั้งค่า `max-unavailable` สูงเกินไป สำหรับ Pod สำคัญ อาจทำให้ service ล่มระหว่าง node drain
* ละเลยการตรวจสอบ PDB ก่อนทำ node maintenance หรือ upgrade cluster

---

## 5. Extra Details

* PDB ไม่ป้องกัน Pod crash แต่ป้องกัน disruption ที่เกิดจาก admin, rolling update หรือ node drain
* สามารถใช้ร่วมกับ `kubectl drain` เพื่อให้ maintenance ปลอดภัย
* สามารถสร้าง PDB แบบหลาย selector สำหรับ service เดียวได้
* PDB เป็นเครื่องมือสำคัญในการทำ high availability ของ Kubernetes workload
