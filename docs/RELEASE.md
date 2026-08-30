# 知墙 v1.0.0 发布说明

> 发布日期：2026-08-30
> 发布者：Neutr0N_Star（晓星）· 晷刻工作室

## 下载

| 平台 | 文件 | 说明 |
|---|---|---|
| Windows | `MyMemoBoards-1.0.0-setup.exe` | NSIS 安装版（开始菜单/桌面快捷方式名：知墙）——**正式发布仅提供此安装包** |

> 另有 `MyMemoBoards-1.0.0-portable.exe` 单文件便携版（数据在 exe 同目录 `data/`），仅作者内测自用，**不随正式发布提供**。

> SHA256 校验：发布包附带 `release/SHA256SUMS.txt`（GitHub Release 附件），可用 `Get-FileHash -Algorithm SHA256` 核对。

## 功能亮点

- 可自定义便签墙（增删改排，空态启动）+ 便签盒/收纳箱
- 日常作息 + 完整课程表编辑（扁格子，节次可增减）
- 考试倒计时（多节点、里程碑变色）
- 现在指针 / 每日任务 / AI 周报（支持本地 Ollama）
- 桌面能力：窗口置顶、系统通知、开机启动、自动更新
- 数据：文件化存储 + 原子写 + 每日快照 + 可选自动备份；导出 JSON/CSV/Markdown 且 API Key 脱敏/加密

## 安全与兼容

- MIT License；第三方声明见 `THIRD_PARTY_NOTICES.md`
- 未签名 exe：Windows SmartScreen 可能提示「更多信息 → 仍要运行」
- 数据仅存本机；AI 周报只在主动配置接口时发送

## 已知问题

- 暂无
