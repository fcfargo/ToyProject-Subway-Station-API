const mongoose = require("mongoose");
const db_config = require("./db_config");
const Schema  = mongoose.Schema

mongoose.connect("mongodb://127.0.0.1:27017/subway", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    "auth": {
        "authSource": db_config.authSource
      },
      "user": db_config.user,
      "pass": db_config.password,      
}).then(() => console.log(
    'Successfully connected to mongoDB!'
)).catch(e => console.error(e));

//subway_lines
const SubwayLine = new Schema({
    _id        : Number, 
    name       : {type: String, required: true},
    color_code : {type: String,  required: true},
});
const subway_lines = mongoose.model("subway_lines", SubwayLine) 

//transfer_station_categories
const TransferStationCategory = new Schema({
    _id: Number,
    name: String,
});
const transfer_station_categories = mongoose.model("transfer_station_categories", TransferStationCategory) 

// station_names
const StationName = new Schema({
    station_id    : {type: String, required: true, unique: true},
    language_type : Number,
    class_code    : Number,
    name          : {type: String, required: true},
});
// const station_names = mongoose.model("station_names", StationName) 

// time_information
const TimeInformation = new Schema({
    is_upper                : {type: Boolean, required: true},
    day_type                : Number,
    station_id              : {type: String, required: true, unique: true},
    first_train_time        : {type: String, required: true},
    first_train_terminus_id : {type: String, ref: 'subway_stations'},
    last_train_time         : {type: String, required: true},
    last_train_terminus_id  : {type: String, ref: 'subway_stations'},
});
// const time_information = mongoose.model("time_information", TimeInformation) 

// subway_stations
const SubwayStation = new Schema({
    _id                  : String,
    subway_line_id       : {type: Number, ref: 'subway_lines', required: true},
    transfer_category_id : {type: Number, ref: 'transfer_station_categories'},
    station_code         : String,
    is_transfer          : {type: Boolean, required: true},
    station_names        : [StationName],
    time_information     : [TimeInformation],
});
const subway_stations = mongoose.model("subway_stations", SubwayStation) 

module.exports = function(Schema) {

    if (Schema == "subway_lines") {
        return mongoose.model("subway_lines", SubwayLine) 
    };

    if (Schema == "transfer_station_categories") {
        return  mongoose.model("transfer_station_categories", TransferStationCategory) 
    };

    if (Schema == "station_names") {
        return mongoose.model("station_names", StationName) 
    };

    if (Schema == "time_information") {
        return mongoose.model("time_information", TimeInformation)
    };

    if (Schema == "subway_stations") {
        return mongoose.model("subway_stations", SubwayStation) 
    };
}