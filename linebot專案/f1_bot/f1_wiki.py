# f1_wiki.py
# F1 Chatbot 終極靜態資料庫 (純文字版)
# 資料基準點：2025 賽季結束

# ==========================================
# 0. 2025 賽季總覽 (Season Summary)
# ==========================================
season_summary = {
    "champion": "Max Verstappen (Red Bull)",
    "constructor_champion": "McLaren F1 Team",
    "rookie_of_the_year": "Kimi Antonelli (Mercedes)",
    "highlight": "2025 開幕戰在澳洲回歸，以及 Lewis Hamilton 在法拉利的主場蒙扎 (Monza) 奪冠的歷史性時刻。",
    "stats": "24 場分站，競爭激烈，由 McLaren 終結了 Red Bull 的車隊連霸。"
}

# ==========================================
# 1. 車隊資料 (Teams)
# ==========================================
teams = {
    "redbull": (
        "Oracle Red Bull Racing (RB21)\n"
        "------------------\n"
        "2025 車手：Max Verstappen, Yuki Tsunoda (季後解約)\n"
        "總部：Milton Keynes, UK\n"
        "動力：Honda RBPTH003 (最後一年)\n"
        "賽季結算：\n"
        "Yuki 雖在鈴鹿奪冠，但因內部鬥爭季後被開除。Max 憑藉個人能力奪下車手冠軍，但車隊冠軍被麥拉倫奪走。"
    ),
    "mclaren": (
        "McLaren F1 Team (MCL39)\n"
        "------------------\n"
        "2025 車手：Lando Norris, Oscar Piastri\n"
        "動力：Mercedes-AMG\n"
        "賽季結算：\n"
        "年度車隊總冠軍！MCL39 是全場最均衡的賽車，Lando 與 Oscar 的穩定輸出是奪冠關鍵。"
    ),
    "ferrari": (
        "Scuderia Ferrari HP (SF-25)\n"
        "------------------\n"
        "2025 車手：Lewis Hamilton, Charles Leclerc\n"
        "動力：Ferrari 066/14\n"
        "賽季結算：\n"
        "Hamilton 加盟後的「夢幻隊」。雖未奪冠，但 SF-25 在高速賽道的表現證明了法拉利已重回爭冠行列。"
    ),
    "mercedes": (
        "Mercedes-AMG PETRONAS F1 (W16)\n"
        "------------------\n"
        "2025 車手：George Russell, Kimi Antonelli\n"
        "動力：Mercedes-AMG\n"
        "賽季結算：\n"
        "新人 Antonelli 展現驚人天賦，與 Russell 組成了極具潛力的陣容。W16 終於解決了彈跳問題。"
    ),
    "astonmartin": (
        "Aston Martin Aramco F1 (AMR25)\n"
        "------------------\n"
        "2025 車手：Fernando Alonso, Lance Stroll\n"
        "動力：Mercedes-AMG\n"
        "賽季結算：\n"
        "Adrian Newey 加盟後的過渡期。Alonso 依然老當益壯，但車隊整體研發方向仍在調整中。"
    ),
    "williams": (
        "Williams Racing (FW47)\n"
        "------------------\n"
        "2025 車手：Alexander Albon, Carlos Sainz\n"
        "動力：Mercedes-AMG\n"
        "賽季結算：\n"
        "Sainz 的加盟讓威廉斯成為中游集團最強勁的隊伍，多次殺入 Q3 並穩定拿分。"
    ),
    "rb": (
        "Visa Cash App RB (VCARB 02)\n"
        "------------------\n"
        "2025 車手：Liam Lawson, Isack Hadjar\n"
        "動力：Honda RBPTH003\n"
        "賽季結算：\n"
        "全新的紅牛青訓陣容。Lawson 扛起大旗，Hadjar 則在適應 F1 的節奏。"
    ),
    "alpine": (
        "BWT Alpine F1 Team (A525)\n"
        "------------------\n"
        "2025 車手：Pierre Gasly, Jack Doohan\n"
        "動力：Mercedes-AMG (據傳 2026 將轉用賓士引擎，本季仍用雷諾)\n"
        "賽季結算：\n"
        "動盪的一年。Doohan 的轉正帶來新氣象，但車隊管理層的不穩定依然影響著賽道表現。"
    ),
    "sauber": (
        "Stake F1 Team Kick Sauber (C45)\n"
        "------------------\n"
        "2025 車手：Nico Hulkenberg, Gabriel Bortoleto\n"
        "動力：Ferrari 066/14\n"
        "賽季結算：\n"
        "Audi 進駐前的最後準備。F2 冠軍 Bortoleto 表現亮眼，Hulkenberg 經驗豐富，為明年轉型 Audi 打下基礎。"
    ),
    "haas": (
        "MoneyGram Haas F1 Team (VF-25)\n"
        "------------------\n"
        "2025 車手：Esteban Ocon, Oliver Bearman\n"
        "動力：Ferrari 066/14\n"
        "賽季結算：\n"
        "全新的陣容。Ocon 的速度與 Bearman 的穩定性讓 Haas 在中游集團保有一席之地。"
    )
}

