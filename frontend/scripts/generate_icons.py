from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ICON_SIZE = 1024
ROOT = Path(__file__).resolve().parents[1]
BUILD_DIR = ROOT / "build"
PNG_PATH = BUILD_DIR / "icon.png"
ICO_PATH = BUILD_DIR / "icon.ico"


def create_vertical_gradient(size: int, start: tuple[int, int, int], end: tuple[int, int, int]) -> Image.Image:
    gradient = Image.new("RGBA", (size, size))
    pixels = gradient.load()
    for y in range(size):
        blend = y / (size - 1)
        red = int(start[0] + (end[0] - start[0]) * blend)
        green = int(start[1] + (end[1] - start[1]) * blend)
        blue = int(start[2] + (end[2] - start[2]) * blend)
        for x in range(size):
            pixels[x, y] = (red, green, blue, 255)
    return gradient


def create_icon() -> Image.Image:
    canvas = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))

    background_mask = Image.new("L", (ICON_SIZE, ICON_SIZE), 0)
    background_draw = ImageDraw.Draw(background_mask)
    background_draw.rounded_rectangle(
        (96, 96, ICON_SIZE - 96, ICON_SIZE - 96),
        radius=220,
        fill=255,
    )

    background = create_vertical_gradient(ICON_SIZE, (24, 10, 44), (134, 59, 255))
    canvas.paste(background, (0, 0), background_mask)

    accent = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    accent_draw = ImageDraw.Draw(accent)
    accent_draw.ellipse((420, 80, 980, 620), fill=(71, 191, 255, 190))
    accent = accent.filter(ImageFilter.GaussianBlur(90))
    canvas.alpha_composite(accent)

    shadow = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.polygon(
        [
            (612, 112),
            (430, 392),
            (576, 392),
            (318, 908),
            (720, 520),
            (560, 520),
            (764, 180),
        ],
        fill=(28, 10, 56, 170),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    canvas.alpha_composite(shadow)

    glyph = ImageDraw.Draw(canvas)
    glyph.polygon(
        [
            (612, 112),
            (430, 392),
            (576, 392),
            (318, 908),
            (720, 520),
            (560, 520),
            (764, 180),
        ],
        fill=(245, 240, 255, 255),
    )

    cutout = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    cutout_draw = ImageDraw.Draw(cutout)
    cutout_draw.ellipse((164, 164, 860, 860), outline=(255, 255, 255, 40), width=14)
    cutout = cutout.filter(ImageFilter.GaussianBlur(2))
    canvas.alpha_composite(cutout)

    return canvas


def main() -> None:
    BUILD_DIR.mkdir(exist_ok=True)
    icon = create_icon()
    icon.save(PNG_PATH)
    icon.save(ICO_PATH, sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print(f"Generated {PNG_PATH}")
    print(f"Generated {ICO_PATH}")


if __name__ == "__main__":
    main()
