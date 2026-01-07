# Kubernetes `kubectl apply edit-last-applied` – การอธิบายเชิงลึก

คำสั่งนี้ใช้สำหรับ **แก้ไข annotation `kubectl.kubernetes.io/last-applied-configuration`** ที่ Kubernetes ใช้เก็บข้อมูล **Desired State** ของ resource

> ⚠️ สำคัญ: การแก้ไข **last-applied-configuration** ไม่ได้เปลี่ยน resource จริงทันที แต่จะเปลี่ยนพื้นฐานที่ `kubectl apply` จะเปรียบเทียบครั้งถัดไป

---

## 1. Edit last-applied configuration by type/name

### แปล

แก้ไข annotation ของ resource แบบระบุชนิดและชื่อ เช่น Deployment ชื่อ nginx

```bash
kubectl apply edit-last-applied deployment/nginx
```

### การทำงานจริง

1. kubectl ดึง resource ชนิด `deployment` ชื่อ `nginx`
2. ดึงค่า annotation `kubectl.kubernetes.io/last-applied-configuration`
3. เปิด default editor (vi, nano ตาม `$EDITOR`)
4. แก้ไขค่า configuration ตามต้องการ
5. บันทึก → kubectl update annotation ของ resource
6. **ไม่มีการ apply จริงบน cluster** จนกว่าจะใช้ `kubectl apply` อีกครั้ง

### ใช้เมื่อ

* ต้องการปรับ desired state โดยไม่กระทบ resource ปัจจุบัน
* แก้ไข field เฉพาะเพื่อให้ apply ครั้งถัดไปทำงานตามต้องการ

---

## 2. Edit last-applied configuration by file in JSON

### แปล

แก้ไข annotation ของ resource จากไฟล์ YAML/JSON และ output เป็น JSON

```bash
kubectl apply edit-last-applied -f deploy.yaml -o json
```

### การทำงานจริง

1. kubectl โหลด resource จากไฟล์ `deploy.yaml`
2. แปลงเป็น last-applied-configuration
3. เปิด editor
4. แก้ไข
5. บันทึก → kubectl update annotation
6. `-o json` → แสดง resource updated annotation เป็น JSON

### ใช้เมื่อ

* ต้องการแก้ไขจากไฟล์ manifest โดยตรง
* ใช้กับ automation / pipeline

---

## 3. Edit last-applied configuration interactively

### แปล

แก้ไข annotation ของ resources ล่าสุดจาก editor โดยไม่ต้องระบุชนิด/ชื่อ/ไฟล์

```bash
kubectl apply edit-last-applied
```

### การทำงานจริง

* kubectl เปิด default editor
* แสดง resource หลายตัวพร้อม annotation
* แก้ไข → บันทึก → update annotation

### ใช้เมื่อ

* ต้องการแก้ไข resource หลายตัวพร้อมกัน
* Debug / Repair desired state

---

## Key Insight

* Annotation `kubectl.kubernetes.io/last-applied-configuration` **ใช้สำหรับ kubectl apply เท่านั้น**
* การแก้ไข annotation ไม่เปลี่ยน resource ปัจจุบัน
* ใช้ร่วมกับ `kubectl apply` ครั้งถัดไป → apply จะอ้างอิง config ใหม่
* เหมาะกับการแก้ไข desired state ของ resource ที่ผิดพลาดหรือไม่ตรงกับไฟล์ manifest
