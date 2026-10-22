"""Upscales a photo with Real-ESRGAN before it's cropped for the site.

Photos the owner sends are often small, recompressed JPEGs. Resizing them up
blurs them and keeps the compression blocks; this model rebuilds detail and
cleans the blocks instead. See CLAUDE.md for when to use it.

Setup (once, outside the repo):
    python3 -m venv ~/sr && ~/sr/bin/pip install torch numpy pillow
    curl -LO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.1/RealESRGAN_x2plus.pth
    curl -LO https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth

Usage:
    ~/sr/bin/python -I scripts/upscale_photo.py <weights.pth> <2|4> <in.jpg> <out.png> [texture]

Use x2 when the photo needs up to 2× to reach its target size, x4 beyond that,
then downscale the result with Lanczos to the exact size. The model cleans
compression noise but also smooths natural texture, so `texture` (default
0.35) adds that share of the original's fine detail back: 0 for logos, about
0.8 for artwork with deliberate film grain. Runs on the CPU in tiles; weights
are loaded with weights_only=True (tensors only, no code).
"""
import sys

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image, ImageFilter
from torch import nn


class ResidualDenseBlock(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1)
        self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, nf, gc=32):
        super().__init__()
        self.rdb1 = ResidualDenseBlock(nf, gc)
        self.rdb2 = ResidualDenseBlock(nf, gc)
        self.rdb3 = ResidualDenseBlock(nf, gc)

    def forward(self, x):
        return self.rdb3(self.rdb2(self.rdb1(x))) * 0.2 + x


def pixel_unshuffle(x, s):
    b, c, h, w = x.shape
    return x.view(b, c, h // s, s, w // s, s).permute(0, 1, 3, 5, 2, 4).reshape(b, c * s * s, h // s, w // s)


class RRDBNet(nn.Module):
    def __init__(self, scale, nf=64, nb=23, gc=32):
        super().__init__()
        self.scale = scale
        cin = 3 * (4 if scale == 2 else 1)
        self.conv_first = nn.Conv2d(cin, nf, 3, 1, 1)
        self.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_last = nn.Conv2d(nf, 3, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        feat = pixel_unshuffle(x, 2) if self.scale == 2 else x
        feat = self.conv_first(feat)
        feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))


def upscale(model, img, scale, tile=None, pad=16):
    """Runs the model over overlapping tiles so memory stays flat on big images."""
    # Big tiles keep the overlap overhead low; the x4 model's upsampling stages
    # are 16× the tile area, so its tiles are smaller.
    tile = tile or (384 if scale == 4 else 640)
    x = torch.from_numpy(np.asarray(img, dtype=np.float32) / 255.0).permute(2, 0, 1)[None]
    _, _, h, w = x.shape
    # The x2 model works on 2×2 blocks: pad to even sizes.
    ph, pw = h % 2, w % 2
    if ph or pw:
        x = F.pad(x, (0, pw, 0, ph), mode="reflect")
    _, _, H, W = x.shape
    out = torch.zeros(1, 3, H * scale, W * scale)
    for y0 in range(0, H, tile):
        for x0 in range(0, W, tile):
            y1, x1 = min(y0 + tile, H), min(x0 + tile, W)
            ya, xa = max(y0 - pad, 0), max(x0 - pad, 0)
            # H, W, tile and pad are all even, so every tile is too (the x2 model needs it).
            yb, xb = min(y1 + pad, H), min(x1 + pad, W)
            with torch.inference_mode():
                y = model(x[:, :, ya:yb, xa:xb].contiguous(memory_format=torch.channels_last)).contiguous()
            oy, ox = (y0 - ya) * scale, (x0 - xa) * scale
            out[:, :, y0 * scale:y1 * scale, x0 * scale:x1 * scale] = y[:, :, oy:oy + (y1 - y0) * scale, ox:ox + (x1 - x0) * scale]
    out = out[:, :, : h * scale, : w * scale]
    arr = (out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255.0).round().astype(np.uint8)
    return Image.fromarray(arr)


def with_texture(upscaled, original, amount):
    """Adds `amount` of the original's fine detail (high-pass) back onto the upscale."""
    if amount <= 0:
        return upscaled
    plain = original.resize(upscaled.size, Image.LANCZOS)
    detail = np.asarray(plain, np.float32) - np.asarray(plain.filter(ImageFilter.GaussianBlur(1.6)), np.float32)
    return Image.fromarray(np.clip(np.asarray(upscaled, np.float32) + amount * detail, 0, 255).astype(np.uint8))


def main():
    weights, scale, src, dst = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
    texture = float(sys.argv[5]) if len(sys.argv) > 5 else 0.35
    torch.set_num_threads(4)
    model = RRDBNet(scale)
    state = torch.load(weights, map_location="cpu", weights_only=True)
    model.load_state_dict(state.get("params_ema", state.get("params", state)), strict=True)
    model.eval()
    model.to(memory_format=torch.channels_last)
    img = Image.open(src).convert("RGB")
    with_texture(upscale(model, img, scale), img, texture).save(dst)
    print(f"{src} {img.size} -> x{scale}")


if __name__ == "__main__":
    main()
