import os
from roboflow import Roboflow

print("=== 1. 確認已設置教學指定的 YOLOv9 環境 ===")

print("=== 2. 開始從 Roboflow 下載交通號誌資料集 ===")
# 您的 API Key
rf = Roboflow(api_key="02pWdJlq83YICElAwyim")
project = rf.workspace("graduation-project-bxm12").project("sign-detection-ver2")
version = project.version(5)
dataset = version.download("yolov9")

# 將資料集路徑轉為絕對路徑，以免隨後切換資料夾導致找不到檔案
dataset_yaml = os.path.abspath(f"{dataset.location}/data.yaml")

print("=== 3. 切換至 yolov9 目錄，準備開始訓練 ===")
# 切換到剛剛下載的 yolov9 官方儲存庫目錄
os.chdir("yolov9")

# 組合訓練指令 (完美復刻上課筆記提供的參數)
# 修改 epochs 為 50 以利產出合理圖表
cmd = f"py train_dual.py --workers 8 --device cpu --batch 16 --data {dataset_yaml} --img 640 --cfg models/detect/yolov9-c.yaml --weights '' --name yolov9-c --hyp data/hyps/hyp.scratch-high.yaml --min-items 0 --epochs 50 --close-mosaic 15"

print("開始執行訓練指令:")
print(cmd)
exit_code = os.system(cmd)

if exit_code == 0:
    print("\n=== 訓練大功告成！ ===")
    print("請至左側 yolov9/runs/train/yolov9-c/ (或類似名稱的目錄) 尋找：")
    print("1. results.png (Loss 與 mAP 圖)")
    print("2. confusion_matrix.png (混淆矩陣)")
    print("3. val_batch...pred.jpg (推論照片)")
else:
    print("\n=== 訓練過程遭遇問題，請確認錯誤訊息！ ===")
