# Ingress in Kubernetes

**Ingress** คือ resource ใน Kubernetes สำหรับจัดการการเข้าถึง HTTP/HTTPS traffic ภายนอกไปยัง Services ภายใน cluster

* สามารถกำหนด host, path, TLS, และ annotations
* ใช้ร่วมกับ Ingress Controller (เช่น Nginx, Traefik)

---

## 1. สร้าง Ingress พื้นฐาน

```bash
kubectl create ingress simple --rule="foo.com/bar=svc1:8080,tls=my-cert"
```

**อธิบาย**

* `simple` = ชื่อ Ingress
* `--rule` = กำหนด host/path ไปยัง service และ port
* `tls=my-cert` = ใช้ TLS secret

**เชิงการทำงานจริง**

* ใช้ expose service ภายนอกด้วย HTTPS
* ใช้กับ domain และ subpath ต่าง ๆ

---

## 2. Catch-All Ingress

```bash
kubectl create ingress catch-all --class=otheringress --rule="/path=svc:port"
```

**อธิบาย**

* `--class` = ระบุ Ingress Class (controller ที่ใช้)
* ใช้สำหรับ default path / wildcard path

---

## 3. Ingress พร้อม Annotations

```bash
kubectl create ingress annotated --class=default --rule="foo.com/bar=svc:port" \
--annotation ingress.annotation1=foo \
--annotation ingress.annotation2=bla
```

**อธิบาย**

* Annotation = กำหนด config เฉพาะ Ingress Controller เช่น rewrite, rate-limit
* Useful สำหรับ tuning controller behavior

---

## 4. Ingress กับหลาย path และ host

```bash
kubectl create ingress multipath --class=default \
--rule="foo.com/=svc:port" \
--rule="foo.com/admin/=svcadmin:portadmin"

kubectl create ingress ingress1 --class=default \
--rule="foo.com/path*=svc:8080" \
--rule="bar.com/admin*=svc2:http"
```

**อธิบาย**

* สร้างหลาย path หรือหลาย host ใน Ingress เดียว
* `pathType` = `Prefix` หรือ `Exact` เพื่อ match path

---

## 5. Ingress กับ TLS

```bash
kubectl create ingress ingtls --class=default \
--rule="foo.com/=svc:https,tls" \
--rule="foo.com/path/subpath*=othersvc:8080"

kubectl create ingress ingsecret --class=default \
--rule="foo.com/*=svc:8080,tls=secret1"
```

**อธิบาย**

* `tls` ใช้ certificate เพื่อเข้ารหัส HTTPS
* สามารถระบุ secret เฉพาะสำหรับ host/path

---

## 6. Ingress กับ Default Backend

```bash
kubectl create ingress ingdefault --class=default \
--default-backend=defaultsvc:http \
--rule="foo.com/*=svc:8080,tls=secret1"
```

**อธิบาย**

* Default backend = service ที่รันเมื่อ path/host ไม่ match rule ใด

---

## 7. ตรวจสอบ Ingress

```bash
kubectl get ingress
kubectl describe ingress simple
```

**เชิงการทำงานจริง**

* ตรวจสอบ host, path, service, TLS
* Useful สำหรับ debug traffic routing

---

## 8. Best Practices

* ใช้ Ingress Class ให้ตรงกับ controller ที่รัน
* กำหนด TLS สำหรับ production
* ใช้ descriptive names สำหรับ Ingress
* ใช้ annotations สำหรับ tuning controller behavior
* แยก Ingress สำหรับ environment หรือ domain เพื่อจัดการง่าย

---

## 9. Extra Details

* Ingress ต้องการ Ingress Controller ที่สอดคล้องกัน
* รองรับ rewrite, redirect, rate-limit, load balancing ผ่าน annotations
* สามารถรวมหลาย host และหลาย path ใน Ingress เดียวเพื่อประหยัด resource
