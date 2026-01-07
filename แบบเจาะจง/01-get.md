# Kubernetes `kubectl get` – การอธิบายเชิงการทำงานจริง

เอกสารนี้อธิบายการใช้งานคำสั่ง `kubectl get` ใน Kubernetes โดยเน้น **การทำงานจริง**, **แนวคิดเชิงลึก**, และ **การแปลความหมายเป็นภาษาไทย** เหมาะสำหรับการเรียนรู้ การสอบ และการใช้งานจริงในระบบ Production

---

## แนวคิดพื้นฐานของ `kubectl get`

คำสั่ง `kubectl get` ใช้สำหรับ **ดึงข้อมูล (Read-only)** จาก Kubernetes Cluster

กระบวนการทำงานจริง:

1. `kubectl` ส่งคำสั่งไปยัง **Kubernetes API Server**
2. API Server อ่านข้อมูลจาก **etcd**
3. ส่งผลลัพธ์กลับมาให้ผู้ใช้

> หมายเหตุ: `kubectl get` **ไม่แก้ไขค่าใด ๆ** ในระบบ

---

## 1. List all pods in ps output format

### แปล

แสดง Pod ทั้งหมดใน namespace ปัจจุบัน ในรูปแบบตาราง (คล้ายคำสั่ง `ps`)

```bash
kubectl get pods
```

### การทำงานจริง

* เป็นคำสั่งพื้นฐานที่สุด
* ใช้ตรวจสอบสถานะ Pod โดยรวม

ข้อมูลที่แสดง:

* NAME
* READY
* STATUS
* RESTARTS
* AGE

### ใช้เมื่อ

* ตรวจสอบระบบหลัง deploy
* ตรวจ health ของ application

---

## 2. List all pods with more information (wide output)

### แปล

แสดง Pod พร้อมข้อมูลเชิงลึก เช่น Node ที่รันอยู่

```bash
kubectl get pods -o wide
```

### การทำงานจริง

เพิ่มข้อมูลสำคัญ:

* Pod IP
* Node Name
* Readiness Gates

### ใช้เมื่อ

* Debug ปัญหาเฉพาะ node
* ตรวจการกระจายโหลดใน cluster

---

## 3. List a single ReplicationController by name

### แปล

แสดง ReplicationController ชื่อ `web`

```bash
kubectl get replicationcontroller web
# หรือ
kubectl get rc web
```

### การทำงานจริง

* RC เป็น controller รุ่นเก่า (ก่อน Deployment)
* ควบคุมจำนวน Pod ให้คงที่

### ใช้เมื่อ

* ดูระบบ legacy
* ตรวจจำนวน replicas

---

## 4. List Deployments in JSON format (apps/v1)

### แปล

แสดง Deployment ทั้งหมดในรูปแบบ JSON จาก API group `apps/v1`

```bash
kubectl get deployments.v1.apps -o json
```

### การทำงานจริง

* แสดงโครงสร้างทั้งหมดของ resource
* เหมาะกับ automation และ scripting

ข้อมูลที่มักใช้:

* spec.replicas
* strategy
* container image
* labels / selectors

---

## 5. List a single Pod in JSON format

### แปล

แสดง Pod เดียวชื่อ `web-pod-13je7` ในรูปแบบ JSON

```bash
kubectl get pod web-pod-13je7 -o json
```

### การทำงานจริง

ใช้ตรวจสอบข้อมูลเชิงลึก เช่น:

* environment variables
* volume mounts
* probes
* detailed status

---

## 6. Get Pod using YAML file reference

### แปล

ดึง Pod ที่ระบุในไฟล์ `pod.yaml` แล้วแสดงเป็น JSON

```bash
kubectl get -f pod.yaml -o json
```

### การทำงานจริง

* Kubernetes อ่าน `kind` และ `metadata.name`
* ใช้ตรวจสอบ resource จริงใน cluster เทียบกับไฟล์

---

## 7. List resources from Kustomize directory

### แปล

แสดง resource ทั้งหมดจาก directory ที่มี `kustomization.yaml`

```bash
kubectl get -k dir/
```

### การทำงานจริง

* ใช้กับ Kustomize
* Kubernetes จะ build manifest ก่อน query

### ใช้เมื่อ

* GitOps
* แยก environment เช่น dev / prod

---

## 8. Return only the phase of a Pod

### แปล

แสดงเฉพาะค่า `status.phase` ของ Pod

```bash
kubectl get pod web-pod-13je7 -o template --template={{.status.phase}}
```

### การทำงานจริง

* ใช้ Go Template
* เหมาะกับ scripting และ CI/CD

ผลลัพธ์ตัวอย่าง:

```
Running
```

---

## 9. Custom Columns Output

### แปล

แสดงข้อมูลเฉพาะ field ที่กำหนดเอง

```bash
kubectl get pod test-pod \
-o custom-columns=CONTAINER:.spec.containers[0].name,IMAGE:.spec.containers[0].image
```

### การทำงานจริง

* ดึงข้อมูลจาก JSON Path
* เหมาะสำหรับ audit image หรือ container

---

## 10. List ReplicationControllers and Services together

### แปล

แสดง RC และ Service พร้อมกัน

```bash
kubectl get rc,services
```

### การทำงานจริง

* ดึงหลาย resource type ในคำสั่งเดียว
* เห็นภาพรวมระบบได้เร็ว

---

## 11. List specific resources by type and name

### แปล

ดึง resource หลายชนิดโดยระบุชื่อชัดเจน

```bash
kubectl get rc/web service/frontend pods/web-pod-13je7
```

### การทำงานจริง

* ใช้ debug แบบเจาะจง resource

---

## 12. Get status subresource of a Pod

### แปล

ดึงเฉพาะ status subresource ของ Pod

```bash
kubectl get pod web-pod-13je7 --subresource status
```

### การทำงานจริง

* `spec` และ `status` ถูกแยกกัน
* status ถูก update โดย kubelet/controller
* ปลอดภัยต่อการตรวจสอบ runtime

---

## 13. Display one or many resources

### แปล

แสดง resource ได้ทั้งแบบหนึ่งตัวหรือหลายตัว

```bash
kubectl get <resource>
```

### การทำงานจริง

* เป็นคำสั่ง Read-only
* ใช้บ่อยที่สุดในชีวิตจริงของ Kubernetes Admin

---

## สรุป

`kubectl get` คือเครื่องมือหลักสำหรับ:

* 🔍 ตรวจสอบสถานะระบบ
* 🧠 เข้าใจโครงสร้าง resource
* 🤖 ใช้ร่วมกับ automation และ CI/CD

เหมาะสำหรับทั้งผู้เริ่มต้นและผู้ดูแลระบบ Kubernetes ระดับ Production
