
from flask import Flask, request, jsonify
import f1_wiki

app = Flask(__name__)

# 支援處理中文 JSON
app.config['JSON_AS_ASCII'] = False

@app.route("/", methods=['GET'])
def health_check():
    """Health Check 確認伺服器活著"""
    return "🏎️ F1 Chatbot Webhook is Running! Ready for Dialogflow requests."

@app.route("/webhook", methods=['POST'])
def webhook():
    """
    Dialogflow Webhook 入口
    接收 Dialogflow 傳來的 POST JSON -> 解析 Intent -> 呼叫 f1_wiki -> 回傳 JSON
    """
    try:
        req = request.get_json(force=True)
        # 取得 Intent 名稱
        intent_display_name = req.get('queryResult').get('intent').get('displayName')
        # 取得參數 (Parameters)
        parameters = req.get('queryResult').get('parameters', {})

        print(f"📥 Received Intent: {intent_display_name}")
        print(f"📦 Parameters: {parameters}")

        # 預設回覆
        fulfillment_text = "抱歉，我的引擎縮缸了，請再說一次。"

        # --- 邏輯分流 (Router) ---
        
        # 1. 查詢車手
        if intent_display_name == 'GetDriverInfo':
            # Dialogflow 傳來的 Entity 參數名稱必須與 Console 設定一致: driver_name
            name = parameters.get('driver_name')
            if not name:
                # 兼容性處理：有時候 Dialogflow 的 list 結構不同
                 name = parameters.get('any') 
            
            if name:
                # 呼叫 Wiki 查表
                fulfillment_text = f1_wiki.get_driver_info(str(name))
            else:
                fulfillment_text = "❌ 系統收到了查询意圖，但沒抓到車手名字。"

        # 2. 查詢賽道
        elif intent_display_name == 'GetTrackInfo':
            name = parameters.get('track_name')
            if name:
                fulfillment_text = f1_wiki.get_track_info(str(name))
            else:
                 fulfillment_text = "❌ 系統收到了查询意圖，但沒抓到賽道名字。"
        
        # 3. 查詢車隊
        elif intent_display_name == 'GetTeamInfo':
            name = parameters.get('team_name')
            if name:
                fulfillment_text = f1_wiki.get_team_info(str(name))
            else:
                fulfillment_text = "❌ 系統收到了查询意圖，但沒抓到車隊名字。"
        
        # 4. 查詢賽季總結 (無參數)
        elif intent_display_name == 'GetSeasonSummary':
            fulfillment_text = f1_wiki.get_season_summary()

        # === 新增對應六大功能的邏輯 ===
        elif intent_display_name == "GetDriverStandings":
            fulfillment_text = f1_wiki.get_driver_standings()

        elif intent_display_name == "GetTeamStandings":
            fulfillment_text = f1_wiki.get_team_standings()

        elif intent_display_name == "GetDriverMenu":
            fulfillment_text = f1_wiki.get_driver_menu()

        elif intent_display_name == "GetTrackMenu":
            fulfillment_text = f1_wiki.get_track_menu()

        elif intent_display_name == "GetTeamMenu":
            fulfillment_text = f1_wiki.get_team_menu()

        # 5. Default Fallback
        else:
            fulfillment_text = f"❓ 收到未知意圖：{intent_display_name}。Python 後端尚未實作此邏輯。"

        # --- 回傳給 Dialogflow 標準格式 ---
        response = {
            "fulfillmentText": fulfillment_text
        }
        return jsonify(response)

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            "fulfillmentText": f"🔥 伺服器發生致命錯誤：{str(e)}"
        })

if __name__ == "__main__":
    print("[INFO] F1 Chatbot Server Starting...")
    # 本地測試時開啟 Debug mode
    app.run(port=5000, debug=True)
