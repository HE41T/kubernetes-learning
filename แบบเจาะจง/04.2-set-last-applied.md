# Kubernetes `kubectl apply set-last-applied` – การอธิบายเชิงลึก

คำสั่งนี้ใช้สำหรับ **ตั้งค่า annotation `kubectl.kubernetes.io/last-applied-configuration`** ของ resource ให้ตรงกับไฟล์ manifest โดยไม่เปลี่ยน resource จริงบน cluster

> ⚠️ สำคัญ: การใช้ `set-last-applied` จะเปลี่ยน **desired state ที่ kubectl apply จะใช้เปรียบเทียบ** แต่ **ไม่กระทบ resource ปัจจุบัน**

---

## 1. Set last-applied configuration from a file

### แปล

ตั้งค่า annotation ของ resource ให้ตรงกับไฟล์ `deploy.yaml`

```bash
kubectl apply set-last-applied -f deploy.yaml
```

### การทำงานจริง

1. kubectl อ่านไฟล์ `deploy.yaml`
2. แปลงเป็น JSON/YAML ของ resource
3. อัปเดต annotation `kubectl.kubernetes.io/last-applied-configuration` ให้ตรงกับไฟล์
4. **ไม่มีการแก้ไข resource จริงบน cluster**
5. การ apply ครั้งถัดไป จะใช้ config นี้เป็น reference

### ใช้เมื่อ

* ปรับ desired state หลังจาก resource ถูกแก้ไข manual
* ต้องการให้ apply ในอนาคตอิงกับไฟล์ใหม่

---

## 2. Set last-applied configuration from a directory

### แปล

ตั้งค่า annotation สำหรับทุก resource ใน directory

```bash
kubectl apply set-last-applied -f path/
```

### การทำงานจริง

1. kubectl scan ทุกไฟล์ใน `path/` ที่เป็น manifest
2. อัปเดต annotation สำหรับทุก resource
3. ไม่สร้าง resource ใหม่ และไม่เปลี่ยน resource ปัจจุบัน

### ใช้เมื่อ

* GitOps
* ต้องการ reset last-applied ของ resource หลายตัวพร้อมกัน

---

## 3. Create annotation if it does not exist

### แปล

ถ้า annotation ยังไม่เคยมี จะสร้างขึ้นก่อน

```bash
kubectl apply set-last-applied -f deploy.yaml --create-annotation=true
```

### การทำงานจริง

* ตรวจสอบว่า resource มี annotation หรือไม่
* ถ้าไม่มี → สร้าง annotation ใหม่
* ถ้ามี → อัปเดต annotation
* Resource ปัจจุบัน **ไม่ถูกแก้ไข**

---

## 4. Key Concept

### แปล

การใช้ `set-last-applied` = อัปเดต last-applied-configuration เหมือนรัน:

```bash
kubectl apply -f deploy.yaml
```

**แต่**:

* ไม่ทำการ apply จริง (ไม่ update spec / container / field)
* ใช้เพื่อให้ `kubectl apply` ครั้งต่อไปอ้างอิง configuration ล่าสุด
* Useful สำหรับ:

  * แก้ไข manual changes
  * Reconcile desired state กับ manifest ใหม่
  * Reset last-applied หลังจาก resource ถูกแก้ไขโดยตรง

---

## Key Insight

* `set-last-applied` = แก้ไข desired state reference
* ไม่กระทบ resource ปัจจุบัน
* เหมาะกับ GitOps / CI-CD / Production ที่ต้อง reset last-applied ก่อน apply
* ใช้คู่กับ `edit-last-applied` เพื่อ debug หรือปรับ desired state
