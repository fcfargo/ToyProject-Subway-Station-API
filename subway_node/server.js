const express = require('express');
const mongoose = require('./model');

const app = express();
const server = app.listen(8000, () => 
    console.log('Start Server: localhosst:8000')
);

app.get('/subway', function(req,res) {
    const db = async () => {
        console.time();
        try {
            
            let name = req.query.station;

            if (!name) {res.send(JSON.stringify({message : 'NO DATA'}))}

            if (name.includes('호선')){
                const subway_lines = mongoose("subway_lines")
                const line_data_list = await subway_lines
                .findOne(
                    {"name" : name}
                )
                name = parseInt(line_data_list._id)
                const subway_stations = mongoose("subway_stations")
                var data_list = await subway_stations
                .find(
                    {"subway_line_id" : name},
                )
                .populate(
                    "time_information.first_train_terminus_id",
                    "station_names"
                )
                .populate(
                    "time_information.last_train_terminus_id",
                    "station_names"
                )
                .populate(
                    "subway_line_id",
                    "name"
                )
            } else{            
                const subway_stations = mongoose("subway_stations")
                var data_list = await subway_stations
                .find(
                    {$or: [{"station_names.name" : {$regex: '.*' + name + '.*', $options: 'i' }}, {"station_code" : name }]}
                )
                .populate(
                    "time_information.first_train_terminus_id",
                    "station_names"
                )
                .populate(
                    "time_information.last_train_terminus_id",
                    "station_names"
                )
                .populate(
                    "subway_line_id",
                    "name"
                )
            }
        } catch (e) {
            console.log(e)
        }
        try {
            result = []
            for (const index in data_list) {          
                const time_data_list = data_list[index].time_information
                station_time_data = []
                for (const index_time in time_data_list) {
                    if (time_data_list[index_time].is_upper == 1) {let is_upper; is_upper = '상행선';} 
                    else {is_upper = '하행선';}

                    if (time_data_list[index_time].day_type == 1) {let day_type; day_type = '평일';} 
                    else if (time_data_list[index_time].day_type == 2){day_type = '토요일';} else {day_type = '일요일';}

                    if (time_data_list[index_time].first_train_terminus_id.station_names[0]) {let first_train_terminus; first_train_terminus = time_data_list[index_time].first_train_terminus_id.station_names[0].name} else first_train_terminus = null
                    if (time_data_list[index_time].last_train_terminus_id.station_names[0]) {let last_train_terminus; last_train_terminus = time_data_list[index_time].last_train_terminus_id.station_names[0].name} else last_train_terminus = null

                    let first_time = time_data_list[index_time].first_train_time;
                    if (first_time == '000000') {first_time = null} else {first_time = first_time.substring(0,2) + ':' + first_time.substring(2,4)} 

                    let last_time = time_data_list[index_time].last_train_time;
                    if (last_time == '000000') {last_time = null} else {last_time = last_time.substring(0,2) + ':' + last_time.substring(2,4)} 

                    time_data = {
                        is_upper             : is_upper,
                        day_type             : day_type,
                        first_train_time     : first_time,
                        first_train_terminus : first_train_terminus,
                        last_train_time      : last_time,
                        last_train_terminus  : last_train_terminus
                    }
                    station_time_data.push(time_data);   
                }
                if (data_list[index].is_transfer == false) {let is_trasfer; is_transfer = "N";} 
                else {is_transfer = 'Y';}

                station_data = {
                    subway_line       : data_list[index].subway_line_id.name,
                    station_names     : [
                        data_list[index].station_names[0].name, 
                        data_list[index].station_names[1].name
                    ],
                    staion_code       : data_list[index].station_code,
                    is_transfer       : is_transfer,
                    station_time_info : station_time_data,
                }
                result.push(station_data)
            }
        } catch (e) {
            console.log(e)
        }
        try {
            console.timeEnd();
            console.log(result);
            res.send(JSON.stringify(result))
        } catch (e) {
            console.log(e)
        }
    }
    db()
});