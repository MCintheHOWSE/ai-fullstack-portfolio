
import os
import json
import uuid
import shutil

# --- 修正設定：強制語言為 zh-tw ---
TARGET_LANG = "zh-tw"  # 關鍵修正

# 1. Entities (資料保持不變)
entities = {
    "driver_name": [
        {"value": "max", "synonyms": ["Max", "Verstappen", "維斯塔潘", "Super Max", "紅牛一號"]},
        {"value": "yuki", "synonyms": ["Yuki", "Tsunoda", "角田", "裕毅"]},
        {"value": "lewis", "synonyms": ["Lewis", "Hamilton", "漢米爾頓", "老漢", "七冠王"]},
        {"value": "charles", "synonyms": ["Charles", "Leclerc", "勒克萊爾", "法拉利金童"]},
        {"value": "lando", "synonyms": ["Lando", "Norris", "諾里斯", "世界冠軍"]},
        {"value": "oscar", "synonyms": ["Oscar", "Piastri", "皮亞斯特里"]},
        {"value": "george", "synonyms": ["George", "Russell", "羅素"]},
        {"value": "kimi", "synonyms": ["Kimi", "Antonelli", "安東內利", "基米"]},
        {"value": "fernando", "synonyms": ["Fernando", "Alonso", "阿隆索", "龍哥"]},
        {"value": "lance", "synonyms": ["Lance", "Stroll", "斯特羅爾"]},
        {"value": "alex", "synonyms": ["Alex", "Albon", "阿爾本"]},
        {"value": "sainz", "synonyms": ["Carlos", "Sainz", "塞恩斯"]},
        {"value": "pierre", "synonyms": ["Pierre", "Gasly", "加斯利"]},
        {"value": "jack", "synonyms": ["Jack", "Doohan", "杜漢"]},
        {"value": "liam", "synonyms": ["Liam", "Lawson", "羅森"]},
        {"value": "esteban", "synonyms": ["Esteban", "Ocon", "奧康"]},
        {"value": "ollie", "synonyms": ["Ollie", "Bearman", "比爾曼"]},
        {"value": "nico", "synonyms": ["Nico", "Hulkenberg", "霍肯伯格"]},
        {"value": "gabriel", "synonyms": ["Gabriel", "Bortoleto", "博托萊托"]},
        {"value": "hadjar", "synonyms": ["Hadjar", "Isack Hadjar", "哈傑爾"]}
    ],
    "track_name": [
        {"value": "bahrain", "synonyms": ["Bahrain", "巴林", "Sakhir"]},
        {"value": "saudi", "synonyms": ["Saudi", "沙烏地", "Jeddah", "吉達"]},
        {"value": "australia", "synonyms": ["Australia", "澳洲", "Melbourne"]},
        {"value": "japan", "synonyms": ["Japan", "Suzuka", "日本", "鈴鹿"]},
        {"value": "china", "synonyms": ["China", "Shanghai", "中國", "上海"]},
        {"value": "miami", "synonyms": ["Miami", "邁阿密"]},
        {"value": "imola", "synonyms": ["Imola", "Emilia Romagna", "伊莫拉"]},
        {"value": "monaco", "synonyms": ["Monaco", "摩納哥", "蒙地卡羅"]},
        {"value": "canada", "synonyms": ["Canada", "Montreal", "加拿大", "蒙特婁"]},
        {"value": "spain", "synonyms": ["Spain", "Barcelona", "西班牙", "巴塞隆納"]},
        {"value": "austria", "synonyms": ["Austria", "Red Bull Ring", "奧地利", "紅牛環"]},
        {"value": "uk", "synonyms": ["UK", "Silverstone", "英國", "銀石"]},
        {"value": "hungary", "synonyms": ["Hungary", "Hungaroring", "匈牙利"]},
        {"value": "belgium", "synonyms": ["Belgium", "Spa", "比利時", "斯帕"]},
        {"value": "netherlands", "synonyms": ["Netherlands", "Zandvoort", "荷蘭"]},
        {"value": "monza", "synonyms": ["Italy", "Monza", "義大利", "蒙扎"]},
        {"value": "baku", "synonyms": ["Azerbaijan", "Baku", "亞塞拜然", "巴庫"]},
        {"value": "singapore", "synonyms": ["Singapore", "Marina Bay", "新加坡"]},
        {"value": "austin", "synonyms": ["USA", "Austin", "COTA", "美國", "奧斯汀"]},
        {"value": "mexico", "synonyms": ["Mexico", "墨西哥"]},
        {"value": "brazil", "synonyms": ["Brazil", "Interlagos", "巴西", "因特拉格斯"]},
        {"value": "vegas", "synonyms": ["Las Vegas", "Vegas", "拉斯維加斯", "賭城"]},
        {"value": "qatar", "synonyms": ["Qatar", "Lusail", "卡達"]},
        {"value": "abudhabi", "synonyms": ["Abu Dhabi", "Yas Marina", "阿布達比"]}
    ],
    "team_name": [
        {"value": "redbull", "synonyms": ["Red Bull", "RB", "紅牛", "奧地利車隊"]},
        {"value": "ferrari", "synonyms": ["Ferrari", "SF", "法拉利", "紅軍"]},
        {"value": "mclaren", "synonyms": ["McLaren", "MCL", "麥拉倫"]},
        {"value": "mercedes", "synonyms": ["Mercedes", "賓士", "梅賽德斯"]},
        {"value": "astonmartin", "synonyms": ["Aston Martin", "AMR", "奧斯頓馬丁"]},
        {"value": "alpine", "synonyms": ["Alpine", "阿爾派", "雷諾"]},
        {"value": "williams", "synonyms": ["Williams", "威廉斯"]},
        {"value": "rb", "synonyms": ["VCARB", "Racing Bulls", "小牛", "RB隊"]},
        {"value": "sauber", "synonyms": ["Sauber", "Audi", "索伯", "奧迪"]},
        {"value": "haas", "synonyms": ["Haas", "哈斯"]}
    ]
}

