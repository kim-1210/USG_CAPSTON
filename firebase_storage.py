import json
import pyrebase
import os
import sys
from pyrebase.pyrebase import PyreResponse
import json
import datetime
import pandas as pd
import shutil
import seaborn as sb
import matplotlib as plt
import threading
import cv2
import time
import hashlib #비밀번호 해쉬화
#형식
#corporation/user/type/id => {password, name, birthday}
#corporation/detector/id => {password, name}

with open("auth.json") as f:
    config = json.load(f)

firebase = pyrebase.initialize_app(config)
db = firebase.database()

def create_user(corporation, typed, id, password, name, birthday): #안전직과 현장직 : 직원 등록하기
    find_data = all_search_user(corporation, typed)
    hash_password = hashlib.sha256(password.encode()).hexdigest()
    if find_data == None:
        data = {'password' : hash_password, 'name' : name, 'birthday' : birthday}
        db.child(corporation).child('user').child(typed).child(id).update(data)
        if typed == 'worked':
            table_excel = pd.read_excel(f'./corporation_excel/{corporation}/today.xlsx')
            temp = pd.DataFrame({'name' : [name], 'id' : [id], 'check' : ['X'], 'check_time' : ['-']})
            table_excel = pd.concat([table_excel, temp], axis=0)
            table_excel.to_excel(f'./corporation_excel/{corporation}/today.xlsx', index=False)
        return '직원 정보를 추가 하였습니다.'
    elif id in find_data:
        return 'id가 이미 존재합니다.'
    else:    
        data = {'password' : hash_password, 'name' : name, 'birthday' : birthday}
        db.child(corporation).child('user').child(typed).child(id).update(data)
        if typed == 'worked':
            table_excel = pd.read_excel(f'./corporation_excel/{corporation}/today.xlsx')
            temp = pd.DataFrame({'name' : [name], 'id' : [id], 'check' : ['X'], 'check_time' : ['-']})
            table_excel = pd.concat([table_excel, temp], axis=0)
            table_excel.to_excel(f'./corporation_excel/{corporation}/today.xlsx', index=False)
        return '직원 정보를 추가 하였습니다.'

def user_remove(corporation, typed, id): #회원 삭제
    try:
        #db.child(~).remove()
        db.child(corporation).child('user').child(typed).child(id).remove()
        if typed == 'worked':
            table_excel = pd.read_excel(f'./corporation_excel/{corporation}/today.xlsx')
            table_excel = table_excel.drop(table_excel[table_excel['id'] == id].index,axis=0)
            table_excel.to_excel(f'./corporation_excel/{corporation}/today.xlsx', index=False)
        print('회원 삭제')
        return '삭제완료'
    except Exception as err:
        print('회원의 정보가 없습니다.')
        return '해당 직원의 정보가 없습니다.'

def all_search_user_name(corporation): #이름 뽑아오기
    try:
        all_user_name = db.child(corporation).child('user').child('worked').get().val()
        all_name_list = []
        for i, k in all_user_name.items():
            all_name_list.append(k.get('name'))
            print(all_name_list)
        return all_name_list    
    except Exception as err:
        print("가져오기 실패")

def search_user_detail(corporation, typed, id): #특정 user정보 가져오기 
    try:
        information = db.child(corporation).child('user').child(typed).child(id).get()
        print('출력완료')
        return information
    except Exception as err:
        print('회원 정보가 맞지않거나 없습니다.') 

def all_search_user(corporation, typed): #typed에 맞는 모든 회원 id 가져오기
    try:
        #db.child(~).get()
        all_tpyed_id = []
        dating = db.child(corporation).child('user').child(typed).get()
        for i in dating.val(): #typed에 해당하는 모든 id 값가져오기
            all_tpyed_id.append(i)
        return all_tpyed_id
    except Exception as err:
        print(f'{typed}에 정보가 하나도 없습니다.')
        return f'{typed}에 정보가 하나도 없습니다.'

def login(corporation, typed, id, password): #로그인
    try:
        id_dict = db.child(corporation).child('user').child(typed).child(id).get()
        information_dict = dict(id_dict.val())
        hash_password = hashlib.sha256(password.encode()).hexdigest()
        if hash_password == information_dict['password']:
            print('로그인 성공!')
            return True
        else:
            print('로그인 실패!')
            return False
    except Exception as err:
        print('로그인에 실패했습니다.')
        return False
    
def detector_login(corporation, id, password): #로그인
    try:
        id_dict = db.child(corporation).child('detector').child(id).get()
        information_dict = dict(id_dict.val())
        hash_password = password
        if hash_password == information_dict['password']:
            print('로그인 성공!')
            return True, information_dict['name']
        else:
            print('로그인 실패!')
            return False
    except Exception as err:
        print('로그인에 실패했습니다.')
        return False

def check_today(corporation, id, enter_value): #출석하기
    try:
        table_excel = pd.read_excel(f'./corporation_excel/{corporation}/today.xlsx')
        table_excel.loc[table_excel['id'] == id, 'check'] = enter_value
        if enter_value == 'O':
            table_excel.loc[table_excel['id'] == id, 'check_time'] = datetime.datetime.now().strftime("%H:%M")
        else:
            table_excel.loc[table_excel['id'] == id, 'check_time'] = '-'
        table_excel.to_excel(f'./corporation_excel/{corporation}/today.xlsx', index=False)
        if enter_value == 'O':
            return '출근하였습니다.'
        else:
            return '출근을 취소하였습니다.'
    except Exception as err:
        return '장비 충족 실패'

