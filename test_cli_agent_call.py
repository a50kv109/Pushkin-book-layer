import subprocess
import json
import sys

def test_cli():
    print("[TEST 1]: Testing 'info' command from external Python process...")
    cmd_info = ["node", "--experimental-strip-types", "agent-interface/cli.ts", "info"]
    res_info = subprocess.run(cmd_info, capture_output=True, text=True)
    assert res_info.returncode == 0, f"Expected returncode 0, got {res_info.returncode}"
    data_info = json.loads(res_info.stdout)
    assert data_info["name"] == "Pushkin Rhyme Machine"
    assert "verification_notes" in data_info
    print("  -> SUCCESS: Engine info retrieved and parsed as JSON.")

    print("\n[TEST 2]: Testing validation on empty text...")
    cmd_empty = ["node", "--experimental-strip-types", "agent-interface/cli.ts", "generate", "--text", "   "]
    res_empty = subprocess.run(cmd_empty, capture_output=True, text=True)
    assert res_empty.returncode != 0, "Expected non-zero return code on empty input"
    data_empty = json.loads(res_empty.stderr)
    assert data_empty["success"] is False
    assert "error" in data_empty
    print(f"  -> SUCCESS: Error captured correctly: '{data_empty['error']}'")

    print("\n[TEST 3]: Testing validation when API key is missing...")
    cmd_no_key = ["node", "--experimental-strip-types", "agent-interface/cli.ts", "generate", "--text", "Над городом вечер."]
    # Pass environment without GEMINI_API_KEY
    env = {k: v for k, v in subprocess.os.environ.items() if k not in ("GEMINI_API_KEY", "API_KEY")}
    res_no_key = subprocess.run(cmd_no_key, capture_output=True, text=True, env=env)
    assert res_no_key.returncode != 0, "Expected non-zero return code when key is absent"
    data_no_key = json.loads(res_no_key.stderr)
    assert data_no_key["success"] is False
    assert "API-ключ" in data_no_key["error"]
    print(f"  -> SUCCESS: Missing key cleanly handled: '{data_no_key['error']}'")

    print("\n[TEST 4]: Testing piped stdin input handling...")
    res_pipe = subprocess.run(
        ["node", "--experimental-strip-types", "agent-interface/cli.ts", "generate"],
        input="Строка через пайплайн",
        capture_output=True,
        text=True,
        env=env
    )
    # Since key is missing, it should get past stdin reading and reach the API key check
    data_pipe = json.loads(res_pipe.stderr)
    assert data_pipe["success"] is False
    assert "API-ключ" in data_pipe["error"]
    print("  -> SUCCESS: Piped input successfully read from stdin.")

    print("\n==========================================")
    print("ALL 4 EXTERNAL AGENT CALLER TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    test_cli()
