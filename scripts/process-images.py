"""Trata as fotos baixadas (assets-src/automotivo/) e grava as versões usadas
pelo site (src/assets/automotivo/): escuro e dessaturado, preservando só os
vermelhos, com pretos esmagados e vinheta leve.

Uso: python scripts/process-images.py
Requer Pillow e numpy. As fotos de origem e a licença estão em CREDITOS.md.
"""
from __future__ import annotations

import os

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets-src")
OUT = os.path.join(ROOT, "src", "assets")

# nome_final: (arquivo de origem, largura máxima, grade extra)
PLAN = {
    "automotivo": {
        "hero-911-perfil": ("c-911-side", 4200, {}),
        "gts-lanterna": ("c-911-taillight", 2400, {"reds": 1.08}),
        "est-911": ("c-911-black-rear", 2000, {}),
        "est-m3": ("c-m3", 2000, {}),
        "est-amg": ("c-amg-black", 2000, {}),
        "est-rs6": ("c-rs6", 2000, {}),
        "hero-911-noite": ("c-911-night", 1400, {}),
        "est-taycan": ("c-taycan", 2000, {}),
        "est-m4": ("c-m4", 2000, {}),
        "det-brasao": ("c-crest", 1400, {}),
        "det-amg": ("c-amg-detail", 2000, {}),
        "det-m4": ("c-m4-detail", 2000, {}),
        "det-911-rua": ("c-911-rear-gray", 2000, {}),
    },
}


def to_arr(im: Image.Image) -> np.ndarray:
    return np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0


def to_img(a: np.ndarray) -> Image.Image:
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def luminance(a: np.ndarray) -> np.ndarray:
    return a[..., 0] * 0.2126 + a[..., 1] * 0.7152 + a[..., 2] * 0.0722


def smoothstep(e0: float, e1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def grade_automotivo(a: np.ndarray, reds: float = 1.0, **_) -> np.ndarray:
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = luminance(a)
    mx, mn = a.max(-1), a.min(-1)
    sat = (mx - mn) / (mx + 1e-5)
    # vermelhos: r dominante e saturado
    redness = smoothstep(0.12, 0.35, r - np.maximum(g, b)) * smoothstep(0.25, 0.5, sat)
    keep_sat = 0.38 + 0.62 * redness
    out = lum[..., None] + (a - lum[..., None]) * keep_sat[..., None]
    out[..., 0] = out[..., 0] * (1 + (reds - 1) * redness)
    # pretos esmagados e meios-tons mais densos
    out = np.clip((out - 0.03) / 0.97, 0, 1) ** 1.12
    # sombra levemente fria, luz neutra
    cool = (1 - smoothstep(0.0, 0.45, lum))[..., None] * np.array([-0.006, 0.002, 0.014])
    out = out + cool
    # vinheta
    h, w = lum.shape
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    out = out * (1 - 0.22 * smoothstep(0.55, 1.45, d))[..., None]
    return out


GRADERS = {"automotivo": grade_automotivo}


def fit(im: Image.Image, max_w: int) -> Image.Image:
    if im.width > max_w:
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.LANCZOS)
    return im


def save(im: Image.Image, demo: str, name: str) -> None:
    os.makedirs(os.path.join(OUT, demo), exist_ok=True)
    path = os.path.join(OUT, demo, name + ".jpg")
    im.save(path, quality=90, optimize=True, progressive=True)
    print(f"{demo}/{name}.jpg {im.width}x{im.height} {os.path.getsize(path) // 1024} KB")


def main() -> None:
    for demo, items in PLAN.items():
        for name, (src, max_w, extra) in items.items():
            im = fit(Image.open(os.path.join(SRC, demo, src + ".jpg")), max_w)
            save(to_img(GRADERS[demo](to_arr(im), **extra)), demo, name)


if __name__ == "__main__":
    main()
