# Kubernetes `kubectl apply view-last-applied` – การอธิบายเชิงลึก

คำสั่งนี้ใช้สำหรับ **ดู annotation `kubectl.kubernetes.io/last-applied-configuration`** ของ resource ซึ่งเก็บ **Desired State** ที่ kubectl apply ใช้อ้างอิง

> ⚠️ สำคัญ: คำสั่งนี้ **ไม่เปลี่ยน resource จริงบน cluster** เพียงแต่แสดง configuration ล่าสุดที่ apply ใช้เท่านั้น

---

## 1. View last-applied configuration by type/name

### แปล

ดู annotation ของ resource แบบระบุชนิดและชื่อ เช่น Deployment ชื่อ nginx

```bash
kubectl apply view-last-applied deployment/nginx
```

### การทำงานจริง

1. kubectl ดึง resource ชนิด `deployment` ชื่อ `nginx`
2. อ่านค่า annotation `kubectl.kubernetes.io/last-applied-configuration`
3. แสดงผลเป็น YAML บน stdout (หรือ JSON ถ้าใช้ `-o json`)

### ใช้เมื่อ

* ตรวจสอบ desired state ของ resource
* Debug ปัญหาที่ apply ไม่ทำงานตามคาด

---

## 2. View last-applied configuration by file in JSON

### แปล

ดู annotation ของ resource จากไฟล์ manifest และ output เป็น JSON

```bash
kubectl apply view-last-applied -f deploy.yaml -o json
```

### การทำงานจริง

1. kubectl โหลด resource จากไฟล์ `deploy.yaml`
2. แสดงค่า annotation ของ resource เป็น JSON
3. ช่วยให้ตรวจสอบและใช้ใน automation / pipeline ได้ง่าย

### ใช้เมื่อ

* ตรวจสอบ desired state จากไฟล์ manifest
* ใช้ใน script หรือ CI/CD เพื่อ validate configuration

---

## 3. Default behavior and output

### แปล

ดู latest last-applied-configuration โดยระบุชนิด/ชื่อ หรือไฟล์

* ค่า default จะแสดงเป็น YAML บน stdout
* ใช้ `-o <format>` เพื่อเปลี่ยน output เป็น JSON หรืออื่น ๆ

```bash
kubectl apply view-last-applied deployment/nginx -o yaml
kubectl apply view-last-applied deployment/nginx -o json
```

### การทำงานจริง

* ไม่แก้ไข resource ใด ๆ
* ใช้เพื่อเปรียบเทียบกับไฟล์ manifest หรือ desired state ใหม่

---

## Key Insight

* `view-last-applied` = ดู desired state ที่ kubectl apply ใช้เปรียบเทียบ
* เป็นเครื่องมือ **debug และ audit**
* ใช้ร่วมกับ `edit-last-applied` หรือ `set-last-applied` เพื่อปรับ desired state อย่างปลอดภัย
* Output YAML/JSON สามารถนำไป diff กับ manifest ปัจจุบันได้
