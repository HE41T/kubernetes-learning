# Kubernetes Worker Node Reset & Join Guide

คู่มือนี้อัปเดตล่าสุด สามารถใช้กับ Kubernetes v1.34 ขึ้นไป บน Ubuntu 20.04 / 22.04

---

## 1️⃣ Stop Pod / Deployment

หาก Pod อยู่ภายใต้ Deployment หรือ ReplicaSet การลบ Pod โดยตรงจะทำให้สร้างใหม่ทันที

**วิธีป้องกัน:** Scale replicas ลง 0 ก่อน

```bash
kubectl scale deployment <deployment-name> --replicas=0 -n <namespace>
```

**ตัวอย่าง:**
```bash
kubectl scale deployment nginx-deployment --replicas=0 -n default
```

รอจน Pod ถูก Terminate ทั้งหมด

---

## 2️⃣ Reset Worker Node

บน Worker Node ให้รันคำสั่ง reset

```bash
sudo kubeadm reset -f
```

ลบ CNI configs และเคลียร์ iptables (แนะนำเพื่อป้องกันปัญหา network)

```bash
sudo rm -rf /etc/cni/net.d
sudo iptables -F
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -X
```

ตรวจสอบว่าไม่มี leftover network configuration ที่อาจรบกวน cluster

---

## 3️⃣ Join Worker Node ใหม่

บน Master Node สร้าง token ใหม่

```bash
sudo kubeadm token create --print-join-command
```

**ตัวอย่าง output:**
```bash
sudo kubeadm join 192.168.0.10:6443 --token abcdef.0123456789abcdef \
  --discovery-token-ca-cert-hash sha256:1234567890abcdef...
```

เอาคำสั่งนี้ไปรันบน Worker Node:

```bash
sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> --discovery-token-ca-cert-hash <HASH>
```

รอสักครู่ แล้วตรวจสอบสถานะจาก Master Node:

```bash
kubectl get nodes
```

สถานะของ Worker Node ควรเปลี่ยนจาก **NotReady → Ready**

---

> หมายเหตุ:
> - ก่อน reset ตรวจสอบให้แน่ใจว่าทำ scale replicas=0 ทุก Deployment ที่เกี่ยวข้อง
> - การเคลียร์ iptables อาจกระทบ network อื่น ๆ บน Node ควรใช้อย่างระมัดระวัง