# 2. Intents (Structure: Name -> Training Phrases with annotations)
intents = {
    "GetDriverInfo": {
        "entity_tag": "driver_name",
        "phrases": [
            ("介紹一下Max", [("Max", "driver_name")]),
            ("查一下Lewis的資料", [("Lewis", "driver_name")]),
            ("維斯塔潘是誰", [("維斯塔潘", "driver_name")]),
            ("漢米爾頓", [("漢米爾頓", "driver_name")]),
            ("車手Lando", [("Lando", "driver_name")]),
            ("我想知道關於安東內利的一切", [("安東內利", "driver_name")])
        ]
    },
    "GetTrackInfo": {
        "entity_tag": "track_name",
        "phrases": [
            ("介紹鈴鹿賽道", [("鈴鹿", "track_name")]),
            ("摩納哥有什麼特色", [("摩納哥", "track_name")]),
            ("銀石賽道介紹", [("銀石", "track_name")]),
            ("查Monza", [("Monza", "track_name")]),
            ("賭城賽道", [("賭城", "track_name")]),
        ]
    },
    "GetTeamInfo": {
        "entity_tag": "team_name",
        "phrases": [
            ("紅牛車隊介紹", [("紅牛", "team_name")]),
            ("法拉利今年怎麼樣", [("法拉利", "team_name")]),
            ("麥拉倫", [("麥拉倫", "team_name")]),
            ("介紹一下賓士", [("賓士", "team_name")])
        ]
    },
    "GetSeasonSummary": {
        "entity_tag": None,
        "phrases": [
            ("2025賽季回顧", []),
            ("今年世界冠軍是誰", []),
            ("賽季總結", []),
            ("總冠軍", []),
            ("F1結果", [])
        ]
    },
    "GetDriverStandings": {
        "entity_tag": None,
        "phrases": [
            ("車手積分", []),
            ("積分榜", []),
            ("誰是第一名", []),
            ("車手排名", []),
            ("Driver Standings", [])
        ]
    },
    "GetTeamStandings": {
        "entity_tag": None,
        "phrases": [
            ("車隊積分", []),
            ("車隊排名", []),
            ("最強車隊", []),
            ("Team Standings", [])
        ]
    },
    "GetDriverMenu": {
        "entity_tag": None,
        "phrases": [
            ("車手百科", []),
            ("有哪些車手", []),
            ("車手名單", []),
            ("Driver List", [])
        ]
    },
    "GetTrackMenu": {
        "entity_tag": None,
        "phrases": [
            ("賽道資訊", []),
            ("賽道列表", []),
            ("有哪些賽道", []),
            ("Track List", [])
        ]
    },
    "GetTeamMenu": {
        "entity_tag": None,
        "phrases": [
            ("賽車介紹", []),
            ("車隊列表", []),
            ("賽車列表", []),
            ("Team List", [])
        ]
    }
}

# --- Generation Logic (Corrected for zh-tw) ---

BASE_DIR = "dialogflow_export_zh"
if os.path.exists(BASE_DIR):
    shutil.rmtree(BASE_DIR)
os.makedirs(f"{BASE_DIR}/entities", exist_ok=True)
os.makedirs(f"{BASE_DIR}/intents", exist_ok=True)

