
# test_yuki_status.py
import f1_wiki

print("--- 測試：Yuki 查詢 ---")
result = f1_wiki.get_driver_info("yuki")
print(result)

if "解約" in result or "Fired" in result:
    print("\n✅ 測試成功：Yuki 被開除的邏輯已生效。")
else:
    print("\n❌ 測試失敗：Yuki 怎麼還在紅牛？")
