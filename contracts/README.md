# Ease Wallet - Smart Contracts

Foundry 기반 Account Abstraction (ERC-4337) 스마트 컨트랙트

## 프로젝트 구조

```
contracts/
├── src/
│   ├── EntryPoint.sol         # ERC-4337 EntryPoint
│   ├── AccountFactory.sol     # CREATE2 기반 AA 계정 팩토리
│   ├── SimpleAccount.sol      # AA 지갑 구현체
│   ├── Paymaster.sol          # ERC-20 가스비 대납
│   └── TestERC20.sol          # 테스트용 ERC-20 토큰
├── script/
│   ├── LocalDeploy.s.sol      # 로컬(Anvil) 배포 스크립트
│   ├── SepoliaDeploy.s.sol    # Sepolia 테스트넷 배포
│   └── MultiChainDeploy.s.sol # 멀티체인 배포
└── test/
    ├── SimpleAccount.t.sol    # SimpleAccount 단위 테스트
    ├── AccountFactory.t.sol   # AccountFactory 테스트
    ├── Paymaster.t.sol        # Paymaster 테스트
    ├── Integration.t.sol      # 통합 테스트
    └── E2E.t.sol              # End-to-End 테스트
```

## 빠른 시작

### 1. 의존성 설치

```bash
# Foundry 설치 (처음 한 번만)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 프로젝트 의존성 설치
forge install
```

### 2. 컴파일

```bash
forge build
```

성공하면 `out/` 디렉토리에 컴파일된 파일들이 생성됩니다.

## 🧪 테스트

### 기본 테스트 실행

```bash
# 모든 테스트 실행
forge test

# 상세 로그와 함께 실행
forge test -vvv

# 특정 테스트만 실행
forge test --match-test testChangeOwner

# 특정 파일의 테스트만 실행
forge test --match-path test/SimpleAccount.t.sol
```

### 테스트 커버리지 확인

```bash
forge coverage
```

### 가스 리포트

```bash
forge test --gas-report
```

## 🚀 로컬 배포 (Anvil)

### 1. Anvil 로컬 체인 시작

새 터미널에서:

```bash
anvil
```

이렇게 하면 http://localhost:8545에서 로컬 이더리움 노드가 실행됩니다.

Anvil은 자동으로 10개의 테스트 계정과 각각 10,000 ETH를 제공합니다.

### 2. 컨트랙트 배포

```bash
forge script script/LocalDeploy.s.sol:LocalDeployScript \
  --fork-url http://localhost:8545 \
  --broadcast
```

**출력 예시:**
```
=== Local Deployment (Anvil) ===
Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 10000 ETH

1. Deploying EntryPoint...
   EntryPoint deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
2. Deploying AccountFactory...
   AccountFactory deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
...

=== Deployment Summary ===
EntryPoint:       0x5FbDB2315678afecb367f032d93F642f64180aa3
AccountFactory:   0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
TestERC20:        0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Paymaster:        0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
```

### 3. 배포된 컨트랙트와 상호작용

```bash
# AccountFactory를 통해 AA 계정 생성
cast send <FACTORY_ADDRESS> \
  "createAccount(address,uint256)" \
  <OWNER_ADDRESS> \
  123 \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 생성될 주소 미리 확인
cast call <FACTORY_ADDRESS> \
  "getAddress(address,uint256)" \
  <OWNER_ADDRESS> \
  123 \
  --rpc-url http://localhost:8545

# ERC20 토큰 잔액 확인
cast call <TOKEN_ADDRESS> \
  "balanceOf(address)" \
  <ACCOUNT_ADDRESS> \
  --rpc-url http://localhost:8545
```

## 📝 테스트 시나리오

### SimpleAccount 테스트

```bash
forge test --match-path test/SimpleAccount.t.sol -vvv
```

**테스트 항목:**
- ✅ Owner 설정 확인
- ✅ Execute 함수 (EntryPoint만 호출 가능)
- ✅ Owner 변경 (PIN 변경 시뮬레이션)
- ✅ Owner 변경 권한 검증
- ✅ Zero address 방어
- ✅ Event 발생 확인
- ✅ Deposit 기능
- ✅ ETH 수신

### AccountFactory 테스트

```bash
forge test --match-path test/AccountFactory.t.sol -vvv
```

**테스트 항목:**
- ✅ CREATE2 기반 deterministic 주소 생성
- ✅ 동일한 파라미터로 재호출 시 같은 주소 반환
- ✅ 멀티체인 시나리오 (같은 주소 생성 확인)

