# Hướng dẫn Deploy

## 1. Chuẩn bị

- **Ví deploy**: set `PRIVATE_KEY` (hex, không có `0x`) hoặc `MNEMONIC`.
- **Bật broadcast**: set `DRY_RUN=false` (mặc định là `true` nên script không gửi tx thật).

```bash
export PRIVATE_KEY="your_private_key_hex_without_0x"
export DRY_RUN=false
```

- **Chọn mạng**: dùng `--rpc-url <URL>` hoặc `--chain <tên>` (trong `foundry.toml` đã có `arbitrum`, `base`, `mainnet`, …).

---

## 2. Deploy YoVault

Deploy vault (implementation + proxy) + optional RolesAuthority.

```bash
forge script script/Deploy_YoVault.sol:Deploy \
  run \
  --sig "run(string,string,address,address,address,address,uint256,bool)" \
  "yoUSDC" \
  "yoUSDC" \
  <ASSET_ADDRESS> \
  <OWNER_ADDRESS> \
  0x0000000000000000000000000000000000000000 \
  0x0000000000000000000000000000000000000000 \
  0 \
  false \
  --rpc-url https://evm-42161.keplr.app \
  --broadcast
```

| Tham số | Ý nghĩa |
|--------|--------|
| `"yoUSDC"`, `"yoUSDC"` | Tên và symbol của vault token |
| `<ASSET_ADDRESS>` | Địa chỉ token underlying (vd. USDC Arbitrum: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`) |
| `<OWNER_ADDRESS>` | Owner của vault (nhận quyền admin, proxy admin) |
| `0x0` (authority) | Deploy RolesAuthority mới; nếu điền address có sẵn thì dùng authority đó |
| `0x0` (vault) | Deploy implementation mới; nếu điền address thì dùng implementation có sẵn |
| `0` | Số asset deposit ban đầu (0 = không deposit) |
| `false` | Có pause vault ngay sau deploy hay không |

**Ví dụ Arbitrum (USDC) – dùng env (tránh lỗi parser khi truyền string):**

```bash
export DRY_RUN=false
export PRIVATE_KEY="..."

export VAULT_NAME="yoUSDC"
export VAULT_SYMBOL="yoUSDC"
export VAULT_ASSET="0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
export VAULT_OWNER="0xf6ea3Df1EFe7F06F042F0B6207AfCcf0ec67bDD5"
# Optional: VAULT_AUTHORITY=0, VAULT_IMPL=0, VAULT_DEPOSIT_AMOUNT=0, VAULT_PAUSE=false (defaults)

forge script script/Deploy_YoVault.sol:Deploy run \
  --rpc-url https://evm-42161.keplr.app \
  --broadcast
```

**Hoặc truyền đủ 8 tham số (nếu parser chấp nhận string):**

```bash
forge script script/Deploy_YoVault.sol:Deploy run \
  --sig "run(string,string,address,address,address,address,uint256,bool)" \
  "yoUSDC" "yoUSDC" \
  0xaf88d065e77c8cC2239327C5EDb3A432268e5831 \
  $YOUR_OWNER_ADDRESS \
  0x0000000000000000000000000000000000000000 \
  0x0000000000000000000000000000000000000000 \
  0 false \
  --rpc-url https://evm-42161.keplr.app \
  --broadcast
```

---

## 3. Deploy Gateway + Registry

Deploy YoRegistry (proxy) rồi YoGateway (proxy). Owner = địa chỉ deployer (broadcaster).

```bash
forge script script/Deploy_Gateway.sol:Deploy run \
  --rpc-url https://evm-42161.keplr.app \
  --broadcast
```

Cần set `PRIVATE_KEY` (hoặc `MNEMONIC`) và `DRY_RUN=false` như trên.

---

## 4. Deploy Escrow

Escrow gắn với **một vault cố định**. Trong script đang hardcode:

- `VAULT = 0x0000000f2eB9f69274678c76222B35eEc7588a65`

Nếu deploy cho vault khác, sửa `VAULT` trong `script/Deploy_Escrow.sol` rồi chạy:

```bash
forge script script/Deploy_Escrow.sol:Deploy run \
  --rpc-url https://evm-42161.keplr.app \
  --broadcast
```

---

## 5. Tóm tắt lệnh theo mạng

Dùng RPC có sẵn trong `foundry.toml`:

```bash
# Arbitrum
--rpc-url https://evm-42161.keplr.app
# hoặc
--chain arbitrum

# Base (cần API_KEY_ALCHEMY)
--chain base

# Ethereum mainnet (cần API_KEY_ALCHEMY)
--chain mainnet
```

**Lưu ý:** Luôn set `DRY_RUN=false` khi deploy thật; nếu không script chỉ chạy simulation và không gửi giao dịch.
