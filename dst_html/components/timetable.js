import Ractive from 'ractive';
var template = require('./timetable.haml');
var dateFormat = require('dateformat');
import ComponentMeetingPopup from '../components/meeting_popup.js';

dateFormat.i18n = {
    dayNames: [
        'вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб',
        'воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'
    ],
    monthNames: [
        'янв', 'февр', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ],
    timeNames: [
        'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
};

var one_hour = 60;
var day_begin = 8 * one_hour;
var day_end = 23 * one_hour;
var day_length = day_end - day_begin;

var meeting_selected = 0;

var floors_number = 8;

var meetings = [ 
    {   meeting_id: 1, title: 'Собрание 1', participant: 'Дарт Вейдер', number: 12, room_id: 1, 
        start_date: new Date("14 December 2017 8:00"), end_date: new Date("14 December 2017 23:00")    },
    {   meeting_id: 2, title: 'Собрание 2', participant: 'Дарт Вейдер', number: 12, room_id: 2, 
        start_date: new Date("14 December 2017 9:00"), end_date: new Date("14 December 2017 11:30")    },
    {   meeting_id: 3, title: 'Собрание 3', participant: 'Дарт Вейдер', number: 12, room_id: 2, 
        start_date: new Date("14 December 2017 15:30"), end_date: new Date("14 December 2017 23:00")    },
    {   meeting_id: 4, title: 'Собрание 4', participant: 'Дарт Вейдер', number: 12, room_id: 3, 
        start_date: new Date("14 December 2017 13:00"), end_date: new Date("14 December 2017 15:30")    },
    {   meeting_id: 5, title: 'Собрание 5', participant: 'Дарт Вейдер', number: 12, room_id: 3, 
        start_date: new Date("14 December 2017 8:00"), end_date: new Date("14 December 2017 11:00")    },
    {   meeting_id: 6, title: 'Собрание 6', participant: 'Дарт Вейдер', number: 12, room_id: 3, 
        start_date: new Date("14 December 2017 18:00"), end_date: new Date("14 December 2017 20:00")    },
    {   meeting_id: 7, title: 'Собрание 7', participant: 'Дарт Вейдер', number: 12, room_id: 4, 
        start_date: new Date("14 December 2017 8:00"), end_date: new Date("14 December 2017 23:00")    },
    {   meeting_id: 8, title: 'Собрание 8', participant: 'Дарт Вейдер', number: 12, room_id: 5, 
        start_date: new Date("14 December 2017 8:00"), end_date: new Date("14 December 2017 23:00")    },
    {   meeting_id: 9, title: 'Собрание 9', participant: 'Дарт Вейдер', number: 12, room_id: 8, 
        start_date: new Date("14 December 2017 8:00"), end_date: new Date("14 December 2017 23:00")    },
    {   meeting_id: 10, title: 'Собрание 10', participant: 'Дарт Вейдер', number: 12, room_id: 9, 
        start_date: new Date("14 December 2017 8:00"), end_date: new Date("14 December 2017 23:00")    },
];

var rooms = [
    {name: 'Ржавый Фред', capacity: 6, room_id: 1, room_disabled: 'true', floor: 7},
    {name: 'Прачечная', capacity: 10, room_id: 2, floor: 7},
    {name: 'Желтый дом', capacity: 10, room_id: 3, floor: 7},
    {name: 'Оранжевый тюльпан', capacity: 6, room_id: 4, room_disabled: 'true', floor: 7},
    {name: 'Джокер', capacity: 6, room_id: 5, room_disabled: 'true', floor: 6},
    {name: 'Мариванна', capacity: 10, room_id: 6, floor: 6},
    {name: 'Тонкий Боб', capacity: 10, room_id: 7, floor: 6},
    {name: 'Черная вдова', capacity: 6, room_id: 8, room_disabled: 'true', floor: 6 },
    {name: 'Белорусский ликер', capacity: 6, room_id: 9, room_disabled: 'true', floor: 6},
];

function feelFreeHours(cur_minute, end_minute, timeline, block_id) {
    let block_end = Math.floor(cur_minute / one_hour) * one_hour + one_hour;
    while (block_end <= end_minute) {
        block_id++;
        timeline.push({meeting_width: (block_end - cur_minute) * 100 / day_length, block_id: block_id});
        cur_minute = block_end;
        block_end = cur_minute + one_hour;
    }
    if (cur_minute < end_minute) {
        block_id++;
        timeline.push({meeting_width: (end_minute - cur_minute) * 100 / day_length, block_id: block_id});
        cur_minute = end_minute;
    }
    return {
        cur_minute: cur_minute, 
        block_id: block_id
    };
}

function feelEarlierHours(cur_minute, end_minute, timeline) {
    if (cur_minute < end_minute) {
        timeline.push({meeting_width: (end_minute - cur_minute) * 100 / day_length, occupied: true});
        cur_minute = end_minute;
    }
    return cur_minute;
}

function buildTimeline(meetings) {
    meetings = meetings.sort(function(meeting1, meeting2) {
        return meeting1.start_date - meeting2.start_date;
    });
    var timeline = [];
    var cur_minute = day_begin;
    var earlier_today = getTime().cur_time;
    var block_id = 0;
    meetings.forEach((meeting) => {
        var meeting_start = meeting.start_date.getHours() * one_hour + meeting.start_date.getMinutes();
        var meeting_end = meeting.end_date.getHours() * one_hour + meeting.end_date.getMinutes();
        cur_minute = feelEarlierHours(cur_minute, Math.min(earlier_today, meeting_start), timeline);
        ({ cur_minute, block_id } = feelFreeHours(cur_minute, meeting_start, timeline, block_id));
        timeline.push({meeting_width: (meeting_end - meeting_start) * 100 / day_length, meeting_id: meeting.meeting_id, occupied: true, meeting: meeting});
        cur_minute = meeting_end;
    });
    cur_minute = feelEarlierHours(cur_minute, earlier_today, timeline);
    ({ cur_minute, block_id } = feelFreeHours(cur_minute, day_end, timeline, block_id));
    return timeline;
};

function determineHoursState(now_time) {
    var hours = []
    for(let cur_time = day_begin; cur_time <= day_end; cur_time += one_hour) {
        let cur_hour = + Math.round(cur_time / one_hour)
        if (cur_time <= now_time) {
            hours.push({hour: cur_hour, hour_disabled: true});
        } else {
            hours.push({hour: cur_hour});
        }
    }
    return hours;
}

function getTime() {
    let date = new Date();
    date.setHours(date.getHours() + 10);
    let cur_hour = date.getHours();
    let cur_minutes = date.getMinutes();
    let cur_time = cur_hour * one_hour + cur_minutes;
    let cur_time_format = dateFormat(date, 'HH:MM');
    return {
        cur_time_format: cur_time_format, 
        cur_hour: cur_hour,
        cur_minutes: cur_minutes,
        cur_time: cur_time,
        one_hour_width: one_hour * 100 / day_length,
        hours: determineHoursState(cur_time),
        cur_time_margin: (cur_time - day_begin) * 100 / day_length,
    };
}

function constructRooms() {
    var floors = [];
    for (let index = 0; index < floors_number; ++index) {
        floors[index] = {}
        floors[index].number = index + 1;
        floors[index].rooms = [];
    }
    meetings.forEach(function(meeting) {
        meeting.date = dateFormat(meeting.start_date, 'd mmmm') + ', ' + dateFormat(meeting.start_date, 'HH:MM') + '-' + dateFormat(meeting.end_date, 'HH:MM');
    });
    rooms.forEach(function(room) {
        var room_meetings = meetings.filter(function(meeting) {
            return meeting.room_id == room.room_id;
        });
        room.timeline = buildTimeline(room_meetings);
        floors[room.floor - 1].rooms.push(room);
    });
    return floors.reverse();
}

export default Ractive.extend({
    template: template.template,
    css: template.css,
    components: {
        ComponentMeetingPopup: ComponentMeetingPopup
    },
    data: {
        meeting_selected: 0,
    },
    computed: {
        floors: constructRooms,
        time: getTime,
    },
    oncomplete: function() {
    	$('.timeline-block[occupied]').click((item) => {
            if (item.target.attributes.meeting) {
                let meeting_id = item.target.attributes.meeting.value;
                let room_id = item.target.attributes.room.value;
                if (item.target.attributes.meeting_clicked) {
                    this.set('meeting_selected', 0);
                    $('.timeline-block[meeting="' + meeting_id + '"]').removeAttr('meeting_clicked');
                    $('.calendar-rooms[room="' + room_id + '"]').children('.room-name').removeAttr('room_clicked');
                } else {
                    this.set('meeting_selected', meeting_id);
                    $('.timeline-block[meeting!="' + meeting_id + '"]').removeAttr('meeting_clicked');
                    $('.timeline-block[meeting="' + meeting_id + '"]').attr('meeting_clicked', true);
                    $('.calendar-rooms[room!="' + room_id + '"]').children('.room-name').removeAttr('room_clicked');
                    $('.calendar-rooms[room="' + room_id + '"]').children('.room-name').attr('room_clicked', 'true');
                }
            }
    	});
    }
});
