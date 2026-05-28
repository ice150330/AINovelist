from __future__ import annotations

import json
import os
import sys
import time
from typing import Any


def main() -> int:
    command = sys.argv[1] if len(sys.argv) > 1 else "generate"
    payload = read_payload()

    if command == "generate":
        result = generate_text(payload)
        write_json(result)
        return 0

    sys.stderr.write(f"unknown command: {command}")
    return 2


def read_payload() -> dict[str, Any]:
    raw = sys.stdin.buffer.read()
    if not raw:
        return {}
    return json.loads(raw.decode("utf-8"))


def write_json(payload: dict[str, Any]) -> None:
    sys.stdout.buffer.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))


def generate_text(payload: dict[str, Any]) -> dict[str, Any]:
    request = payload.get("request", {})
    context = payload.get("context", {})
    prompt = build_prompt(request, context)
    text = call_llm(prompt) or local_draft(request, context)

    return {
        "text": text,
        "provider": provider_name(),
        "createdAt": iso_now(),
    }


def build_prompt(request: dict[str, Any], context: dict[str, Any]) -> str:
    characters = context.get("characters") or []
    constraints = context.get("hardConstraints") or []
    knowledge = context.get("knowledge") or []

    return "\n".join(
        [
            "你是长篇小说创作助手。请根据结构化要求生成中文小说正文。",
            f"写作意图: {request.get('intent', 'continue')}",
            f"场景类型: {request.get('sceneType', 'dialogue')}",
            f"情绪: {request.get('mood', 'tense')}",
            f"节奏: {request.get('pacing', 'normal')}",
            f"目标字数: {request.get('targetWords', 800)}",
            "人物上下文:",
            "\n".join(f"- {item.get('name')} {','.join(item.get('tags') or [])} {item.get('motivation', '')}" for item in characters[:8]) or "- 无",
            "硬约束:",
            "\n".join(f"- [{item.get('priority')}] {item.get('content')}" for item in constraints[:12]) or "- 无",
            "知识库:",
            "\n".join(f"- {item.get('title')}: {item.get('excerpt', '')}" for item in knowledge[:8]) or "- 无",
            f"用户补充: {request.get('userNote') or '无'}",
            "输出要求: 只输出正文，不要解释生成过程。",
        ]
    )


def call_llm(prompt: str) -> str | None:
    api_key = os.getenv("AINOVELIST_LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    base_url = os.getenv("AINOVELIST_LLM_BASE_URL", "https://api.openai.com/v1")
    model = os.getenv("AINOVELIST_LLM_MODEL", "gpt-4.1-mini")

    try:
        import httpx

        with httpx.Client(timeout=60) as client:
            response = client.post(
                f"{base_url.rstrip('/')}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "你是专业中文长篇小说创作助手。"},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.8,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as exc:
        return f"{local_failure_notice(exc)}\n\n{prompt_to_draft(prompt)}"


def local_draft(request: dict[str, Any], context: dict[str, Any]) -> str:
    characters = context.get("characters") or []
    constraints = context.get("hardConstraints") or []
    lead = characters[0].get("name") if characters else "主角"
    user_note = request.get("userNote") or "继续推进当前冲突"
    rules = "；".join(item.get("content", "") for item in constraints[:3]) or "无硬约束"

    return "\n".join(
        [
            f"【Python 本地生成｜{request.get('intent', 'continue')}】",
            f"{lead}停在门边，屋内的光线像被旧纸过滤过，只剩下一层安静的暗黄。",
            f"本场景要求：{user_note}",
            f"必须遵守：{rules}",
            "他没有立刻开口，而是先把眼前的线索重新排成一条细线。每一个名字、每一次沉默、每一个被刻意忽略的细节，都在这一刻显出重量。",
            "接下来可以由真实 LLM Provider 接管此段生成；当前文本由 Python 服务在无 API Key 时完成占位生成。",
        ]
    )


def prompt_to_draft(prompt: str) -> str:
    return "LLM 调用失败，已保留 Prompt 摘要并返回本地草稿。\n" + prompt[:1200]


def local_failure_notice(exc: Exception) -> str:
    return f"【LLM 调用失败，使用本地降级生成：{exc}】"


def provider_name() -> str:
    if os.getenv("AINOVELIST_LLM_API_KEY") or os.getenv("OPENAI_API_KEY"):
        return os.getenv("AINOVELIST_LLM_MODEL", "openai-compatible")
    return "python-local"


def iso_now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


if __name__ == "__main__":
    raise SystemExit(main())