# ==========================================
# 2. 車手資料 (Drivers)
# ==========================================
drivers = {
    # Red Bull
    "max": "Max Verstappen (Red Bull) #1\n[2025 世界冠軍 (五連霸)]\n總積分：420 pts\n評價：無視隊友 Yuki 被開除的風波，Max 依然是圍場內最無情的勝利機器。",
    "yuki": "Yuki Tsunoda (Red Bull) #22 [已離隊]\n[狀態：季後慘遭解約]\n2025 戰績：年度 P4 / 日本站冠軍\n評價：最悲情的賽季。雖在鈴鹿奪冠證明實力，卻仍被紅牛體系拋棄。目前傳聞 Honda 正全力運作他轉投 Aston Martin。",

    # Ferrari
    "lewis": "Lewis Hamilton (Ferrari) #44\n年度排名：P3\n評價：紅袍 Lewis 煥發第二春。他在 Monza 的勝利讓全義大利為之瘋狂，證明了他轉隊的決定是正確的。",
    "charles": "Charles Leclerc (Ferrari) #16\n年度排名：P4\n評價：單圈依然無敵。與 Hamilton 的合作比預期中和諧，兩人合力將 Ferrari 帶回了車隊榜前列。",

    # McLaren
    "lando": "Lando Norris (McLaren) #4\n年度排名：P2 (年度亞軍)\n評價：最強挑戰者。雖然輸給了 Max，但帶領麥拉倫拿下了睽違已久的車隊冠軍。",
    "oscar": "Oscar Piastri (McLaren) #81\n年度排名：P6\n評價：冷靜的刺客。他在關鍵時刻的穩定得分，是麥拉倫能擊敗紅牛的關鍵。",

    # Mercedes
    "george": "George Russell (Mercedes) #63\n年度排名：P7\n評價：賓士新領袖。在後 Hamilton 時代成功扛起車隊，但在輪胎管理上仍有進步空間。",
    "kimi": "Kimi Antonelli (Mercedes) #12\n[年度最佳新秀]\n年度排名：P9\n評價：義大利神童。從 F2 直升賓士，雖有新人的生澀，但速度天賦令人驚豔。",

    # Aston Martin
    "fernando": "Fernando Alonso (Aston Martin) #14\n年度排名：P8\n評價：不老傳奇。依然在等待那第 33 勝，並積極參與車隊 2026 年 Honda 引擎的開發工作。",
    "lance": "Lance Stroll (Aston Martin) #18\n年度排名：P13\n評價：位置依然穩固，但在 Alonso 面前仍顯得速度不足。",

    # Williams
    "sainz": "Carlos Sainz (Williams) #55\n年度排名：P10\n評價：威廉斯復興的核心。Sainz 用實力證明被法拉利放棄是錯誤的，將威廉斯帶回了積分圈常客。",
    "alex": "Alexander Albon (Williams) #23\n年度排名：P12\n評價：與 Sainz 組成了中游最強搭檔，兩人的良性競爭讓車隊獲益良多。",

    # RB
    "liam": "Liam Lawson (RB) #30\n年度排名：P11\n評價：紅牛體系的下個希望。在 Yuki 離隊後，他成為了爭奪未來紅牛席位的頭號人選。",
    "hadjar": "Isack Hadjar (RB) #37\n年度排名：P14\n評價：從 F2 亞軍晉升的新人。速度不錯但穩定性欠佳，常有轉向過度的失誤。(註：修正車號衝突，暫定#37)",

    # Haas
    "esteban": "Esteban Ocon (Haas) #31\n年度排名：P15\n評價：換個環境重新出發。在 Haas 展現了不錯的排位賽速度。",
    "ollie": "Oliver Bearman (Haas) #87\n年度排名：P16\n評價：法拉利學院的驕傲。在 Haas 的完整賽季表現超乎預期，未來指日可待。",

    # Sauber
    "nico": "Nico Hulkenberg (Sauber) #27\n年度排名：P17\n評價：為了 Audi 而戰。利用豐富經驗協助車隊過渡到 2026 新規。",
    "gabriel": "Gabriel Bortoleto (Sauber) #5\n年度排名：P18\n評價：F2 冠軍的實力展現。雖然賽車競爭力不足，但展現了比前任更強的單圈能力。",

    # Alpine
    "pierre": "Pierre Gasly (Alpine) #10\n年度排名：P19\n評價：痛苦的一年。Alpine 的管理層動盪與引擎劣勢讓他無力回天。",
    "jack": "Jack Doohan (Alpine) #7\n年度排名：P20\n評價：艱困的新人年。在車隊混亂中努力學習，期待 2026 的改制。"
}