def new_date(): #다음날이 되면 excel에 넣고 새로 뽑기
    file_list = os.listdir('./corporation_excel/')
    date = datetime.datetime.now()
    for i in file_list:
        if os.path.exists(f'./corporation_excel/{i}/{str(date.year)}.xlsx') == False: #총합 파일 존재여부
            print('새로 생성')
            original_file = './sample_excel/2024.xlsx'
            new_file = f'./corporation_excel/{i}/{str(date.year)}.xlsx'
            shutil.copyfile(original_file, new_file)
        table_excel = pd.read_excel(f'./corporation_excel/{i}/today.xlsx')
        tmep = table_excel.copy()
        tmep['check'] = 'X'
        tmep.to_excel(f'./corporation_excel/{i}/today.xlsx', index=False) 
        #금일 설정

        table_excel.insert(0, 'day', str(date.day))
        all_excel = pd.read_excel(f'./corporation_excel/{i}/{str(date.year)}.xlsx', sheet_name=str(date.month), engine='openpyxl')
        all_excel = pd.concat([all_excel, table_excel], axis=0)
        with pd.ExcelWriter(f'./corporation_excel/{i}/{str(date.year)}.xlsx', engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            all_excel.to_excel(writer, sheet_name=str(date.month), index=False)
        print('완료')

def get_corporation():
    try:
        information = db.get().val()
        corporation_list = []
        for i,k in information.items():
            corporation_list.append(i)
        return corporation_list
    except Exception as err:
        print(err)

def get_today_excel(corporation): #금일출근 현황 데이터를 html로
    try:
        table_excel = pd.read_excel(f'./corporation_excel/{corporation}/today.xlsx')
        html_transfer = table_excel.to_html()
        return html_transfer
    except Exception as err:
        print('찾지 못 했습니다.')
        return '찾지 못 했습니다.'

def get_all_excel(corporation, year, month, user = 'all'): #달 마다의 데이터를 html로 
    try:
        table_excel = pd.read_excel(f'./corporation_excel/{corporation}/{year}.xlsx', sheet_name=month)
        if user != '전체':
            table_excel = table_excel.loc[table_excel['id'] == user]
        html_transfer = table_excel.to_html()
        print(html_transfer)
        return html_transfer
    except Exception as err:
        print("찾지못함")
        return '찾지 못 했습니다.'

def set_suggest(corporation, title, image, content, id): #건의사항 올리기
    table = pd.read_excel(f'./suggests/{corporation}/suggest.xlsx', index=False)
    imgs = os.listdir('./temping/image')
    name = f'{str(len(imgs) + 1)}.png'
    temp = pd.DataFrame({'title' : title, 'image' : image, 'content' : content, 'id': id})
    table = pd.concat([table, temp], axis=0)
    name = f'./suggests/{corporation}/image/{str(len(imgs) + 1)}.jpg'
    print(name)
    cv2.imwrite(name, imgs)
    table.to_excel(f'./suggests/{corporation}/suggest.xlsx', index=False)
    return "건의사항이 제출되었습니다."

def get_id_suggest(corporation, id):
    table = pd.read_excel(f'./suggests/{corporation}/suggest.xlsx')
    re_table = table.loc[table['id'] == id]
    send_data = re_table['title'].to_list()
    return send_data

def get_suggest(corporation): #건의 사항 리스트 출력
    table = pd.read_excel(f'./suggests/{corporation}/suggest.xlsx')
    send_data = table['title'].to_list()
    return send_data

def get_detail_suggest(corporation, cnt): #내용 출력 (예정 : 이름 , id 출력)
    table = pd.read_excel(f'./suggests/{corporation}/suggest.xlsx')
    titles = table['title'].to_list()
    images = table['image'].to_list()
    contents = table['content'].to_list()
    return titles[cnt], images[cnt], contents[cnt]

def get_year_file(corporation): #년도 가져오기
    send_list = []
    file_list = os.listdir(f'./corporation_excel/{corporation}/')
    for i in file_list:
        if 'today' not in i:
            send_list.append(i.replace('.xlsx', ''))
    return send_list

def get_safe_detail(corporation, id, cnt): #안전관리자 앱 - 리스트
    table = pd.read_excel(f'./suggests/{corporation}/suggest.xlsx')
    re_table = table.loc[table['id'] == id]
    titles = re_table['title'].to_list()
    images = re_table['image'].to_list()
    contents = re_table['content'].to_list()
    return titles[cnt], images[cnt], contents[cnt]

def get_safe_suggest(corporation, id): #건의 사항 리스트 출력
    table = pd.read_excel(f'./suggests/{corporation}/suggest.xlsx')
    re_table = table.loc[table['id'] == id]
    send_data = re_table['title'].to_list()
    return send_data

def get_manage_user(corporation): #이름이랑 id 출력
    worked = db.child(corporation).child('user').child('worked').get().val()
    protected = db.child(corporation).child('user').child('protected').get().val()
    worked_id = []
    worked_name = []
    worked_birthday = []
    for i,k in worked.items():
        worked_id.append(i)
        worked_name.append(k['name'])
        worked_birthday.append(k['birthday'])
    
    protected_id = []
    protected_name = []
    protected_birthday = []
    for i,k in protected.items():
        protected_id.append(i)
        protected_name.append(k['name'])
        protected_birthday.append(k['birthday'])
    return worked_id, worked_name, worked_birthday, protected_id, protected_name, protected_birthday

def use_thread():
    while True:
        date = datetime.datetime.now()
        if date.hour == 0 and date.minute < 19:
            new_date()
        time.sleep(600000)

# t = threading.Thread(target = use_thread) #다음 날이 되면 자동으로 new_date()가됨
# t.start()

# all_day
# 일 / 이름 / id / 출근여부
# today
# 이름 / id / 출근여부