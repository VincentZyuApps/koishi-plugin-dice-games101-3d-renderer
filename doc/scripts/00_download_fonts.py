#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎲 games101-3d-renderer — 00 字体自动下载与校验脚本

用于离线文档配图生成脚本（01~14）所需的中文字体（霞鹜文楷 Mono）。
数据源同款来自 koishi-plugin-awa-quote-image 官方 release。
默认下载至 Koishi 统一数据目录: <koishi-root>/data/fonts/

代理说明：
  - 默认不使用代理，直接连接网络（Gitee 国内直连极快）。
  - 如需通过本地代理下载（例如 GitHub fallback），可传入 --proxy 参数。
  - 本机默认推荐代理地址: http://127.0.0.1:7890 (Clash / 常见本地代理端口)
  - 使用示例:
      uv run 00_download_fonts.py
      uv run 00_download_fonts.py --proxy
      uv run 00_download_fonts.py --proxy http://127.0.0.1:7890
"""

import os
import sys
import argparse
import hashlib
import urllib.request
import urllib.error

# 默认本机代理端口（用户可在命令行通过 --proxy [URL] 覆盖）
DEFAULT_LOCAL_PROXY = 'http://127.0.0.1:7890'

# 与 koishi-plugin-awa-quote-image/src/utils/font.ts 严格同款配置
FONT_FILE_NAME = 'LXGWWenKaiMono-Regular.ttf'
FONT_SIZE = 24755236
FONT_MD5 = '90e75a25cca0e8868977b880352c6a53'
FONT_SHA256 = 'ee9faa6479c5b2434f9bceca8e2e7b643f699f4f3d067aac9609261e07c6be61'

DOWNLOAD_URLS = [
    {
        'source': 'Gitee (国内高速)',
        'url': f'https://gitee.com/vincent-zyu/koishi-plugin-awa-quote-image/releases/download/fonts/{FONT_FILE_NAME}'
    },
    {
        'source': 'GitHub (海外备用)',
        'url': f'https://github.com/VincentZyuApps/koishi-plugin-awa-quote-image/releases/download/fonts/{FONT_FILE_NAME}'
    }
]

def verify_file(filepath: str) -> bool:
    """校验目标字体文件是否存在且体积、MD5、SHA256 完全匹配"""
    if not os.path.isfile(filepath):
        return False
    if os.path.getsize(filepath) != FONT_SIZE:
        return False

    md5_hash = hashlib.md5()
    sha256_hash = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(1024 * 1024):
            md5_hash.update(chunk)
            sha256_hash.update(chunk)

    return md5_hash.hexdigest() == FONT_MD5 and sha256_hash.hexdigest() == FONT_SHA256

def download_font(dest_dir: str, proxy: str | None = None, force: bool = False) -> str:
    os.makedirs(dest_dir, exist_ok=True)
    target_path = os.path.join(dest_dir, FONT_FILE_NAME)

    if not force and verify_file(target_path):
        print(f"✅ 字体已存在且校验通过，跳过下载:\n   {target_path}")
        return target_path

    # 配置代理处理器（支持 http / https）
    handlers = []
    if proxy:
        print(f"🔌 使用代理: {proxy}")
        handlers.append(urllib.request.ProxyHandler({'http': proxy, 'https': proxy}))
    else:
        print("🌐 使用直连网络 (未指定 --proxy)")

    opener = urllib.request.build_opener(*handlers)
    opener.addheaders = [('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0')]

    for item in DOWNLOAD_URLS:
        source = item['source']
        url = item['url']
        print(f"\n📥 正在从 [{source}] 下载字体...")
        print(f"   URL: {url}")
        try:
            temp_path = target_path + '.download'
            with opener.open(url, timeout=30) as response, open(temp_path, 'wb') as out_file:
                total_size = int(response.headers.get('content-length', 0))
                downloaded = 0
                block_size = 1024 * 64

                while True:
                    buffer = response.read(block_size)
                    if not buffer:
                        break
                    out_file.write(buffer)
                    downloaded += len(buffer)
                    if total_size > 0:
                        percent = downloaded * 100 / total_size
                        mb_done = downloaded / (1024 * 1024)
                        mb_total = total_size / (1024 * 1024)
                        print(f"\r   进度: [{percent:5.1f}%] {mb_done:5.1f}MB / {mb_total:5.1f}MB", end='', flush=True)

            print()
            if verify_file(temp_path):
                if os.path.exists(target_path):
                    os.remove(target_path)
                os.rename(temp_path, target_path)
                print(f"🎉 下载完成并通过完整性校验: {target_path}")
                return target_path
            else:
                print(f"❌ 下载文件校验未通过，尝试下一个源...")
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        except Exception as e:
            print(f"\n⚠️ 下载失败 ({source}): {e}")
            if os.path.exists(target_path + '.download'):
                try:
                    os.remove(target_path + '.download')
                except OSError:
                    pass

    raise RuntimeError(f"所有源均下载失败，请检查网络或指定代理 (--proxy {DEFAULT_LOCAL_PROXY})")

def main():
    parser = argparse.ArgumentParser(description="下载 GAMES101 文档绘图所需的霞鹜文楷中文字体")
    parser.add_argument(
        '--proxy',
        nargs='?',
        const=DEFAULT_LOCAL_PROXY,
        default=None,
        help=f"指定代理地址（默认不走代理；仅传入 --proxy 时使用默认地址: {DEFAULT_LOCAL_PROXY}）"
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help="即使字体已存在且校验通过，仍强制重新下载"
    )
    args = parser.parse_args()

    # 定位 Koishi 共享数据目录: <repo>/doc/scripts/ -> ../../../../data/fonts/
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dest_dir = os.path.abspath(os.path.join(base_dir, '../../../../data/fonts'))

    print("==================================================")
    print("🎲 GAMES101 文档绘图字体准备脚本")
    print(f"📁 目标目录: {dest_dir}")
    print("==================================================")

    try:
        download_font(dest_dir, proxy=args.proxy, force=args.force)
    except Exception as e:
        print(f"\n❌ 出错: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