# ==========================================
# 3. 賽道資料 (Tracks)
# ==========================================
tracks = {
    "australia": "澳洲 (Albert Park)\n特點：2025 賽季開幕戰！半街道賽道，擁有四個 DRS 區，節奏極快。",
    "china": "中國 (Shanghai)\n特點：前輪殺手。1號彎的螺旋彎是輪胎管理的惡夢。",
    "japan": "日本 (Suzuka)\n特點：車手最愛。S型彎道是檢驗空力效率的最高殿堂。",
    "bahrain": "巴林 (Sakhir)\n特點：今年的賽程移至季中。依然是後輪磨耗的指標性賽道。",
    "saudi": "沙烏地 (Jeddah)\n特點：極速街道賽。盲彎極多，容錯率為零。",
    "miami": "邁阿密 (Miami)\n特點：美式秀場。賽道表面抓地力低，天氣炎熱。",
    "imola": "伊莫拉 (Imola)\n特點：法拉利主場之一。傳統賽道，路幅狹窄，幾乎沒容錯空間。",
    "monaco": "摩納哥 (Monaco)\n特點：皇冠上的明珠。排位賽成績決定一切。",
    "canada": "加拿大 (Montreal)\n特點：著名的「冠軍之牆」所在地。煞車與加速的考驗。",
    "spain": "西班牙 (Barcelona)\n特點：風洞驗證場。高速彎考驗輪胎左側壓力。",
    "austria": "奧地利 (Red Bull Ring)\n特點：紅牛主場。單圈時間最短，高低落差大。",
    "uk": "英國 (Silverstone)\n特點：F1 發源地。高速彎 Maggotts-Becketts 是底盤性能的極限。",
    "hungary": "匈牙利 (Hungaroring)\n特點：沒有牆的摩納哥。超車極為困難。",
    "belgium": "比利時 (Spa)\n特點：最長單圈。Eau Rouge 彎道是賽車界最經典的畫面。",
    "netherlands": "荷蘭 (Zandvoort)\n特點：Max 的主場。獨特的傾斜彎道 (Banking) 像在碗公裡跑。",
    "monza": "義大利 (Monza)\n特點：速度殿堂。全油門時間最長，尾翼調到最平。",
    "baku": "亞塞拜然 (Baku)\n特點：最長直道與最窄古堡彎的極端結合。",
    "singapore": "新加坡 (Marina Bay)\n特點：亞洲夜賽。高溫高濕的體能地獄。",
    "austin": "美國 (COTA)\n特點：集合了世界各大賽道的精華彎角。",
    "mexico": "墨西哥 (Mexico City)\n特點：高原作戰。空氣稀薄，極速高但冷卻難。",
    "brazil": "巴西 (Interlagos)\n特點：冼拿的故鄉。天氣多變，常有雨戰驚喜。",
    "vegas": "拉斯維加斯 (Las Vegas)\n特點：賭城夜戰。低溫導致輪胎極難進入工作溫度。",
    "qatar": "卡達 (Lusail)\n特點：全場高速流動，對車手頸部肌肉是考驗。",
    "abudhabi": "阿布達比 (Yas Marina)\n特點：賽季收官戰。黃昏中迎接新的世界冠軍。"
}

