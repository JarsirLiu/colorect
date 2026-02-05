"""
Center API 测试脚本
"""
import requests
import json

BASE_URL = "http://localhost:8000"


def test_health():
    """测试健康检查"""
    print("\n📋 测试健康检查...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    return response.status_code == 200


def test_root():
    """测试根路径"""
    print("\n📋 测试根路径...")
    response = requests.get(f"{BASE_URL}/")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    return response.status_code == 200


def test_get_tools():
    """测试获取工具列表"""
    print("\n📋 测试获取工具列表...")
    response = requests.get(f"{BASE_URL}/api/v1/tools")
    print(f"状态码: {response.status_code}")
    data = response.json()
    if data.get("success"):
        tools = data.get("tools", [])
        print(f"工具数量: {len(tools)}")
        for tool in tools:
            print(f"  - {tool.get('name')} ({tool.get('id')})")
    else:
        print(f"错误: {data}")
    return response.status_code == 200


def test_get_tool_detail():
    """测试获取工具详情"""
    print("\n📋 测试获取工具详情...")
    response = requests.get(f"{BASE_URL}/api/v1/tools/remove-bg")
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    return response.status_code == 200


def test_record_usage():
    """测试记录工具使用"""
    print("\n📋 测试记录工具使用...")
    payload = {
        "tool_id": "test-tool",
        "tool_name": "测试工具",
        "anonymous_id": "test-user-123"
    }
    response = requests.post(f"{BASE_URL}/api/v1/tools/record", json=payload)
    print(f"状态码: {response.status_code}")
    print(f"响应: {response.json()}")
    return response.status_code == 200


def test_get_usage_list():
    """测试获取使用记录"""
    print("\n📋 测试获取使用记录...")
    response = requests.get(f"{BASE_URL}/api/v1/tools/usage/list?limit=10")
    print(f"状态码: {response.status_code}")
    data = response.json()
    if data.get("success"):
        print(f"记录数量: {data.get('total')}")
        for item in data.get('items', [])[:3]:
            print(f"  - {item.get('tool_name')}: {item.get('ip_address')}")
    else:
        print(f"错误: {data}")
    return response.status_code == 200


def main():
    """运行所有测试"""
    print("=" * 60)
    print("Center API 测试")
    print("=" * 60)

    tests = [
        ("健康检查", test_health),
        ("根路径", test_root),
        ("获取工具列表", test_get_tools),
        ("获取工具详情", test_get_tool_detail),
        ("记录工具使用", test_record_usage),
        ("获取使用记录", test_get_usage_list),
    ]

    results = []
    for name, test_func in tests:
        try:
            success = test_func()
            results.append((name, success, None))
        except requests.exceptions.ConnectionError:
            print(f"\n❌ 无法连接到服务器，请确认服务已启动")
            results.append((name, False, "连接失败"))
            break
        except Exception as e:
            print(f"\n❌ 测试失败: {e}")
            results.append((name, False, str(e)))

    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    for name, success, error in results:
        status = "✅ 通过" if success else f"❌ 失败 ({error})"
        print(f"{name}: {status}")

    total = len(results)
    passed = sum(1 for _, success, _ in results if success)
    print(f"\n总计: {passed}/{total} 通过")
    print("=" * 60)


if __name__ == "__main__":
    main()
