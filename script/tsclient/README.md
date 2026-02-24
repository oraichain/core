# Gateway TS client (Hardhat + TypeScript)

Gọi deposit, redeem và các view (quote, allowances) của YoGateway từ client (Node) dùng Hardhat và ethers.

## Cài đặt

```bash
cd script/tsclient
yarn install
```

## Điều kiện trước khi deposit/redeem

1. **Vault phải có trong Registry** – chạy `script/Registry_AddYoVault.sol` (env: REGISTRY_ADDRESS, VAULT_ADDRESS).
2. **YoVault_V2 cần oracle có price** – nếu deposit/redeem revert (InvalidPrice), gọi **updateSharePrice** cho vault một lần bằng tài khoản oracle updater:
   ```bash
   export ORACLE_ADDRESS=0x... VAULT_ADDRESS=0x... PRICE=1000000000000000000
   forge script script/Oracle_UpdatePrice.sol:Deploy run --rpc-url <RPC> --broadcast
   ```
   (PRIVATE_KEY phải là địa chỉ updater của oracle.) Sau đó chạy lại deposit.

## Cấu hình

Copy `.env.example` sang `.env` và điền:

- `PRIVATE_KEY` – private key (có prefix `0x` hoặc không)
- `GATEWAY_ADDRESS` – địa chỉ Gateway (proxy)
- `VAULT_ADDRESS` – địa chỉ vault (proxy)
- `RPC_URL` – (tùy chọn) RPC Arbitrum, mặc định trong config là `https://arb1.arbitrum.io/rpc`

### Deposit

- `ASSETS` – số asset (đơn vị nhỏ nhất, ví dụ 6 decimals cho USDC)
- `RECEIVER` – (tùy chọn) địa chỉ nhận shares, mặc định = signer
- `MIN_SHARES_OUT` – (tùy chọn) mặc định 0
- `PARTNER_ID` – (tùy chọn) mặc định 0

Script sẽ tự gọi `vault.asset()` để lấy địa chỉ token, rồi approve Gateway nếu allowance chưa đủ, sau đó gọi `gateway.deposit(...)`.

### Redeem

- `SHARES` – số shares cần redeem
- `RECEIVER` – (tùy chọn) địa chỉ nhận asset, mặc định = signer
- `MIN_ASSETS_OUT` – (tùy chọn) mặc định 0
- `PARTNER_ID` – (tùy chọn) mặc định 0

Script sẽ approve Gateway được spend vault shares nếu chưa đủ, rồi gọi `gateway.redeem(...)`.

### Quote (chỉ đọc, không gửi tx)

- `ASSETS` – (tùy chọn) số asset để xem quotePreviewDeposit, quoteConvertToShares, quotePreviewWithdraw
- `SHARES` – (tùy chọn) số shares để xem quotePreviewRedeem, quoteConvertToAssets  
  Cần ít nhất một trong hai.

```bash
yarn quote
# hoặc: ASSETS=1000000 SHARES=500000 yarn hardhat run src/quote.ts --network arbitrum
```

### Allowances (chỉ đọc)

- `OWNER` – (tùy chọn) địa chỉ cần xem allowance, mặc định = signer  
  In ra getShareAllowance và getAssetAllowance (Gateway được phép rút bao nhiêu shares/asset của owner).

```bash
yarn allowances
```

## Chạy

Từ thư mục `script/tsclient`:

```bash
# Deposit (env: GATEWAY_ADDRESS, VAULT_ADDRESS, ASSETS)
yarn hardhat run src/deposit.ts --network arbitrum

# Redeem (env: GATEWAY_ADDRESS, VAULT_ADDRESS, SHARES)
yarn hardhat run src/redeem.ts --network arbitrum
```

Hoặc dùng script trong `package.json`:

```bash
yarn deposit      # gửi tx deposit
yarn redeem      # gửi tx redeem
yarn quote       # view: quote theo ASSETS / SHARES
yarn allowances  # view: share & asset allowance cho Gateway
```

Để dùng RPC khác, set `RPC_URL` trong `.env` và thêm network tương ứng trong `hardhat.config.ts`, hoặc chạy với `--network <tên>`.
