import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import os

def generate_pdf():
    # Set up matplotlib for Chinese fonts on Windows
    # Trying common ones available
    try:
        plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
    except:
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'sans-serif']
    plt.rcParams['axes.unicode_minus'] = False
    
    with PdfPages('TimeSeries_W03_Homework.pdf') as pdf:
        
        # 1. Series A: Google Stock Daily Change (White Noise)
        np.random.seed(42)
        dates_a = pd.date_range(start='2018-01-01', periods=100, freq='B')
        data_a = np.random.normal(0, 1.5, size=100)
        
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

def generate_plots():
    # Set up matplotlib for Chinese fonts on Windows
    try:
        plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei'] 
    except:
        plt.rcParams['font.sans-serif'] = ['SimHei', 'Arial Unicode MS', 'sans-serif']
    plt.rcParams['axes.unicode_minus'] = False
    
    # 1. Series A: Google Stock Daily Change (White Noise)
    np.random.seed(42)
    dates_a = pd.date_range(start='2018-01-01', periods=100, freq='B')
    data_a = np.random.normal(0, 1.5, size=100)
    
    fig_a, ax_a = plt.subplots(figsize=(10, 6))
    ax_a.plot(dates_a, data_a, color='royalblue')
    ax_a.set_title('序列 A：Google 股價日變動', fontsize=16)
    ax_a.set_xlabel('日期', fontsize=12)
    ax_a.set_ylabel('價格變動 (USD)', fontsize=12)
    plt.setp(ax_a.get_xticklabels(), rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('A_GoogleStock_WhiteNoise.png')
    plt.close()
    
    # 2. Series B: Australia Annual GDP (Trend)
    years_b = np.arange(1960, 2020)
    data_b = np.linspace(100, 500, len(years_b)) + np.random.normal(0, 15, len(years_b))
    
    fig_b, ax_b = plt.subplots(figsize=(10, 6))
    ax_b.plot(years_b, data_b, color='forestgreen', marker='o', markersize=4)
    ax_b.set_title('序列 B：澳洲年度 GDP', fontsize=16)
    ax_b.set_xlabel('年份', fontsize=12)
    ax_b.set_ylabel('總量指標', fontsize=12)
    plt.setp(ax_b.get_xticklabels(), rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('B_AusGDP_Trend.png')
    plt.close()
    
    # 3. Series C: Australia Electricity Production (Mixed Patterns)
    dates_c = pd.date_range(start='2005-01-01', end='2009-12-31', freq='QE')
    t = np.arange(len(dates_c))
    data_c = 150 + 2 * t + 30 * np.sin(2 * np.pi * t / 4) + np.random.normal(0, 5, len(t))
    
    fig_c, ax_c = plt.subplots(figsize=(10, 6))
    ax_c.plot(dates_c, data_c, color='darkorange', marker='s', markersize=4)
    ax_c.set_title('序列 C：澳洲電力產量', fontsize=16)
    ax_c.set_xlabel('季度', fontsize=12)
    ax_c.set_ylabel('生產數值', fontsize=12)
    plt.setp(ax_c.get_xticklabels(), rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('C_AusElectricity_Mixed.png')
    plt.close()
    
    # 4. Series F: Australia Gas Production (Heteroscedasticity)
    dates_f = pd.date_range(start='1970-01-01', end='2005-12-31', freq='QE')
    t_f = np.arange(1, len(dates_f) + 1)
    data_f = 50 + t_f * 1.5 + np.random.normal(0, t_f * 0.4, len(t_f))
    
    fig_f, ax_f = plt.subplots(figsize=(10, 6))
    ax_f.plot(dates_f, data_f, color='purple')
    ax_f.set_title('序列 F：澳洲瓦斯產量', fontsize=16)
    ax_f.set_xlabel('季度', fontsize=12)
    ax_f.set_ylabel('產出單位', fontsize=12)
    plt.setp(ax_f.get_xticklabels(), rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig('F_AusGas_Heteroscedasticity.png')
    plt.close()

if __name__ == "__main__":
    generate_plots()
    print("Images A_GoogleStock_WhiteNoise.png, B_AusGDP_Trend.png, C_AusElectricity_Mixed.png, F_AusGas_Heteroscedasticity.png generated successfully.")
