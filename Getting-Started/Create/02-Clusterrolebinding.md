# ClusterRoleBinding in Kubernetes

**ClusterRoleBinding** คือการผูก ClusterRole (สิทธิ์แบบ cluster-wide) กับ User, Group หรือ ServiceAccount เพื่อให้ entity นั้นสามารถเข้าถึง resource ตามที่ ClusterRole กำหนดได้

---

## 1. สร้าง ClusterRoleBinding สำหรับผู้ใช้และกลุ่ม

```bash
kubectl create clusterrolebinding cluster-admin \
--clusterrole=cluster-admin \
--user=user1 \
--user=user2 \
--group=group1
```

**อธิบาย**

* `cluster-admin` = ชื่อ ClusterRole ที่เราต้องการให้ bind
* `--user` = User ที่จะได้รับสิทธิ์
* `--group` = Group ที่จะได้รับสิทธิ์

**เชิงการทำงานจริง**

* ใช้ให้ผู้ดูแลระบบหรือ service account เข้าถึง cluster-wide resources ได้
* สำคัญสำหรับ automation หรือ CI/CD pipelines ที่ต้องการสิทธิ์ระดับสูง

---

## 2. การ bind กับ ServiceAccount

```bash
kubectl create clusterrolebinding read-pods-binding \
--clusterrole=pod-reader \
--serviceaccount=default:my-service-account
```

**อธิบาย**

* `--serviceaccount` = ระบุ namespace และชื่อ service account
* Pod ที่ใช้ service account นี้ จะสามารถเข้าถึง resource ตาม ClusterRole ได้

**ใช้จริง**

* สำหรับ application ที่ต้องเรียก Kubernetes API
* ใช้ร่วมกับ monitoring, logging, automation

---

## 3. การตรวจสอบสิทธิ์ของ ClusterRoleBinding

```bash
kubectl describe clusterrolebinding cluster-admin
kubectl auth can-i get pods --as=user1
kubectl auth can-i delete deployments --as=system:serviceaccount:default:my-service-account
```

**แนวปฏิบัติที่ดี**

* ใช้ principle of least privilege: อย่าให้ cluster-admin โดยไม่จำเป็น
* แยก ClusterRoleBinding สำหรับแต่ละ application / team
* ใช้ audit และ logging เพื่อตรวจสอบการเข้าถึง
* ใช้ชื่อ descriptive เช่น `read-pods-binding` แทนชื่อ generic

---

## 4. เพิ่มเติม (Extra Details)

* ClusterRoleBinding ใช้กับ **ClusterRole** เท่านั้น, หากต้องการผูกกับ Role แบบ namespace-specific ต้องใช้ RoleBinding
* สามารถ bind ได้หลาย entity ในคำสั่งเดียว
* การลบ ClusterRoleBinding:

```bash
kubectl delete clusterrolebinding cluster-admin
```

* การใช้ ClusterRoleBinding ควรระมัดระวังเป็นพิเศษใน production

---

## Tips + Best Practices

* ตรวจสอบ ClusterRole และ ClusterRoleBinding ก่อนใช้งานจริง
* ใช้ ClusterRoleBinding เฉพาะกับ entities ที่ต้องการสิทธิ์ cluster-wide
* แนะนำใช้ RoleBinding สำหรับ namespace-scoped access แทนในงานปกติ
* ใช้ labels หรือ annotations เพื่อจัดการ ClusterRoleBinding ขนาดใหญ่