# Generate package.json
package_data = {
    "version": "1.0.0",
    "description": "F1 Chatbot generated by Python (zh-tw)"
}
with open(f"{BASE_DIR}/package.json", "w", encoding='utf-8') as f:
    json.dump(package_data, f, indent=2)

# Generate agent.json (Set language to zh-tw)
agent_data = {
  "description": "",
  "language": TARGET_LANG,
  "shortDescription": "",
  "examples": "",
  "linkToDocs": "",
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
    "available": True,
    "useForDomains": False,
    "cloudFunctionsEnabled": False,
    "cloudFunctionsInitialized": False
  },
  "isPrivate": True,
  "customClassifierMode": "use.after",
  "mlMinConfidence": 0.3,
  "supportedLanguages": [],
  "enableWebhooks": True
}
with open(f"{BASE_DIR}/agent.json", "w", encoding='utf-8') as f:
    json.dump(agent_data, f, indent=2)

# Generate Entities
for ent_name, entries in entities.items():
    ent_id = str(uuid.uuid4())
    
    # Definition file
    ent_def = {
        "id": ent_id,
        "name": ent_name,
        "isOverridable": True,
        "isEnum": False,
        "isRegexp": False,
        "automatedExpansion": False,
        "allowFuzzyExtraction": True
    }
    with open(f"{BASE_DIR}/entities/{ent_name}.json", "w", encoding='utf-8') as f:
        json.dump(ent_def, f, indent=2)
    
    # Entries file (zh-tw) -> 檔名關鍵字: _entries_zh-tw.json
    with open(f"{BASE_DIR}/entities/{ent_name}_entries_{TARGET_LANG}.json", "w", encoding='utf-8') as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)

# Generate Intents
for intent_name, intent_data in intents.items():
    intent_id = str(uuid.uuid4())
    entity_tag = intent_data["entity_tag"]
    
    # 1. Main Intent File
    parameters = []
    if entity_tag:
        parameters.append({
            "id": str(uuid.uuid4()),
            "name": entity_tag,
            "required": True,
            "dataType": f"@{entity_tag}",
            "value": f"${entity_tag}",
            "defaultValue": "",
            "isList": False,
            "prompts": [],
            "promptMessages": [],
            "noMatchPromptMessages": [],
            "noInputPromptMessages": [],
            "outputDialogContexts": []
        })
        
    intent_def = {
        "id": intent_id,
        "name": intent_name,
        "auto": True,
        "contexts": [],
        "responses": [
            {
                "resetContexts": False,
                "action": "",
                "affectedContexts": [],
                "parameters": parameters,
                "messages": [
                    {
                        "type": "0",
                        "title": "",
                        "textToSpeech": "",
                        "lang": TARGET_LANG,
                        "speech": []
                    }
                ],
                "defaultResponsePlatforms": {},
                "speech": []
            }
        ],
        "priority": 500000,
        "webhookUsed": True,
        "webhookForSlotFilling": False,
        "fallbackIntent": False,
        "events": [],
        "conditionalResponses": [],
        "condition": "",
        "conditionalFollowupEvents": []
    }
    
    with open(f"{BASE_DIR}/intents/{intent_name}.json", "w", encoding='utf-8') as f:
        json.dump(intent_def, f, indent=2)
        
    # 2. Usersays File (zh-tw) -> 檔名關鍵字: _usersays_zh-tw.json
    usersays = []
    for text_full, entity_maps in intent_data["phrases"]:
        data = []
        last_idx = 0
        
        if not entity_maps:
            data.append({"text": text_full, "userDefined": False})
        else:
            val, alias = entity_maps[0]
            start = text_full.find(val)
            if start == -1:
                data.append({"text": text_full, "userDefined": False})
            else:
                if start > 0:
                    data.append({"text": text_full[:start], "userDefined": False})
                data.append({
                    "text": val,
                    "alias": alias,
                    "meta": f"@{alias}",
                    "userDefined": True
                })
                if start + len(val) < len(text_full):
                    data.append({"text": text_full[start + len(val):], "userDefined": False})
                    
        usersays.append({
            "id": str(uuid.uuid4()),
            "data": data,
            "isTemplate": False,
            "count": 0,
            "lang": TARGET_LANG,
            "updated": 0
        })
        
    with open(f"{BASE_DIR}/intents/{intent_name}_usersays_{TARGET_LANG}.json", "w", encoding='utf-8') as f:
        json.dump(usersays, f, indent=2, ensure_ascii=False)

# Make Zip
zip_filename = "f1_bot_agent_zh"
shutil.make_archive(zip_filename, 'zip', BASE_DIR)
print(f"ZIP created: {zip_filename}.zip")
