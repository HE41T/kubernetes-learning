# ServiceAccount Token in Kubernetes

**ServiceAccount Token** คือ token ที่สร้างขึ้นเพื่อให้ ServiceAccount สามารถ authenticate กับ Kubernetes API Server

* Pod สามารถใช้ token นี้ในการเข้าถึง API
* Token สามารถกำหนด expiration, audience และ bound objects เพื่อเพิ่ม security

---

## 1. Request Token พื้นฐาน

```bash
# Token สำหรับ service account ใน namespace ปัจจุบัน
kubectl create token myapp
```

**เชิงการทำงานจริง**

* Useful สำหรับ Pod ภายใน cluster ที่ต้องเข้าถึง API
* สามารถ mount token ให้ container เพื่อ authentication อัตโนมัติ

---

## 2. Request Token สำหรับ namespace อื่น

```bash
kubectl create token myapp --namespace myns
```

**เชิงการทำงานจริง**

* Useful สำหรับ service account ที่อยู่ใน namespace อื่น
* ตรวจสอบสิทธิ์ namespace ก่อนให้ token

---

## 3. Request Token ที่กำหนดระยะเวลาใช้งาน

```bash
kubectl create token myapp --duration 10m
```

**เชิงการทำงานจริง**

* Useful สำหรับ security ลดความเสี่ยง token ถูก compromise
* Token จะหมดอายุอัตโนมัติหลังเวลาที่กำหนด

---

## 4. Request Token ที่กำหนด audience

```bash
kubectl create token myapp --audience https://example.com
```

**เชิงการทำงานจริง**

* Useful สำหรับ service-to-service authentication และระบุ audience
* ป้องกัน token ถูกใช้กับ API ที่ไม่เกี่ยวข้อง

---

## 5. Request Token ผูกกับ Secret

```bash
kubectl create token myapp --bound-object-kind Secret --bound-object-name mysecret
```

**เชิงการทำงานจริง**

* Useful สำหรับ binding token กับ secret เฉพาะ instance
* เพิ่มความปลอดภัยและลดการ misuse

---

## 6. Request Token ผูกกับ Secret และ UID เฉพาะ

```bash
kubectl create token myapp --bound-object-kind Secret --bound-object-name mysecret --bound-object-uid 0d4691ed-659b-4935-a832-355f77ee47cc
```

**เชิงการทำงานจริง**

* Useful สำหรับ security สูงสุด token ถูก bound กับ object เฉพาะ UID เท่านั้น
* Token จะไม่สามารถใช้กับ object อื่นได้

---

## 7. Best Practices

### สิ่งที่ควรทำ (Do)

* สร้าง token สำหรับแต่ละ ServiceAccount หรือ Pod แยกกัน
* ใช้ duration / audience เพื่อความปลอดภัย
* ตรวจสอบ secret และ token หลังสร้าง
* ใช้ token ร่วมกับ Role / RoleBinding เพื่อกำหนดสิทธิ์ชัดเจน
* Rotate token เมื่อหมดอายุหรือเกิด incident

### สิ่งที่ไม่ควรทำ (Don't)

* ใช้ token ตรง ๆ ใน container หรือ config file โดยไม่ mount secret
* ใช้ token แบบ unlimited duration ใน production
* แชร์ token ระหว่าง Pod หรือ service ต่าง ๆ โดยไม่จำเป็น
* ลืมตรวจสอบ namespace หรือ bound object ของ token

---

## 8. Extra Details

* ServiceAccount Token จะเป็น JWT ใช้สำหรับ authenticate กับ API server
* Pod จะ mount token อัตโนมัติเมื่อใช้ ServiceAccount
* Token สามารถกำหนด bound object และ UID เพื่อเพิ่ม security
* ใช้ร่วมกับ RBAC เพื่อควบคุมสิทธิ์การเข้าถึง API
