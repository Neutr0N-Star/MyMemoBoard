# 知墙发布 SOP（v1.0.x ~ v1.1.x 实战沉淀）

> 适用范围：知墙 MyMemoBoards 的版本发布全流程。
> 沉淀来源：v1.0.0 / v1.0.1 / v1.0.2 / v1.0.3 / v1.0.4 / v1.1.0 六轮真实发布，含全部踩坑。
> 发布模型：**git tag 触发 GitHub Actions → CI 出包 → GitHub Release + Pages 自动部署**，不走本地打包。

---

## 0. 发布全景图

```
改代码 → 升版本号(3处) → 同步发布文件(4个) → 验证 → 本地 commit
  → 打 tag → 推 master + tag → CI Build Release(≈3min) → 验证四件套 + Pages
  → 统计观测（下载 API / 发布页埋点）
```

一次完整发布约 10 分钟（含 CI 等待），其中 5 分钟是「升版本 + 同步文件」，最容易漏。

---

## 1. 版本号三处同步（最容易漏）

| 文件 | 位置 |
|---|---|
| `package.json` | `"version"` |
| `package-lock.json` | 顶部 `"version"` **和** `packages[""].version`（两处！） |
| `index.html` | 关于浮窗 `<p><b>版本</b>：x.x.x</p>`（706 行附近，v1.0.3 遗留到 v1.2.0 才发现，别漏） |

> `package-lock.json` 里其他 `1.0.x` 都是依赖版本号，**别动**。

## 2. 发布文件同步（4 个）

| 文件 | 改什么 |
|---|---|
| `CHANGELOG.md` | 新版本要点（新增/修复/优化，给用户看） |
| `README.md` | 安装包名 `MyMemoBoards-x.x.x-setup.exe`、SHA256 命令示例 |
| `docs/index.html` | 发布页：`REV`、下载链接（`.../download/MyMemoBoards-x.x.x-setup.exe`）、SHA256 命令 |
| `docs/RELEASE.md` | 发布说明（标题/更新内容/下载表格） |

> `docs/` 不在 electron-builder 的 `build.files` 列表里，**不会进 App 包**，只服务 GitHub Pages。

## 3. 提交前验证（30 秒）

```bash
node --check main.js
node --check preload.js
# index.html 内联脚本：用 vm 编译
node -e "const fs=require('fs'),vm=require('vm');const s=fs.readFileSync('index.html','utf8');const a=s.indexOf('<script>'),b=s.lastIndexOf('</script>');new vm.Script(s.slice(a+8,b));console.log('OK')"
git diff --check   # CRLF 行尾警告可忽略，不是错误
```

关键行为再补一条静态断言（例：`s.includes('openExternal')`、`!s.includes('死代码')`），防「按钮在但逻辑没了」。

## 4. 发布动作（tag 触发 CI）

```bash
git tag -a v1.0.x -m "v1.0.x"
# 推送必须绕 Windows 缓存凭据，否则被旧账号凭据截胡 403
git -c credential.helper= push "https://Neutr0N-Star:${PAT}@github.com/Neutr0N-Star/MyMemoBoard.git" master
git -c credential.helper= push "https://Neutr0N-Star:${PAT}@github.com/Neutr0N-Star/MyMemoBoard.git" v1.0.x
```

**PAT 要求**：经典 PAT，scope 带 `repo` + `workflow`；用完即焚（revoke）。

## 5. 出包验收

| 检查项 | 通过标准 |
|---|---|
| CI Build Release | `conclusion: success`（约 3 分钟） |
| Release 四件套 | `setup.exe` + `.blockmap` + `latest.yml` + `SHA256SUMS.txt` |
| Pages 部署 | `pages build and deployment` success，发布页自动上新版 |
| 本地/远端一致 | 工作区干净，push 后无 ahead |

```bash
# 查 CI
curl -s -H "Authorization: Bearer $PAT" "https://api.github.com/repos/Neutr0N-Star/MyMemoBoard/actions/runs?per_page=3"
# 查 Release 四件套
curl -s -H "Authorization: Bearer $PAT" "https://api.github.com/repos/Neutr0N-Star/MyMemoBoard/releases"
```

## 6. 统计与观测

**下载量（GitHub 白送，但口径要懂）**
- 接口：`GET /repos/.../releases` 每个 asset 的 `download_count`，公开可查（匿名即可）
- 局限：只有**累计次数**，没有时间戳 / IP / 来源 / 去重
- 水分：`latest.yml` 被 App 拉取（自动更新检查）**也算一次下载**——「有人用」比数字少，「有人装」比数字多
- 结论：只能看趋势，不能当装机量

**发布页浏览量（要自己埋点）**
- GitHub Pages 官方**不提供**访问统计
- 已接入 GoatCounter（site: `neutr0nstar`）：`docs/index.html` 里一行 script
- 改埋点 = 只改 `docs/` → 推 master → Pages 自动部署，**不打 tag 不构建**

---

## 7. 踩坑清单（按版本，全部付过学费）

