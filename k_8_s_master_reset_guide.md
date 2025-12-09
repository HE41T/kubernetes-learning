# Kubernetes Master Node Reset Guide (Safe Method)

คู่มือนี้เหมาะสำหรับ Kubernetes v1.34 ขึ้นไป บน Ubuntu 20.04 / 22.04

---

## 🔹 ความเข้าใจเบื้องต้น

- **Single Master Node:**
  - ถ้า reset Master Node ตัวเดียว → cluster ล่มทั้งหมด
  - ต้อง **backup etcd** และพร้อม rebuild cluster หรือ restore จาก backup

- **Multi-Master Node (HA):**
  - สามารถ drain/reset Master Node ทีละตัวได้
  - Master Node ตัวอื่นยังทำงานได้

---

## 🔹 ขั้นตอน Reset Master Node แบบ Safe

### 1️⃣ Backup etcd
สำคัญมาก หาก Master Node ตัวเดียวหรือ Master Node HA ต้องเตรียม snapshot ของ etcd

```bash
ETCDCTL_API=3 etcdctl snapshot save /tmp/etcd-backup.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key
```

ตรวจสอบ snapshot ว่าถูกสร้างสำเร็จ

### 2️⃣ Drain Master Node (รักษา Pod สำคัญ)
Drain Pod ทั้งหมดที่ไม่ใช่ DaemonSet หรือ system pods

```bash
kubectl drain <master-node-name> --ignore-daemonsets
```

### 3️⃣ Reset Master Node

```bash
sudo kubeadm reset -f
```

ลบ config เก่า และ network leftovers (optional)

```bash
sudo rm -rf /etc/cni/net.d
sudo iptables -F
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -X
```

### 4️⃣ Rejoin Master Node (ถ้ามี HA)
- ใช้ token + join command จาก Master Node ตัวอื่น
- ตัวอย่าง:
```bash
sudo kubeadm join <MASTER_IP>:6443 --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH> \
  --control-plane
```

- **Single Master Node:**
  - ต้อง **rebuild cluster ใหม่** หรือ restore etcd จาก snapshot

---

> หมายเหตุ:
> - การ drain Master Node จะย้าย Pod ไป node อื่น แต่ system DaemonSet จะไม่ถูกย้าย
> - การ backup etcd เป็นขั้นตอนที่สำคัญที่สุด
> - หากทำใน HA cluster แนะนำ reset ทีละ Master Node และตรวจสอบ cluster พร้อมใช้งานก่อน reset ตัวต่อไป

