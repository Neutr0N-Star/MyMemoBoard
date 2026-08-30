# 知墙 v1.0.0 发布说明

> 发布日期：2026-08-30
> 发布者：Neutr0N_Star（晓星）· 晷刻工作室

## 下载

| 平台 | 文件 | 说明 |
|---|---|---|
| Windows | `My-Memo-Boards-1.0.0-portable.exe` | 单文件便携版，数据生成在 exe 同目录 `data/` |
| Windows | `My-Memo-Boards-1.0.0-setup.exe` | NSIS 安装版（开始菜单/快捷方式/卸载） |

**SHA256 校验**

```
SHA256 (My-Memo-Boards-1.0.0-portable.exe) = d8453c278367ed7899f750ec385b63faaf07523f053fa12715f4550c3fe4c1ee
SHA256 (My-Memo-Boards-1.0.0-setup.exe) = 55bff077004c6f3a5e8f410ebf2a22e25bc5f2a30faedad02884152661f0da3a
```

## 功能亮点

- 四面便签墙（考研/学期/待办/生活） + 便签盒/收纳箱
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
