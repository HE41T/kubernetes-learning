# ClusterRole in Kubernetes

**ClusterRole** คือสิทธิ์ (Role) แบบ cluster-wide ที่ไม่ได้จำกัด namespace ใช้กำหนดสิทธิ์ให้กับ User, Group, หรือ ServiceAccount ในการเข้าถึง resource ต่าง ๆ ของ Kubernetes

---

## 1. สร้าง ClusterRole ปกติ

```bash
kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods
```

**อธิบาย**

* `pod-reader` = ชื่อ ClusterRole
* `--verb` = สิทธิ์ที่อนุญาต (get, list, watch)
* `--resource` = Resource ที่สิทธิ์นี้ใช้ได้ (pods)

**เชิงการทำงานจริง**

* ใช้เมื่อ Pod หรือ User ต้องอ่านข้อมูล Pod ทุก namespace
* สามารถ bind กับ ClusterRoleBinding เพื่อให้ Pod/SA/Users ใช้งานได้

---

## 2. สร้าง ClusterRole พร้อมระบุ ResourceName

```bash
kubectl create clusterrole pod-reader --verb=get --resource=pods --resource-name=readablepod --resource-name=anotherpod
```

**อธิบาย**

* `--resource-name` = จำกัดสิทธิ์กับ Pod เฉพาะชื่อที่กำหนด

**ใช้จริง**

* ป้องกันไม่ให้ Pod/SA เข้าถึง resource อื่น
* Useful สำหรับ microservice เฉพาะเจาะจง

---

## 3. ClusterRole กับ API Group

```bash
kubectl create clusterrole foo --verb=get,list,watch --resource=rs.apps
```

**อธิบาย**

* `rs.apps` = resource type `ReplicaSet` ใน API Group `apps`
* API Group ช่วยระบุ resource ที่อยู่ใน group เฉพาะ เช่น deployments, statefulsets

**เชิงลึก**

* ClusterRole สามารถจัดการ resource ข้าม namespace ได้ (เช่น pods, nodes)

---

## 4. ClusterRole กับ SubResource

```bash
kubectl create clusterrole foo --verb=get,list,watch --resource=pods,pods/status
```

**อธิบาย**

* SubResource เช่น `pods/status` ช่วยจำกัดสิทธิ์เฉพาะการเข้าถึง status ของ Pod
* Useful สำหรับ monitoring หรือ automation ที่ต้องอ่าน status เท่านั้น

---

## 5. ClusterRole กับ NonResourceURL

```bash
kubectl create clusterrole foo --verb=get --non-resource-url=/logs/*
```

**อธิบาย**

* ใช้สิทธิ์เข้าถึง URL ของ kube-apiserver ที่ไม่ใช่ resource เช่น `/metrics`, `/logs`

**ใช้จริง**

* สำหรับ service ที่ต้องอ่าน metrics หรือ log ผ่าน API โดยไม่กระทบ resource ปกติ

---

## 6. ClusterRole กับ AggregationRule

```bash
kubectl create clusterrole monitoring --aggregation-rule="rbac.example.com/aggregate-to-monitoring=true"
```

**อธิบาย**

* AggregationRule ช่วยรวมหลาย ClusterRole ให้เป็น role เดียว
* Useful สำหรับสร้าง role แบบ modular

**เชิงการทำงานจริง**

* ลดความซ้ำซ้อน
* สร้าง role สำหรับ monitoring โดยอัตโนมัติ

---

## 7. เพิ่มเติม (Extra Details)

* ClusterRole สามารถรวมสิทธิ์หลาย resource และ subresource ในคำสั่งเดียวได้ เช่น `pods,pods/status,deployments.apps`
* สามารถกำหนด verbs หลายค่า เช่น `create,update,delete` เพื่อใช้กับ automation หรือ CI/CD
* การทดสอบสิทธิ์จริงควรใช้คำสั่ง:

```bash
kubectl auth can-i get pods --as=system:serviceaccount:<namespace>:<serviceaccount>
```

* การใช้ ClusterRole ควรระมัดระวังและมอบสิทธิ์ตาม principle of least privilege
* สามารถใช้ label selector หรือ annotation เพื่อจัดการ ClusterRole ในระบบขนาดใหญ่

---

## Tips + Best Practices

* ใช้ `ClusterRole` เฉพาะกับ resource ข้าม namespace
* จำกัด scope ด้วย `ResourceName` หรือ `SubResource` เพื่อความปลอดภัย
* ผูกกับ `ClusterRoleBinding` ให้กับ User / SA / Group
* ใช้ AggregationRule เพื่อสร้าง role modular ลดการ duplicate
* ตรวจสอบสิทธิ์จริงก่อนให้ production access:

```bash
kubectl auth can-i get pods --as=system:serviceaccount:default:my-service-account
```
