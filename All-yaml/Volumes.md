# Kubernetes Volumes Guide (อัปเดตข้อมูลล่าสุด)

หัวข้อนี้อธิบายเรื่อง **Volumes** ใน Kubernetes แบบละเอียด เพื่อให้เข้าใจการเก็บข้อมูลที่ยังคงอยู่แม้ Pod จะตาย

---

## 1️⃣ ปัญหาของ Container แบบเดิม (Docker)
- Container ถูกออกแบบให้ **ตายแล้วเกิดใหม่ได้**  
- ข้อมูลใน Container จะหายเมื่อ Container ตาย  
- Kubernetes แก้ปัญหานี้ด้วย **Volume** เพื่อเก็บข้อมูลแบบ Persistent  

---

## 2️⃣ ประเภทของ Volume (Volume Types)

### A. Temporary Storage (ชั่วคราว)
- **emptyDir**: สร้างโฟลเดอร์เปล่าให้ Pod ใช้ ข้อมูลหายเมื่อ Pod ตาย  

### B. Node Local Storage (ติดเครื่อง)
- **hostPath**: ใช้โฟลเดอร์ของ Node แต่อยู่กับเครื่องนั้น ถ้า Pod ย้ายเครื่อง ข้อมูลไม่ตาม  

### C. Network/Cloud Storage (เก็บถาวร, Production)
- **Cloud**: awsElasticBlockStore, gcePersistentDisk, azureDiskVolume  
- **On-Premise**: nfs, iscsi, glusterfs, cephfs  
- ข้อดี: ข้อมูลอยู่กลางกลาง, Pod ย้าย Node ก็ไม่เสียข้อมูล  

### D. Special Purpose
- **secret**: เก็บรหัสผ่าน/คีย์ (Mount เป็นไฟล์)  
- **gitRepo**: ดึง Source Code จาก Git มาใช้งาน  

---

## 3️⃣ Persistent Volume (PV) และ Persistent Volume Claim (PVC)

### 🟢 Persistent Volume (PV) = ฮาร์ดดิสก์ที่ Admin เตรียม
- คนทำ: Admin / Infra Team  
- สร้างพื้นที่เก็บข้อมูลพร้อมระบุขนาดและ path  

```yaml
kind: PersistentVolume
apiVersion: v1
metadata:
  name: pv0001
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/tmp/data01"
```

### 🟠 Persistent Volume Claim (PVC) = ใบเบิกของ Developer
- คนทำ: Developer / User  
- ขอใช้พื้นที่โดยไม่ต้องรู้รายละเอียด Server  

```yaml
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: myclaim-1
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
```

---

## 4️⃣ Workflow การทำงานของ PV & PVC
1. **Create PV:** Admin สร้าง PV ขนาด 10GB → สถานะ `Available`  
2. **Create PVC:** Developer สร้าง PVC ขนาด 3GB → สถานะ `Pending`  
3. **Binding:** Kubernetes จับคู่ PV กับ PVC → สถานะ `Bound`  
4. **Use in Pod:** Developer เอา PVC ไป mount ใน Pod YAML  

---

## 5️⃣ การใส่ Volume ใน Pod (Mounting)

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: frontend-pod
spec:
  containers:
  - name: myfrontend
    image: tomcat:latest
    volumeMounts:
    - mountPath: "/usr/share/tomcat/html"  # จุดใน Container
      name: mypd
  volumes:
  - name: mypd
    persistentVolumeClaim:
      claimName: myclaim-1  # อ้างอิง PVC
```

**สรุป:**
- **volumeMounts:** บอกตำแหน่งที่ Container จะใช้ข้อมูล  
- **volumes:** บอกข้อมูลมาจาก PVC ใบไหน  
- Developer ไม่ต้องรู้ว่า Server หรือ Cloud เก็บไฟล์ไว้ที่ไหน  

> ✅ ข้อดี: แยกหน้าที่ชัดเจน, ใช้งานง่าย, ปลอดภัย, รองรับทั้ง Cloud และ On-Premise