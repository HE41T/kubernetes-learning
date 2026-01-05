# Role in Kubernetes

**Role** คือ resource ใน Kubernetes สำหรับกำหนดสิทธิ์ภายใน namespace (namespace-scoped)

* ใช้ร่วมกับ RoleBinding เพื่อผูกสิทธิ์กับ User, Group หรือ ServiceAccount
* ใช้สำหรับการเข้าถึง resource ภายใน namespace

---

## 1. สร้าง Role พื้นฐาน

```bash
kubectl create role pod-reader --verb=get --verb=list --verb=watch --resource=pods
```

**อธิบาย**

* `pod-reader` = ชื่อ Role
* `--verb` = กำหนดสิทธิ์ เช่น get, list, watch
* `--resource` = resource ที่สามารถเข้าถึงได้ เช่น pods

**เชิงการทำงานจริง**

* ใช้สำหรับจำกัด user ให้เข้าถึงเฉพาะ resource บางประเภท
* Useful สำหรับ team หรือ developer ที่ไม่ต้องการสิทธิ์ cluster-wide

---

## 2. Role พร้อม ResourceName

```bash
kubectl create role pod-reader --verb=get --resource=pods --resource-name=readablepod --resource-name=anotherpod
```

**อธิบาย**

* ระบุชื่อ resource ที่เฉพาะเจาะจง
* Useful เมื่อ user ต้องเข้าถึงเฉพาะบาง Pod หรือ object เท่านั้น

---

## 3. Role กับ API Group

```bash
kubectl create role foo --verb=get,list,watch --resource=rs.apps
```

**อธิบาย**

* ระบุ API Group เช่น `apps` สำหรับ resource type `rs` (ReplicaSet)
* Useful สำหรับ resource ที่อยู่ใน group เฉพาะ

---

## 4. Role กับ SubResource

```bash
kubectl create role foo --verb=get,list,watch --resource=pods,pods/status
```

**อธิบาย**

* สามารถกำหนด subresource เช่น status หรือ scale
* Useful สำหรับ monitoring หรือ automation ที่ต้องใช้ข้อมูล subresource

---

## 5. ตรวจสอบ Role

```bash
kubectl get role -n my-namespace
kubectl describe role pod-reader -n my-namespace
```

**เชิงการทำงานจริง**

* ตรวจสอบว่า Role ครอบคลุม resource และ verb ที่ต้องการหรือไม่
* Useful สำหรับ debug permission denied errors

---

## 6. Best Practices

### สิ่งที่ควรทำ (Do)

* สร้าง Role สำหรับ namespace-specific access เท่านั้น
* ระบุ verb และ resource อย่างชัดเจน
* ใช้ descriptive names สำหรับ Role
* ตรวจสอบผลกระทบกับ RoleBinding ก่อนใช้งานจริง
* ใช้ Role เพื่อจำกัด developer หรือ team ให้เข้าถึงเฉพาะ namespace ของตัวเอง

### สิ่งที่ไม่ควรทำ (Don't)

* ใช้ Role สำหรับสิทธิ์ระดับ cluster-wide (ควรใช้ ClusterRole)
* ตั้ง verb กว้างเกินไป เช่น `*` โดยไม่จำเป็น
* ไม่ระบุ namespace ทำให้เกิด confusion หรือ permission conflict
* ใช้ Role กับ resource ที่ user ไม่จำเป็นต้องเข้าถึง

---

## 7. Extra Details

* Role ไม่สามารถให้สิทธิ์ cluster-wide ต้องใช้ ClusterRole + ClusterRoleBinding
* Role ใช้ร่วมกับ RoleBinding เพื่อผูกกับ user, group, serviceaccount
* สามารถสร้าง Role หลายอันภายใน namespace เพื่อแยกหน้าที่การเข้าถึง resource