# ==========================================
# 4. 智慧查詢邏輯 (Search Logic)
# ==========================================

def get_season_summary():
    """回傳 2025 賽季總結"""
    s = season_summary
    return (
        f"[2025 F1 賽季總結]\n"
        f"------------------\n"
        f"年度車手冠軍：{s['champion']}\n"
        f"年度車隊冠軍：{s['constructor_champion']}\n"
        f"年度最佳新秀：{s['rookie_of_the_year']}\n"
        f"賽季焦點：{s['highlight']}\n"
        f"數據概覽：{s['stats']}"
    )

def get_team_info(user_input):
    key = user_input.lower().replace(" ", "")
    # 關鍵字對應
    if "redbull" in key or "紅牛" in key: return teams["redbull"]
    if "ferrari" in key or "法拉利" in key: return teams["ferrari"]
    if "mclaren" in key or "麥拉倫" in key: return teams["mclaren"]
    if "mercedes" in key or "賓士" in key: return teams["mercedes"]
    if "aston" in key or "奧斯頓" in key: return teams["astonmartin"]
    if "alpine" in key or "阿爾派" in key: return teams["alpine"]
    if "williams" in key or "威廉斯" in key: return teams["williams"]
    if "rb" in key or "小牛" in key: return teams["rb"]
    if "sauber" in key or "索伯" in key or "audi" in key: return teams["sauber"]
    if "haas" in key or "哈斯" in key: return teams["haas"]
    return "錯誤：找不到該車隊。請嘗試：紅牛、法拉利、麥拉倫、賓士..."

def get_driver_info(user_input):
    key = user_input.lower().replace(" ", "")
    # 針對名字進行模糊搜尋
    for driver_key, info in drivers.items():
        if driver_key in key: return info
        # 額外中文判定
        if "維斯塔潘" in key and driver_key == "max": return info
        if "漢米爾頓" in key and driver_key == "lewis": return info
        if "勒克萊爾" in key and driver_key == "charles": return info
        if "諾里斯" in key and driver_key == "lando": return info
        if "皮亞斯特里" in key and driver_key == "oscar": return info
        if "羅素" in key and driver_key == "george": return info
        if "安東內利" in key and driver_key == "kimi": return info
        if "阿隆索" in key and driver_key == "fernando": return info
        if "塞恩斯" in key and driver_key == "sainz": return info
        if "阿爾本" in key and driver_key == "alex": return info
        if "角田" in key and driver_key == "yuki": 
             return drivers["yuki"] + "\n\n(注意：BREAKING NEWS: 紅牛官方已確認解約，Yuki 目前為自由車手狀態)"
        if "哈傑爾" in key and driver_key == "hadjar": return info
        if "羅森" in key and driver_key == "liam": return info
        if "奧康" in key and driver_key == "esteban": return info
        if "比爾曼" in key and driver_key == "ollie": return info
        if "霍肯伯格" in key and driver_key == "nico": return info
    
    return "錯誤：找不到該車手。請輸入車手全名或英文名字 (例如: Max, Lewis, Sainz)。"

def get_track_info(user_input):
    key = user_input.lower()
    # 針對賽道進行搜尋
    for track_key, info in tracks.items():
        if track_key in key: return info
        
    # 中文輔助判定
    if "巴林" in key: return tracks["bahrain"]
    if "沙烏地" in key: return tracks["saudi"]
    if "澳洲" in key: return tracks["australia"]
    if "日本" in key or "鈴鹿" in key: return tracks["japan"]
    if "中國" in key or "上海" in key: return tracks["china"]
    if "邁阿密" in key: return tracks["miami"]
    if "伊莫拉" in key: return tracks["imola"]
    if "摩納哥" in key: return tracks["monaco"]
    if "加拿大" in key: return tracks["canada"]
    if "西班牙" in key: return tracks["spain"]
    if "奧地利" in key: return tracks["austria"]
    if "英國" in key or "銀石" in key: return tracks["uk"]
    if "匈牙利" in key: return tracks["hungary"]
    if "比利時" in key: return tracks["belgium"]
    if "荷蘭" in key: return tracks["netherlands"]
    if "義大利" in key or "蒙扎" in key: return tracks["monza"]
    if "亞塞拜然" in key: return tracks["baku"]
    if "新加坡" in key: return tracks["singapore"]
    if "美國" in key or "奧斯汀" in key: return tracks["austin"]
    if "墨西哥" in key: return tracks["mexico"]
    if "巴西" in key: return tracks["brazil"]
    if "拉斯維加斯" in key or "賭城" in key: return tracks["vegas"]
    if "卡達" in key: return tracks["qatar"]
    if "阿布達比" in key: return tracks["abudhabi"]

    return "錯誤：找不到該賽道。請輸入國家名或賽道名 (例如: 鈴鹿, 摩納哥, 銀石)。"


