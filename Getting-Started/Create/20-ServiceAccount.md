# ServiceAccount in Kubernetes

**ServiceAccount** คือ resource ใน Kubernetes สำหรับสร้าง identity ให้กับ Pod เพื่อใช้เข้าถึง Kubernetes API

* ใช้ในการ authentication และ authorization ของ Pod
* แต่ละ namespace สามารถมีหลาย ServiceAccount
* Pod จะใช้ ServiceAccount โดย default คือ `default`

---

## 1. สร้าง ServiceAccount พื้นฐาน

```bash
kubectl create serviceaccount my-service-account
```

**อธิบาย**

* `my-service-account` = ชื่อ ServiceAccount

**เชิงการทำงานจริง**

* Useful สำหรับกำหนดสิทธิ์เฉพาะให้ Pod ผ่าน Role / RoleBinding
* สามารถใช้กับ automation, controller, หรือ application ที่ต้องเข้าถึง API

---

## 2. ตรวจสอบ ServiceAccount

```bash
kubectl get serviceaccount
kubectl describe serviceaccount my-service-account
```

**เชิงการทำงานจริง**

* ตรวจสอบ secret ที่ถูกสร้างให้อัตโนมัติ เช่น token
* Useful สำหรับ debug ปัญหา Pod ไม่สามารถ authenticate กับ API server

---

## 3. Request Token สำหรับ ServiceAccount

```bash
# Token สำหรับ service account ใน namespace ปัจจุบัน
kubectl create token myapp

# Token สำหรับ service account ใน namespace อื่น
kubectl create token myapp --namespace myns

# Token ที่กำหนดเวลาใช้งานได้ 10 นาที
kubectl create token myapp --duration 10m

# Token ที่กำหนด audience
kubectl create token myapp --audience https://example.com

# Token ผูกกับ Secret
kubectl create token myapp --bound-object-kind Secret --bound-object-name mysecret

# Token ผูกกับ Secret และ UID เฉพาะ
kubectl create token myapp --bound-object-kind Secret --bound-object-name mysecret --bound-object-uid 0d4691ed-659b-4935-a832-355f77ee47cc
```

**เชิงการทำงานจริง**

* Useful สำหรับ Pod หรือ external client ที่ต้องเข้าถึง Kubernetes API ด้วย token
* Useful สำหรับ service-to-service authentication ภายใน cluster

---

## 4. Best Practices

### สิ่งที่ควรทำ (Do)

* สร้าง ServiceAccount แยกตาม application หรือ Pod group
* ใช้ Role / RoleBinding เพื่อกำหนดสิทธิ์ให้ชัดเจน
* ใช้ token ที่มี duration / audience เพื่อ security
* ตรวจสอบ secret และ token หลังสร้าง
* ใช้ ServiceAccount แทน default account สำหรับ production

### สิ่งที่ไม่ควรทำ (Don't)

* ใช้ default ServiceAccount สำหรับทุก Pod production
* ให้ Pod มีสิทธิ์เกินจำเป็น (principle of least privilege)
* แชร์ token ระหว่าง Pod หรือ application โดยไม่จำเป็น
* ลืมตั้ง namespace ที่ถูกต้องสำหรับ ServiceAccount
* เก็บ token เป็น plain text ใน config file หรือ repository

---

## 5. Extra Details

* ServiceAccount มี type secret สำหรับเก็บ token และ namespace
* Pod จะ mount token อัตโนมัติเมื่อใช้ ServiceAccount
* ใช้ร่วมกับ RBAC เพื่อควบคุมสิทธิ์ API access
* สามารถสร้างหลาย ServiceAccount ใน namespace เดียวเพื่อแยกสิทธิ์ตามหน้าที่
