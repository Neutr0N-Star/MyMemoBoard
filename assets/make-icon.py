# 知墙 · 应用图标生成脚本（构成主义构图）
# 运行：python assets\make-icon.py   →  产出 assets/icon.ico + icon.png
# 配色与 index.html 的 CSS 变量保持一致，改这里即全局同步。

import math
from PIL import Image, ImageDraw

S = 256

PAPER = (242, 239, 230)   # #F2EFE6 底稿纸
INK   = (23, 23, 26)      # #17171A 结构墨黑
RED   = (208, 52, 44)     # #D0342C 功能红
BLUE  = (62, 92, 118)     # #3E5C76 钢蓝
WHITE = (255, 255, 255)


def star(cx, cy, outer, inner, n=4, rot_deg=0):
    """四角星（构成主义里常见的锐角星形）"""
    pts = []
    for i in range(n * 2):
        r = outer if i % 2 == 0 else inner
        a = math.radians(rot_deg - 90 + i * (360 / (n * 2)))
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def build(size):
    k = size / S  # 缩放系数
    img = Image.new('RGBA', (size, size), PAPER + (255,))
    d = ImageDraw.Draw(img)
    m = lambda *pts: [(x * k, y * k) for x, y in pts]

    # 1. 蓝图网格（极淡，小尺寸下自然隐去）
    step = 32 * k
    for i in range(0, size + 1, max(1, int(step))):
        d.line([(i, 0), (i, size)], fill=INK + (16,), width=1)
        d.line([(0, i), (size, i)], fill=INK + (16,), width=1)

    # 2. 钢蓝方块（左上，功能色之一，小面积点缀）
    d.rectangle(m((24, 24), (76, 76)), fill=BLUE + (255,))

    # 3. 黑色粗斜带（左上→右下贯穿，构成主义的动势主轴）
    d.polygon(m((0, 64), (256, 192), (256, 240), (0, 112)), fill=INK + (255,))

    # 4. 红色矩形（右上，压在黑带之上形成交叠层次）
    d.rectangle(m((140, 40), (236, 116)), fill=RED + (255,))

    # 5. 白色四角星（红块中心，构成主义星形）
    d.polygon(m(*star(188, 78, 34, 11)), fill=WHITE + (255,))

    return img


ICO_SIZES = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]

base = build(S)
base.save('assets/icon.png')

base.save(
    'assets/icon.ico',
    format='ICO',
    sizes=ICO_SIZES,
)
print('icon.ico + icon.png 已生成，尺寸:', ICO_SIZES)
