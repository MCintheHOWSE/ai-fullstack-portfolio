import f1_wiki
import json
import os
import zipfile
import uuid

# 設定輸出的資料夾名稱
OUTPUT_DIR = "f1_bot_export"
INTENTS_DIR = os.path.join(OUTPUT_DIR, "intents")

# 確保資料夾存在
if not os.path.exists(INTENTS_DIR):
    os.makedirs(INTENTS_DIR)

def create_intent_with_payload(display_name, training_phrases, text_response, quick_replies=None):
    """
    產生帶有 LINE Quick Replies (按鈕) 的 Intent
    """
    # 基礎結構
    intent = {
        "id": str(uuid.uuid4()),
        "name": display_name,
        "auto": True,
        "contexts": [],
        "responses": [
            {
                "resetContexts": False,
                "action": "",
                "affectedContexts": [],
                "parameters": [],
                "messages": [
                    {
                        "type": 0,
                        "lang": "zh-tw",
                        "speech": text_response
                    }
                ],
                "defaultResponsePlatforms": {},
                "speech": []
            }
        ],
        "priority": 500000,
        "webhookUsed": False,
        "webhookForSlotFilling": False,
        "fallbackIntent": False,
        "events": [],
        "userSays": []
    }

    # 加入訓練語句
    for phrase in training_phrases:
        intent["userSays"].append({
            "id": str(uuid.uuid4()),
            "data": [{"text": phrase, "userDefined": False}],
            "isTemplate": False,
            "count": 0,
            "lang": "zh-tw",
            "updated": 0
        })

    # --- 關鍵：加入 LINE 的 Custom Payload (按鈕) ---
    if quick_replies:
        # 建構 LINE Quick Reply 格式
        items = []
        for label, text_to_send in quick_replies:
            items.append({
                "type": "action",
                "action": {
                    "type": "message",
                    "label": label,     # 按鈕上顯示的字
                    "text": text_to_send # 按下去後送出的字
                }
            })

        payload_message = {
            "type": 4, # Custom Payload
            "lang": "zh-tw",
            "payload": {
                "line": {
                    "type": "text",
                    "text": text_response, # LINE 顯示的文字
                    "quickReply": {
                        "items": items
                    }
                }
            }
        }
        # 把 Payload 加到回應訊息裡 (放在文字訊息後面)
        intent["responses"][0]["messages"].append(payload_message)

    return intent

