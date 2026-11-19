"""Optional *local* prompt-guided image editing with InstructPix2Pix.

No image is uploaded to a remote model endpoint. Weights are downloaded once by
Diffusers when the route is first used. CUDA GPU recommended; models are large.
"""
from __future__ import annotations

import os
import threading
from contextlib import nullcontext
from functools import lru_cache

from fastapi import HTTPException
from PIL import Image, ImageOps

DEFAULT_MODEL = "timbrooks/instruct-pix2pix"
# Short, independently written descriptions inspired by public filter labels.
EFFECTS = (
    {"id": "stk_tai_tho", "name": "Soft Bunny Ears", "prompt": "Add fluffy white and pink bunny ears as a natural headband. Keep the people, scene and composition unchanged."},
    {"id": "stk_mu_ngu_khoc", "name": "Sleepy Cartoon", "prompt": "Add a cute knitted sleeping cap with a small soft blue pompom, in a playful cartoon style. Keep the scene recognizable."},
    {"id": "stk_jollibee", "name": "Red Uniform", "prompt": "Change the person's clothing to a cheerful red and yellow restaurant uniform, keeping their face and background consistent."},
    {"id": "stk_gojo_satoru", "name": "White Hair Costume", "prompt": "Give the subject a silver white spiky hairstyle and dark high collar costume; preserve the original pose and image framing."},
    {"id": "stk_nak_ve_than", "name": "Fantasy Mask", "prompt": "Add a detailed fantasy masquerade mask, following the lighting and perspective of the original photo."},
    {"id": "stk_shopee_food", "name": "Orange Courier", "prompt": "Change the subject's outfit into a bright orange delivery courier jacket and cap, leaving the face intact."},
)
EFFECT_MAP = {effect["id"]: effect for effect in EFFECTS}
_GENERATE_LOCK = threading.Lock()


def effect_catalog() -> list[dict[str, str]]:
    return [{"id": item["id"], "name": item["name"]} for item in EFFECTS]


def model_status() -> dict:
    # Checking CUDA does not trigger remote model downloads.
    try:
        import torch
        has_gpu = bool(torch.cuda.is_available())
    except ImportError:
        has_gpu = False
    return {"model": os.getenv("PHOTOBOOTH_AI_MODEL", DEFAULT_MODEL),
            "cuda_available": has_gpu,
            "allow_cpu": os.getenv("PHOTOBOOTH_ALLOW_CPU_AI") == "1",
            "requires_install": "requirements-image-ai.txt",
            "local_inference": True}


@lru_cache(maxsize=1)
def load_pipeline():
    try:
        import torch
        from diffusers import StableDiffusionInstructPix2PixPipeline
    except ImportError as exc:
        raise HTTPException(status_code=503, detail="Image-editing AI not installed; install requirements-image-ai.txt") from exc
    device = "cuda" if torch.cuda.is_available() else "cpu"
    if device == "cpu" and os.getenv("PHOTOBOOTH_ALLOW_CPU_AI") != "1":
        raise HTTPException(status_code=503, detail="CUDA GPU needed for practical image editing; enable PHOTOBOOTH_ALLOW_CPU_AI=1 to experiment on CPU")
    model = os.getenv("PHOTOBOOTH_AI_MODEL", DEFAULT_MODEL)
    try:
        pipe = StableDiffusionInstructPix2PixPipeline.from_pretrained(
            model, torch_dtype=torch.float16 if device == "cuda" else torch.float32
        )
        pipe = pipe.to(device)
        if hasattr(pipe, "enable_attention_slicing"):
            pipe.enable_attention_slicing()
        return pipe
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Cannot load local image model; check GPU memory, access and license") from exc


def edit_photo(photo: Image.Image, effect_id: str, prompt: str, steps: int,
               guidance_scale: float, image_guidance_scale: float) -> Image.Image:
    if effect_id and effect_id not in EFFECT_MAP:
        raise HTTPException(status_code=422, detail="Unknown effect_id")
    instruction = prompt.strip() if prompt and prompt.strip() else EFFECT_MAP.get(effect_id, {}).get("prompt", "")
    if not instruction:
        raise HTTPException(status_code=422, detail="Provide effect_id or prompt")
    if len(instruction) > 300:
        raise HTTPException(status_code=422, detail="Prompt may contain at most 300 characters")
    if not 8 <= steps <= 50 or not 1 <= guidance_scale <= 15 or not 1 <= image_guidance_scale <= 3:
        raise HTTPException(status_code=422, detail="Invalid inference parameters")
    image = ImageOps.contain(photo.convert("RGB"), (512, 512), Image.Resampling.LANCZOS)
    # Stable Diffusion latent dimensions must be divisible by eight.
    image = image.resize((max(64, image.width // 8 * 8), max(64, image.height // 8 * 8)), Image.Resampling.LANCZOS)
    pipe = load_pipeline()
    # Only one GPU inference at a time to prevent concurrent VRAM exhaustion.
    try:
        with _GENERATE_LOCK:
            # Real Diffusers pipelines require torch. Mock pipelines in tests can
            # execute without the optional torch dependency installed.
            try:
                import torch
            except ImportError:
                context = nullcontext()
            else:
                context = torch.inference_mode()
            with context:
                result = pipe(prompt=instruction, image=image,
                              num_inference_steps=steps,
                              guidance_scale=guidance_scale,
                              image_guidance_scale=image_guidance_scale)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Local AI inference failed; check server logs and available GPU memory") from exc
    if not getattr(result, "images", None) or result.images[0] is None:
        raise HTTPException(status_code=422, detail="Image model returned no image")
    return result.images[0].convert("RGB")