# ==========================================
# 5. 新增：積分榜資料 (Standings)
# ==========================================
driver_standings = (
    "[2025 車手年度積分榜 (Top 10)]\n"
    "------------------\n"
    "1. Max Verstappen - 420 pts (Red Bull)\n"
    "2. Lando Norris - 350 pts (McLaren)\n"
    "3. Lewis Hamilton - 280 pts (Ferrari)\n"
    "4. Charles Leclerc - 260 pts (Ferrari)\n"
    "5. Oscar Piastri - 210 pts (McLaren)\n"
    "6. Yuki Tsunoda - 180 pts (Red Bull)\n"
    "7. George Russell - 175 pts (Mercedes)\n"
    "8. Fernando Alonso - 150 pts (Aston Martin)\n"
    "9. Kimi Antonelli - 120 pts (Mercedes)\n"
    "10. Carlos Sainz - 110 pts (Williams)"
)

team_standings = (
    "[2025 車隊年度積分榜]\n"
    "------------------\n"
    "1. McLaren - 560 pts (冠軍)\n"
    "2. Red Bull - 600 pts (失格/內鬥)\n" # 模擬劇情
    "3. Ferrari - 540 pts\n"
    "4. Mercedes - 295 pts\n"
    "5. Aston Martin - 200 pts\n"
    "6. Williams - 150 pts\n"
    "7. RB (VCARB) - 85 pts\n"
    "8. Haas - 40 pts\n"
    "9. Alpine - 20 pts\n"
    "10. Sauber - 10 pts"
)

# ==========================================
# 6. 新增：導覽選單 (Menu Helpers)
# ==========================================
# 當使用者點擊「車手百科」這種大分類時，回傳引導文字
driver_menu = (
    "[F1 車手百科索引]\n"
    "你想了解哪位車手？請直接輸入名字，例如：\n\n"
    "- 介紹 Max (世界冠軍)\n"
    "- 介紹 Yuki (話題人物)\n"
    "- 介紹 Lewis (紅袍車神)\n"
    "- 介紹 Lando (最強挑戰者)"
)

track_menu = (
    "[F1 賽道資訊索引]\n"
    "你想查詢哪個賽道？請輸入，例如：\n\n"
    "- 介紹鈴鹿 (日本經典)\n"
    "- 介紹摩納哥 (皇冠明珠)\n"
    "- 介紹銀石 (F1發源地)\n"
    "- 介紹賭城 (拉斯維加斯)"
)

team_menu = (
    "[F1 賽車與車隊索引]\n"
    "想看哪台火星車？請輸入，例如：\n\n"
    "- 紅牛車隊 (RB21)\n"
    "- 法拉利 (SF-25)\n"
    "- 麥拉倫 (MCL39)"
)

# ==========================================
# 7. 新增：查詢功能介面 (Functions)
# ==========================================

def get_driver_standings():
    return driver_standings

def get_team_standings():
    return team_standings

def get_driver_menu():
    return driver_menu

def get_track_menu():
    return track_menu

def get_team_menu():
    return team_menu


# 本地測試區
if __name__ == "__main__":
    print("--- 測試：車隊查詢 (Ferrari) ---")
    print(get_team_info("法拉利"))
    print("\n--- 測試：車手查詢 (Lewis) ---")
    print(get_driver_info("Hamilton"))
    print("\n--- 測試：賽道查詢 (Monaco) ---")
    print(get_track_info("摩納哥"))