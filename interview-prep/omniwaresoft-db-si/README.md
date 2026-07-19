# 歐立威（Omniwaresoft）— DB 導入／維運 面試筆記

> 面試後整理：職缺實際偏 **SQL 線（EDB／PostgreSQL 生態）**，不是天天寫 ETL。  
> 面試官建議優先了解 [EDB 產品頁](https://www.omniwaresoft.com.tw/edb-2/)。

## 這份資料怎麼用

| 檔案 | 用途 |
|------|------|
| [01-interview-summary.md](./01-interview-summary.md) | 角色、薪資、老闆在乎什麼、跟 ETL 準備的關係 |
| [02-edb-product-cheatsheet.md](./02-edb-product-cheatsheet.md) | EDB 產品小抄（對上歐立威官網那頁） |
| [03-work-flow-skills.md](./03-work-flow-skills.md) | 架設 → 上線 → MA → 升級：流程與技能 |
| [04-linux-postgres-oral-qa.md](./04-linux-postgres-oral-qa.md) | Linux＋Postgres 最小口試清單（10 題） |

## 一句話記住這家公司

> 歐立威用 **SQL（EDB、Greenplum／WarehousePG）** 幫企業把核心與分析資料庫建穩；用 **NoSQL（ELK、Mongo）＋ Docker** 處理搜尋、日誌與部署。工程師依合約架環境、上線、定期 health check，有更新再進場，常需出差。

## 你現在的主線（面試官訊號）

```
PostgreSQL 底子
  → EDB（EPAS + PEM + EFM + 備份 + Migration）
  → 架起來 → 上線 → MA／health check → 升級再進場
  → 之後才碰 Greenplum／WarehousePG
```

**Linux 兩邊都要**（SQL／NoSQL 共用底子），不是只有 NoSQL 才需要。
