from datetime import datetime
import time

from flask import Flask, jsonify, request
from flask.signals import appcontext_tearing_down

from directquery        import DirectQuery

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@app.route('/subway')
def get(): 
    if request.method == 'GET':
        start = time.time()
        name = request.args.get('station', None)
        direct_query = DirectQuery()

        if not name:
            return jsonify({"message" : "NO DATA"})
            
        data_list = direct_query.execute_query(

            f"SELECT sub_lines.name AS line, stations.*, names.name AS name, station_time_info.* FROM \
            subway_lines AS sub_lines, subway_stations AS stations, station_names AS names, \
            station_time_information AS station_time_info WHERE sub_lines.id = stations.subway_line_id AND \
            stations.station_id = station_time_info.station_id AND names.station_id = stations.station_id \
            AND (names.name LIKE '%{name}%' OR sub_lines.name LIKE '%{name}%' OR stations.station_code = \
            '{name}');"

        )
        if not data_list:
            return jsonify({"message" : "NO DATA"})

        result = []
        for data in data_list:
            station_name = direct_query.execute_query(
                    f"SELECT DISTINCT names.name FROM station_names AS names JOIN station_time_information AS \
                    time_info ON names.station_id =  '{data[12]}' OR names.station_id  = '{data[14]}' \
                    WHERE names.language_type=1 AND time_info.station_id='{data[1]}';"
                )
            
            station_info = {
                '호선'        : data[0],
                '역 이름(한글)' : data[6],
                '역 외부 코드'  : data[4],
                '환승역 여부'   : 'Y' if data[5] == 1 else 'N',
                '역 시간 정보'  : [{
                    '상/하행선'     : '상행선' if data[8] == True else '하행선',
                    '요일 구분'     : '평일' if data[9] == 1 else '토요일' if data[9] == 2 else '휴일',
                    '첫차 출발 시간' : (data[11] + datetime.min).time().strftime('%H시 %M분'),
                    '첫차 도착역명'  : station_name[0][0] if data[12] != '0000' else None,
                    '막차 출발 시간' : (data[13] + datetime.min).time().strftime('%H시 %M분'),
                    '막차 도착역명'  : station_name.pop()[0] if data[14] != '0000' else None,
            }]
            }
            result.append(station_info) 

        print('time :', time.time()-start)
        return jsonify({'result': result})

if __name__ == "__main__":
    app.run(debug=True, host='localhost', port=8000)