def generate_files():
    print("開始轉換資料並製作選單按鈕...")
    
    # ==========================================
    # 1. 製作「主選單」 (六大功能)
    # ==========================================
    # 這六個按鈕對應你圖片上的功能
    main_menu_buttons = [
        ("車手積分", "車手積分"),
        ("車隊積分", "車隊積分"),
        ("車手百科", "車手百科"),
        ("賽道資訊", "賽道資訊"),
        ("賽車介紹", "賽車介紹"),  # 對應車隊介紹
        ("最終戰績", "最終戰績")   # 對應賽季總結
    ]
    
    # 觸發主選單的關鍵字
    menu_phrases = ["選單", "Menu", "開始", "功能", "主選單", "help"]
    
    intent_json = create_intent_with_payload(
        "MainMenu", 
        menu_phrases, 
        "請選擇您想查詢的 F1 資訊：", 
        main_menu_buttons
    )
    
    with open(os.path.join(INTENTS_DIR, "MainMenu.json"), "w", encoding="utf-8") as f:
        json.dump(intent_json, f, ensure_ascii=False, indent=2)
    print("已產生主選單 (MainMenu) - 含六大按鈕")

    # ==========================================
    # 2. 轉換細項功能 (帶有「子選單」按鈕)
    # ==========================================

    # (A) 車手百科選單 -> 按下去後跳出推薦車手
    driver_buttons = [("Max", "介紹 Max"), ("Lewis", "介紹 Lewis"), ("Lando", "介紹 Lando"), ("Yuki", "介紹 Yuki")]
    intent_json = create_intent_with_payload("Menu_DriverWiki", ["車手百科", "車手介紹"], f1_wiki.driver_menu, driver_buttons)
    with open(os.path.join(INTENTS_DIR, "Menu_DriverWiki.json"), "w", encoding="utf-8") as f:
        json.dump(intent_json, f, ensure_ascii=False, indent=2)

    # (B) 賽道資訊選單
    track_buttons = [("摩納哥", "介紹摩納哥"), ("鈴鹿", "介紹鈴鹿"), ("銀石", "介紹銀石")]
    intent_json = create_intent_with_payload("Menu_TrackWiki", ["賽道資訊", "賽道介紹"], f1_wiki.track_menu, track_buttons)
    with open(os.path.join(INTENTS_DIR, "Menu_TrackWiki.json"), "w", encoding="utf-8") as f:
        json.dump(intent_json, f, ensure_ascii=False, indent=2)

    # (C) 賽車/車隊介紹選單
    team_buttons = [("紅牛", "紅牛車隊"), ("法拉利", "法拉利車隊"), ("麥拉倫", "麥拉倫車隊")]
    intent_json = create_intent_with_payload("Menu_TeamWiki", ["賽車介紹", "車隊介紹"], f1_wiki.team_menu, team_buttons)
    with open(os.path.join(INTENTS_DIR, "Menu_TeamWiki.json"), "w", encoding="utf-8") as f:
        json.dump(intent_json, f, ensure_ascii=False, indent=2)

    # (D) 積分榜與戰績 (不需要子按鈕，直接回傳結果)
    # 車手積分
    intent_json = create_intent_with_payload("Menu_DriverStandings", ["車手積分", "車手榜"], f1_wiki.driver_standings)
    with open(os.path.join(INTENTS_DIR, "Menu_DriverStandings.json"), "w", encoding="utf-8") as f:
        json.dump(intent_json, f, ensure_ascii=False, indent=2)
        
    # 車隊積分
    intent_json = create_intent_with_payload("Menu_TeamStandings", ["車隊積分", "車隊榜"], f1_wiki.team_standings)
    with open(os.path.join(INTENTS_DIR, "Menu_TeamStandings.json"), "w", encoding="utf-8") as f:
        json.dump(intent_json, f, ensure_ascii=False, indent=2)

    # 最終戰績 (Season Summary)
    intent_json = create_intent_with_payload("Menu_SeasonSummary", ["最終戰績", "賽季總結"], f1_wiki.get_season_summary())
    with open(os.path.join(INTENTS_DIR, "Menu_SeasonSummary.json"), "w", encoding="utf-8") as f:
        json.dump(intent_json, f, ensure_ascii=False, indent=2)


    # ==========================================
    # 3. 轉換所有詳細資料 (車手、車隊、賽道細節)
    # ==========================================
    
    # 車手細節
    for key, info in f1_wiki.drivers.items():
        name = key.capitalize()
        phrases = [key, f"介紹 {key}", f"{key} 是誰", f"車手 {key}"]
        # 為了避免資料太多，詳細頁面就不加按鈕了，回傳純文字即可
        intent_json = create_intent_with_payload(f"Wiki_Driver_{name}", phrases, info)
        with open(os.path.join(INTENTS_DIR, f"Wiki_Driver_{name}.json"), "w", encoding="utf-8") as f:
            json.dump(intent_json, f, ensure_ascii=False, indent=2)

    # 車隊細節
    for key, info in f1_wiki.teams.items():
        name = key.capitalize()
        phrases = [key, f"介紹 {key}", f"{key} 車隊"]
        intent_json = create_intent_with_payload(f"Wiki_Team_{name}", phrases, info)
        with open(os.path.join(INTENTS_DIR, f"Wiki_Team_{name}.json"), "w", encoding="utf-8") as f:
            json.dump(intent_json, f, ensure_ascii=False, indent=2)

    # 賽道細節
    for key, info in f1_wiki.tracks.items():
        name = key.capitalize()
        phrases = [key, f"介紹 {key}", f"{key} 賽道"]
        intent_json = create_intent_with_payload(f"Wiki_Track_{name}", phrases, info)
        with open(os.path.join(INTENTS_DIR, f"Wiki_Track_{name}.json"), "w", encoding="utf-8") as f:
            json.dump(intent_json, f, ensure_ascii=False, indent=2)
    
    # ==========================================
    # 3.5. 補上必要的 agent.json 和 package.json
    # ==========================================
    print("產生 agent.json 和 package.json...")
    
    package_data = {
        "version": "1.0.0",
        "description": "F1 Chatbot Static Menu"
    }
    with open(os.path.join(OUTPUT_DIR, "package.json"), "w", encoding='utf-8') as f:
        json.dump(package_data, f, indent=2)

    agent_data = {
        "description": "F1 Chatbot with Static Quick Replies",
        "language": "zh-tw",
        "activeAssistantAgents": [],
        "disableInteractionLogs": False,
        "disableStackdriverLogs": True,
        "googleAssistant": {
            "googleAssistantCompatible": False,
            "project": "",
            "welcomeIntentSignInRequired": False,
            "startIntents": [],
            "systemIntents": [],
            "endIntentIds": [],
            "oAuthLinking": {
            "required": False,
            "providerId": "",
            "authorizationUrl": "",
            "tokenUrl": "",
            "scopes": "",
            "privacyPolicyUrl": "",
            "grantType": "AUTH_CODE_GRANT"
            },
            "voiceType": "MALE_1",
            "capabilities": [],
            "envSettings": {},
            "triggerRules": []
        },
        "defaultTimezone": "Asia/Taipei",
        "webhook": {
            "url": "",
            "username": "",
            "headers": {},
            "available": False, # 靜態版不使用 Webhook
            "useForDomains": False,
            "cloudFunctionsEnabled": False,
            "cloudFunctionsInitialized": False
        },
        "isPrivate": True,
        "customClassifierMode": "use.after",
        "mlMinConfidence": 0.3,
        "supportedLanguages": [],
        "enableWebhooks": False # 靜態版禁用
    }
    with open(os.path.join(OUTPUT_DIR, "agent.json"), "w", encoding='utf-8') as f:
        json.dump(agent_data, f, indent=2)

    # ==========================================
    # 4. 打包
    # ==========================================
    print("正在打包成 ZIP...")
    zip_filename = "f1_bot_data.zip"
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(OUTPUT_DIR):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, OUTPUT_DIR)
                zipf.write(file_path, arcname)
    
    print(f"成功！請上傳這個檔案到 Dialogflow: {zip_filename}")

if __name__ == "__main__":
    generate_files()
