# Kubernetes `kubectl diff` – การอธิบายเชิงลึก

คำสั่ง `kubectl diff` ใช้สำหรับ **เปรียบเทียบ configuration ในไฟล์ YAML/JSON กับ resource ที่รันอยู่บน cluster**

* ช่วยให้ดูความแตกต่างก่อน apply
* ป้องกันความผิดพลาดก่อนทำ deployment จริง

> ⚠️ คำสั่งนี้ **ไม่แก้ไข resource ใด ๆ** แสดงเพียงความแตกต่างเท่านั้น

---

## 1. Diff resource จากไฟล์

```bash
kubectl diff -f pod.json
```

* เปรียบเทียบ resource ใน `pod.json` กับ resource ปัจจุบันใน cluster
* kubectl แสดงความแตกต่าง เช่น:

```diff
- image: nginx:1.19
+ image: nginx:1.21
```

* `-` = configuration เดิมบน cluster
* `+` = configuration ใหม่จากไฟล์

### ใช้เมื่อ

* ตรวจสอบว่า apply จะเปลี่ยนอะไร
* ป้องกันความผิดพลาดก่อน deploy

---

## 2. Diff file read from stdin

```bash
cat service.yaml | kubectl diff -f -
```

* อ่าน configuration จาก stdin แล้วทำ diff กับ resource ปัจจุบัน
* `-f -` = read from stdin
* ใช้ร่วมกับ script หรือ CI/CD pipeline

---

## 3. Conceptual Overview

* `kubectl diff` = preview changes ของ resource
* แสดง **what will change** ก่อน `kubectl apply`
* เหมาะสำหรับ Dev / DevOps ตรวจสอบ YAML ก่อน deploy

---

## Key Insight

* Diff แสดง **desired state** vs **current state**
* **ไม่แก้ไข resource จริง**
* Output human-readable และ color-coded (ถ้า terminal รองรับ)
* ใช้ร่วมกับ:

  * `kubectl apply -f pod.json` → deploy หลังตรวจสอบ diff
  * Automation script → auto approve deploy
