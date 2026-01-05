# Docker Registry Secret in Kubernetes

**Docker Registry Secret** คือ secret ใน Kubernetes สำหรับเก็บ credential ในการดึง image จาก private Docker registry

* Kubernetes ใช้ secret นี้เพื่อ pull image ที่ต้อง authentication
* สามารถใช้ร่วมกับ ServiceAccount เพื่อให้ Pod ใช้ secret อัตโนมัติ

---

## 1. สร้าง Docker Registry Secret จาก credential ตรง ๆ

```bash
kubectl create secret docker-registry my-secret \
  --docker-server=DOCKER_REGISTRY_SERVER \
  --docker-username=DOCKER_USER \
  --docker-password=DOCKER_PASSWORD \
  --docker-email=DOCKER_EMAIL
```

**อธิบาย**

* `my-secret` = ชื่อ secret
* `--docker-server` = URL ของ Docker registry
* `--docker-username` / `--docker-password` / `--docker-email` = credential

**เชิงการทำงานจริง**

* Useful สำหรับดึง private images จาก Docker Hub หรือ registry อื่น ๆ
* สามารถกำหนดให้ ServiceAccount ใช้ secret นี้โดยอัตโนมัติ

---

## 2. สร้าง Docker Registry Secret จากไฟล์ config.json

```bash
kubectl create secret docker-registry my-secret --from-file=.dockerconfigjson=path/to/.docker/config.json
```

**อธิบาย**

* ใช้ไฟล์ `~/.docker/config.json` ที่มี credential อยู่แล้ว
* `my-secret` = ชื่อ secret ที่ Kubernetes จะสร้าง

**เชิงการทำงานจริง**

* Useful เมื่อมีหลาย registry และ credential ถูกเก็บใน config.json
* ลดความผิดพลาดจากการใส่ username/password ตรง ๆ

---

## 3. ตรวจสอบ Docker Registry Secret

```bash
kubectl get secrets
kubectl describe secret my-secret
```

**เชิงการทำงานจริง**

* ตรวจสอบว่า secret ถูกสร้างเรียบร้อย
* Useful สำหรับ debug ปัญหา image pull failure

---

## 4. ใช้ Docker Registry Secret กับ Pod / ServiceAccount

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: private-pod
spec:
  containers:
  - name: app
    image: myprivateregistry.com/myimage:latest
  imagePullSecrets:
  - name: my-secret
```

**อธิบาย**

* Pod จะใช้ secret `my-secret` ในการดึง private image
* ServiceAccount ก็สามารถผูก secret เพื่อให้ทุก Pod ใน namespace ใช้โดยอัตโนมัติ

---

## 5. Best Practices

### สิ่งที่ควรทำ (Do)

* ใช้ secret สำหรับทุก Pod ที่ดึง private image
* ผูก secret กับ ServiceAccount แทนใส่ใน Pod ทุกตัว
* ตั้งชื่อ secret descriptive เพื่อความเข้าใจง่าย
* ตรวจสอบ secret หลังสร้างด้วย `kubectl describe`

### สิ่งที่ไม่ควรทำ (Don't)

* ใส่ username/password ตรง ๆ ใน Pod spec โดยไม่ใช้ secret
* แชร์ secret ข้าม namespace โดยไม่กำหนด access control
* ลืมกำหนด secret ให้ Pod ที่ต้องดึง private image ทำให้ pull fail
* ใช้ secret ที่ไม่มีความปลอดภัยหรือ expired credentials

---

## 6. Extra Details

* Docker Registry Secret เป็นประเภท `kubernetes.io/dockerconfigjson`
* Kubernetes จะใช้ `imagePullSecrets` เพื่อ pull private images
* สามารถสร้างหลาย secret สำหรับ registry หลายตัว
* ใช้ร่วมกับ RBAC และ namespace เพื่อควบคุมการเข้าถึง
