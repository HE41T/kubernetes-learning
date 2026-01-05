# ResourceQuota in Kubernetes

**ResourceQuota** คือ resource ใน Kubernetes สำหรับจำกัดจำนวนและปริมาณของ resource ที่ namespace หนึ่งสามารถใช้ได้

* ช่วยป้องกันการใช้ resource เกินจาก Pod, Service, ConfigMap, Secret, PersistentVolumeClaim เป็นต้น
* ใช้ร่วมกับ namespace เพื่อควบคุม resource allocation

---

## 1. สร้าง ResourceQuota พื้นฐาน

```bash
kubectl create quota my-quota --hard=cpu=1,memory=1G,pods=2,services=3,replicationcontrollers=2,resourcequotas=1,secrets=5,persistentvolumeclaims=10
```

**อธิบาย**

* `my-quota` = ชื่อ ResourceQuota
* `--hard` = กำหนดขีดจำกัด resource ที่ใช้ได้ เช่น CPU, Memory, Pods, Services

**เชิงการทำงานจริง**

* ใช้จำกัด resource ของ namespace ใน cluster ที่มีหลายทีมหรือหลาย project
* ป้องกันทีมหนึ่งใช้ resource จนเกิน limit ทำให้ Pod ของทีมอื่นไม่สามารถรันได้

---

## 2. ResourceQuota กับ scope

```bash
kubectl create quota best-effort --hard=pods=100 --scopes=BestEffort
```

**อธิบาย**

* `--scopes` = กำหนดประเภทของ Pod ที่ quota นับ เช่น BestEffort, NotBestEffort
* Useful สำหรับ control workload type เฉพาะ

---

## 3. ตรวจสอบ ResourceQuota

```bash
kubectl get quota -n my-namespace
kubectl describe quota my-quota -n my-namespace
```

**เชิงการทำงานจริง**

* ตรวจสอบว่า namespace ใช้ resource เกิน limit หรือไม่
* Useful สำหรับ debug ปัญหา pod creation ล้มเหลวเพราะ resource limit

---

## 4. Best Practices

### สิ่งที่ควรทำ (Do)

* สร้าง ResourceQuota สำหรับทุก namespace เพื่อป้องกัน resource hogging
* กำหนด hard limits เหมาะสมกับ workload และ environment
* ใช้ scope ให้เหมาะสมกับประเภทของ Pod
* ตรวจสอบ usage อย่างสม่ำเสมอและปรับตามความต้องการ
* ใช้ร่วมกับ LimitRange เพื่อควบคุม resource requests และ limits ของ Pod

### สิ่งที่ไม่ควรทำ (Don't)

* ไม่ตั้ง ResourceQuota เลยใน namespace ที่มีหลายทีม ทำให้บางทีมใช้ resource หมด
* ตั้ง hard limit ต่ำเกินไป ทำให้ Pod ใหม่ไม่สามารถสร้างได้
* ไม่ตรวจสอบผลกระทบของ ResourceQuota ต่อ rolling updates และ scaling
* ใช้ scope แบบไม่เหมาะสม ทำให้ quota ไม่ครอบคลุม workload ที่สำคัญ

---

## 5. Extra Details

* ResourceQuota เป็นเครื่องมือสำคัญสำหรับ multi-tenant cluster
* ใช้ร่วมกับ namespace, PodDisruptionBudget, PriorityClass เพื่อ high availability และ fair usage
* ResourceQuota ไม่ได้บังคับ preemption แต่จำกัดการสร้าง resource ใหม่เท่านั้น
* สามารถใช้ labels และ annotations เพื่อจัดการ quota ขนาดใหญ่