### E2E 통합 테스트

```bash
forge test --match-path test/E2E.t.sol -vvv
```

**테스트 시나리오:**
1. 사용자 AA 계정 생성
2. 계정 간 ETH 전송
3. 계정 간 ERC-20 토큰 전송
4. Owner 변경 (PIN 변경)
5. Paymaster를 통한 가스비 대납
6. 완전한 사용자 플로우

**전체 사용자 플로우 테스트 출력:**
```bash
forge test --match-test testCompleteUserFlow -vvv
```

예상 출력:
```
=== Complete User Flow Test ===
1. Account created: 0x...
   Owner: 0x...
2. User1 token balance: 1000 tokens
3. Sent 0.5 ETH to User2
   User2 new balance: 5.5 ETH
4. Changed owner to: 0x...
=== Test Completed Successfully ===
```

## 🌐 테스트넷 배포

### Sepolia 테스트넷

1. `.env` 파일 생성:
```bash
cp .env.example .env
```

2. `.env` 파일 수정:
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
```

3. 배포:
```bash
forge script script/SepoliaDeploy.s.sol:SepoliaDeployScript \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify
```

### 멀티체인 배포

모든 설정된 체인에 한 번에 배포:

```bash
chmod +x deploy-multi-chain.sh
./deploy-multi-chain.sh
```

지원 체인:
- Ethereum Sepolia
- Base Sepolia
- Arbitrum Sepolia
- Optimism Sepolia

## 🔍 디버깅

### 트랜잭션 트레이스

```bash
# 특정 테스트의 상세 트레이스
forge test --match-test testChangeOwner -vvvv

# 가스 사용량 확인
forge test --gas-report
```

### 로그 확인

테스트 코드에서 `console.log` 사용:

```solidity
import {console} from "forge-std/Test.sol";

console.log("Value:", value);
console.log("Address:", address);
```

## 📊 주요 테스트 결과

```bash
forge test -vv
```

예상 출력:
```
Running 25 tests for test/SimpleAccount.t.sol:SimpleAccountTest
[PASS] testOwnerSet() (gas: 7891)
[PASS] testExecute() (gas: 45234)
[PASS] testChangeOwner() (gas: 34567)
[PASS] testChangeOwnerOnlyOwner() (gas: 12345)
...

Running 15 tests for test/E2E.t.sol:E2ETest
[PASS] testMultiChainDeterministicAddress() (gas: 123456)
[PASS] testETHTransferBetweenAccounts() (gas: 234567)
[PASS] testCompleteUserFlow() (gas: 567890)
...

Test result: ok. 40 passed; 0 failed; finished in 2.34s
```

## 🛠️ 주요 기능

### 1. Deterministic Address (CREATE2)

같은 owner와 salt로 여러 체인에서 동일한 주소 생성:

```solidity
address predictedAddress = factory.getAddress(owner, salt);
address actualAddress = factory.createAccount(owner, salt);
// predictedAddress == actualAddress (모든 체인에서 동일)
```

### 2. Owner 변경 (PIN 변경 지원)

```solidity
// 기존 owner가 새로운 owner로 변경
account.changeOwner(newOwner);
```

### 3. Gas Sponsorship (Paymaster)

ERC-20 토큰으로 가스비 지불:
- Paymaster가 ETH로 가스비 대납
- 사용자는 ERC-20 토큰으로 정산

## ⚠️ 보안 고려사항

- ✅ Owner만 `changeOwner` 호출 가능
- ✅ EntryPoint만 `execute` 호출 가능
- ✅ Zero address로 owner 변경 불가
- ✅ CREATE2로 예측 가능한 주소 생성
- ⚠️ 프로덕션 사용 전 감사(Audit) 필요

## 🐛 트러블슈팅

### 컴파일 오류

```bash
# 캐시 정리
forge clean

# 재컴파일
forge build
```

### Anvil 연결 실패

```bash
# Anvil이 실행 중인지 확인
ps aux | grep anvil

# 포트 확인
lsof -i :8545
```

### 테스트 실패

```bash
# 상세 로그로 재실행
forge test --match-test <TEST_NAME> -vvvv
```

## 📚 추가 자료

- [Foundry Book](https://book.getfoundry.sh/)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Solidity Documentation](https://docs.soliditylang.org/)

## 라이센스

MIT
