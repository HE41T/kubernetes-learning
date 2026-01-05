# RoleBinding in Kubernetes

**RoleBinding** คือ resource ใน Kubernetes สำหรับผูก Role กับ User, Group หรือ ServiceAccount ภายใน namespace

* ทำให้ user สามารถใช้สิทธิ์ที่ Role กำหนดได้
* Namespace-scoped (ต่างจาก ClusterRoleBinding ที่เป็น cluster-wide)

---

## 1. สร้าง RoleBinding พื้นฐาน

```bash
kubectl create rolebinding admin --clusterrole=admin --user=user1 --user=user2 --group=group1
```

**อธิบาย**

* `admin` = ชื่อ RoleBinding
* `--clusterrole=admin` = ใช้สิทธิ์จาก ClusterRole `admin`
* `--user` / `--group` = กำหนดผู้ใช้งานหรือกลุ่มที่จะได้รับสิทธิ์

**เชิงการทำงานจริง**

* ใช้ให้ user, group หรือ serviceaccount สามารถเข้าถึง resource ภายใน namespace ตาม Role ที่กำหนด
* Useful สำหรับการจัดการสิทธิ์ให้ทีม developer หรือทีม operation

---

## 2. ตรวจสอบ RoleBinding

```bash
kubectl get rolebinding -n my-namespace
kubectl describe rolebinding admin -n my-namespace
```

**เชิงการทำงานจริง**

* ตรวจสอบว่า user/group ได้รับสิทธิ์ตามที่กำหนดหรือไม่
* Useful สำหรับ debug ปัญหา `permission denied`

---

## 3. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ RoleBinding เพื่อจำกัด user, group หรือ serviceaccount ให้เข้าถึง namespace ที่จำเป็นเท่านั้น
* ระบุ Role หรือ ClusterRole ชัดเจน
* ใช้ descriptive names สำหรับ RoleBinding
* ตรวจสอบสิทธิ์หลังสร้างด้วย `kubectl describe`
* ใช้ RoleBinding แยกตามทีมหรือ project เพื่อความชัดเจน

### สิ่งที่ไม่ควรทำ (Don't)

* ใช้ RoleBinding ผูกกับ ClusterRole ในทุก namespace โดยไม่ตรวจสอบสิทธิ์
* ผูก user หรือ group แบบกว้างเกินไป เช่น `*` หรือ `everyone`
* ไม่ระบุ namespace ทำให้เกิด confusion หรือสิทธิ์ถูก assign ไม่ถูกต้อง
* ใช้ RoleBinding กับ resource ที่ user ไม่จำเป็นต้องเข้าถึง

---

## 4. Extra Details

* RoleBinding ใช้ร่วมกับ Role หรือ ClusterRole
* สามารถสร้างหลาย RoleBinding ใน namespace เดียวกันเพื่อจัดการสิทธิ์หลายแบบ
* สำหรับสิทธิ์ cluster-wide ให้ใช้ ClusterRoleBinding แทน