| 版本 | 坑 | 根因 | 解法 |
|---|---|---|---|
| v1.0.0 | CI 打包成功但 Release 环节失败 | `build.publish` 块存在时 electron-builder 默认 `onTagOrDraft` 自动发布，CI 没 GH_TOKEN | CI 用 `dist:ci` = `--publish never`；**publish 块必须保留**（打进 app-update.yml，App 自动更新靠它） |
| v1.0.0 | push 静默 403 | Windows 凭据管理器缓存旧账号 token 截胡 | PAT 内嵌 URL + `credential.helper=` 空值绕过 |
| v1.0.0 | 推含 Actions 文件的提交被拒 | PAT 缺 `workflow` scope | 经典 PAT 勾 Workflows |
| v1.0.0 | 仓库坐标写错 | `Neutr0N_Star`(下划线) vs `Neutr0N-Star`(连字符)、`MyMemoBoards`(复数) vs `MyMemoBoard`(单数) | 先用 API 核实 `full_name`，别信记忆 |
| v1.0.1 | 「检查更新」永远报有新版 | `available: !!r` 判断，checkForUpdates 成功即返回对象 | 真实版本号比较（`compareVersions`） |
| v1.0.1 | 安装包是 Electron 默认图标 | `signAndEditExecutable:false` 连图标写入一起跳过 | 只跳签名用 `signExecutable:false` |
| v1.0.1 | github.com 被挡推不了 | 选择性拦截 | Git Data API 建 tag 也能触发 `on: push: tags`；恢复后 `git fetch && git reset --hard origin/master` 对齐 |
| v1.0.2 | 本地打包失败 | 环境「回收站安全删除」钩子拦截 `win-unpacked.tmp` 清理 | **本地打包失败≠代码问题**，直接走 CI 打包 |
| v1.0.3 | App 内检查更新「弹了下就没反应」 | `autoDownload` 后台拉 106MB，github.com 被拦时下载**无声挂起**；前端轮询又**无超时** | 废弃 App 内下载，检测到新版**弹浏览器打开自己的发布页**（URL 不带版本号，永远指向最新） |
| v1.0.4 | 内部下载其实能用，1.0.3 拆过头了 | 1.0.3 把可用链路也拆了，浏览器下载体验差 | 恢复 App 内更新：`autoDownload=true` + `autoInstallOnAppQuit=true`，加 `download-progress` 事件上报进度，前端进度条；`error` 事件 → 前端提示「连接不到 GitHub」+ 发布页链接兜底。**教训：区分「体验差」和「连不上网」——前者加反馈，后者才换链路** |
| v1.1.0 | **更新后数据丢失（最严重）** | 数据目录「绿色化」存 exe 同目录 `data/`，自动更新/重装替换 exe 目录 → 数据被覆盖 | 数据改存标准 `%APPDATA%\MyMemoBoards`（`app.setPath('userData', ...)` 改为 `app.getPath('appData')` 下），更新与数据彻底隔离。**教训：桌面应用数据目录永远用 userData，别为「绿色便携」把数据放安装目录** |
| 通用 | `shell.openExternal` 放行任意链接 | 渲染进程不可信 | **白名单正则**：只放行 `github.com/Neutr0N-Star/MyMemoBoard/` 与 `neutr0n-star.github.io/MyMemoBoard/` |
| 通用 | 异步等待无超时 | 轮询/下载永远静默 | 任何异步等待必须有超时 + 失败反馈，不许无声 |

---

## 8. 每次发布照抄的验收清单

```
[ ] 版本号三处同步（package.json / package-lock.json×2 / index.html 关于浮窗）
[ ] 发布文件同步（CHANGELOG / README / docs/index.html / docs/RELEASE.md）
[ ] main.js + preload.js + index.html 语法检查通过
[ ] 关键行为静态断言通过
[ ] 本地 commit（工作区干净）
[ ] tag v1.0.x + 推 master + 推 tag（PAT 绕缓存姿势）
[ ] CI Build Release success
[ ] Release 四件套齐全（setup.exe / blockmap / latest.yml / SHA256SUMS）
[ ] Pages 部署 success，发布页是新版
[ ] 统计口径记录：新版本 download_count 起点
[ ] PAT revoke（用完即焚）
[ ] 实测：装新版 → 检查更新 → 浏览器弹发布页
```

---

## 9. 设计原则（为什么这么发布）

- **发布 = 推 tag，不是本地打包**：构建环境一致性靠 CI，本地环境（代理/回收站钩子/凭据缓存）不可信
- **App 内更新优先，失败才交浏览器**：App 内自动下载 + 进度条是主链路（体验好）；连不上 GitHub 时提示并提供发布页链接兜底。**不要因为「某个网络环境下载失败」就把主链路拆了**——那是「连不上网」问题，不是「App 下载」问题，先加反馈再决定换不换
- **桌面应用数据目录永远用 userData**：数据存 `%APPDATA%`，与安装位置隔离，更新/重装永不碰数据。「绿色便携」的诱惑（数据随 exe 走）会换来「更新丢数据」的灾难
- **发布页 URL 不带版本号**：`neutr0n-star.github.io/MyMemoBoard/` 永远指向最新，App 代码零维护
- **安全白名单**：凡是渲染进程能触发的系统能力（开浏览器），一律主进程白名单校验
