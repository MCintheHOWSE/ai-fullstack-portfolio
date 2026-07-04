#!/usr/bin/env python
# coding: utf-8
# 113-2 DE

import requests
import time

from xml.dom.minidom import parse, parseString

import datetime as dt
from datetime import timedelta

from airflow import DAG
from airflow.operators.python_operator import PythonOperator

from elasticsearch import Elasticsearch
from elasticsearch import helpers

import pendulum
local_tz = pendulum.timezone("Asia/Taipei")

# reference
# https://tisvcloud.freeway.gov.tw
# https://thbapp.thb.gov.tw/opendata/vd1.aspx
# https://docs.python.org/zh-tw/3.8/library/xml.dom.minidom.html




# VD 靜態資訊(v2.0) 1day/1day   xml 提供VD之空間位置描述及其他相關欄位
VD_INFO_URL = "https://tisvcloud.freeway.gov.tw/history/motc20/VD.xml"

# VD 動態資訊(v2.0) 1day/1min   xml 1分鐘定時更新及統整單一VD的動態偵測值
VD_DATA_URL = "https://tisvcloud.freeway.gov.tw/history/motc20/VDLive.xml"



# The function uses to download xml file and parse XML string
def download_and_parse_xml(url):

    # ------ CODE BEGIN ZONE 0 ------

    r = requests.
    if r.status_code != 200:
        print('Failed to download data from %s'%(url))

    # ------ CODE END ZONE 0 ------
    
    return parseString(r.text)



# The function uses to get the text from giving the node of XML
def get_text(item):
    if len(item.childNodes) == 0:
        return ""
    return item.childNodes[0].data



# The function uses to parse each VD info 
def parse_vd_info(xml):
    info = {} # dict

    # loop for obatin these value of each VD info
    # ------ CODE BEGIN ZONE 1 ------

    for VD in xml.getElementsByTagName("VD"):
        vd_info = {}
        vd_info.update({"VDID": get_text(VD.getElementsByTagName("VDID")[0])})
        vd_info.update({"SubAuthority": )
        vd_info.update({"BiDirectional": )
        vd_info.update({"VDType": )
        vd_info.update({"LocationType": )
        vd_info.update({"DectionType": )
        vd_info.update({"PositionLon": )
        vd_info.update({"PositionLat": )
        vd_info.update({"RoadID": )
        vd_info.update({"RoadName": )
        vd_info.update({"RoadClass": )
        vd_info.update({"RoadSectionStart": )
        vd_info.update({"RoadSectionEnd": )
        info.update({vd_info["VDID"]: vd_info})

    # ------ CODE END ZONE 1 ------
        
    return info



# The function uses to parse each VD data 
def parse_vd_data(xml):

    # get record update time of the VD
    UpdateTime = get_text(xml.getElementsByTagName("UpdateTime")[0])
    data = {}

    # loop for obatin these value of each VD data
    # ------ CODE BEGIN ZONE 2 ------
    for VD in xml.getElementsByTagName("VDLive"):
        vd_data = {"UpdateTime": UpdateTime}
        vd_data.update({"VDID": )
        vd_data.update({"LinkID": )
        vd_data.update({"LaneID": )
        vd_data.update({"LaneType": )
        vd_data.update({"Speed": )
        vd_data.update({"Occupancy": )
        vd_data.update({"Vehicles": })
        for vechicle in VD.getElementsByTagName("Vehicle"):
            Vehicle_data = {}
            Vehicle_data.update({"VehicleType": )
            Vehicle_data.update({"Volume": )
            Vehicle_data.update({"Speed": )
            vd_data["Vehicles"].append(Vehicle_data)
        vd_data.update({"status": })
        vd_data.update({"DataCollectTime": )
        data.update({vd_data["VDID"]:vd_data})
    
    

    return 
    # ------ CODE END ZONE 2 ------



# The function uses to transform each VD data
# and update VD data from info of VD
def transform(info, data):
    processed_data = []

    # ------ CODE BEGIN ZONE 3 ------
    for key in data:
        if key not in info:
            continue
        d = {}
        d.update()
        d.update()
        d["id"] = data[key]["UpdateTime"] + "|" + data[key]["VDID"]
        d["Volume"] = sum()
        d["coords"] = 
        d["creator_by"] = 
        processed_data.append(d)

    # ------ CODE END ZONE 3 ------

    return processed_data



# The function uses to each VD data
def insertElasticsearch(data):

    # ------ CODE BEGIN ZONE 4 ------
    es = Elasticsearch('http://localhost:9200') 
    doc = [{"_op_type": ,
            "_index": ,
            "_id": d['id'],
            "": True,
            "doc": d} for d in data]
    resp = helpers.bulk()   

    # ------ CODE END ZONE 4 ------

def main():
    
    # excute to download the VD info
    xml_vd_info = download_and_parse_xml(VD_INFO_URL)

    # excute to download the VD data 
    xml_vd_data = download_and_parse_xml(VD_DATA_URL)

    # excute to parse VD info
    vd_info = parse_vd_info(xml_vd_info)

    # excute to parse VD data
    vd_data = parse_vd_data(xml_vd_data)

    # excute to transform VD info and VD data to the format for Elasticsearch
    data = transform(vd_info, vd_data)

    # excute to insert the transormed VD data to Elasticsearch
    insertElasticsearch(data)
    print("Finished...")  



# Set Airflow DAG's config
# ------ CODE BEGIN ZONE 5 ------
default_args = {
                'owner': 'dataengr',
                'start_date': dt.datetime( , tzinfo=local_tz),
                'retries': 0,
                'retry_delay': dt.timedelta(minutes=0),
}


with DAG('',
         default_args=default_args,
         schedule_interval=timedelta(),
         ) as dag:

    doProcessData = PythonOperator(
                    task_id='getVDtoDataWarehouse',
                    python_callable=main)


# ------ CODE END ZONE 5 ------
