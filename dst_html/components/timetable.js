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

var day_begin = 8 * 60;
var day_end = 23 * 60;
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

function buildMinutesAvailability(meetings) {
    meetings = meetings.sort(function(meeting1, meeting2) {
        return meeting1.start_date - meeting2.start_date;
    });
    var availability = [];
    var cur_minute = day_begin;
    var earlier_today = getTime().cur_shift;
    meetings.forEach((meeting) => {
        var meeting_start = meeting.start_date.getHours() * 60 + meeting.start_date.getMinutes();
        console.log(meeting_start);
        var meeting_end = meeting.end_date.getHours() * 60 + meeting.end_date.getMinutes();
        while (cur_minute < meeting_start) {
            if (cur_minute < earlier_today) {
                let block_end = Math.min(meeting_start, earlier_today);
                availability.push({length: (block_end - cur_minute) * 100 / day_length, occupied: true, meeting: meeting});
                cur_minute = block_end;
            } else {
                availability.push({length: (meeting_start - cur_minute) * 100 / day_length});
                cur_minute = meeting_start;
            }
        }
        availability.push({length: (meeting_end - meeting_start) * 100 / day_length, meeting_id: meeting.meeting_id, occupied: true, meeting: meeting});
        cur_minute = meeting_end;
    });
    if (cur_minute < earlier_today) {       
        availability.push({length: (earlier_today - cur_minute) * 100 / day_length, occupied: true});
        cur_minute = earlier_today;
    } 
    availability.push({length: (day_end - cur_minute) * 100 / day_length});
    return availability;
};

function buildMinutesBlocks(now_block) {
    now_block = Math.floor((now_block - day_begin) / 5);
    var blocks = [];
    var cur_minute = 0;
    for(; cur_minute < 180; cur_minute++) {
        if (cur_minute == now_block) {
            blocks.push({minute: cur_minute, now: true});
        } else if (cur_minute % 12 == 0) {
            blocks.push({minute: cur_minute, hour: true});
        } else {
            blocks.push({minute: cur_minute})
        }
    }
    return blocks;
};

function determineHoursState(now_hour) {
    var hours = []
    for(let hour = 8; hour < 24; hour++) {
        if (hour <= now_hour) {
            hours.push({hour: hour, hour_disabled: true});
        } else {
            hours.push({hour: hour});
        }
    }
    return hours;
}

function getTime() {
    let date = new Date();
    date.setHours(date.getHours() - 7);
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let shift = hour * 60 + minutes;
    let time = dateFormat(date, 'HH:MM');
    return {
        now: time, 
        cur_hour: hour,
        cur_minutes: minutes,
        cur_shift: shift,
        blocks: buildMinutesBlocks(shift),
        hours: determineHoursState(hour),
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
        room.availability = buildMinutesAvailability(room_meetings);
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
    	$('.meeting').click((item) => {
            if (item.target.attributes.meeting) {
                let meeting_id = item.target.attributes.meeting.value;
                let room_id = item.target.attributes.room.value;
                if (item.target.attributes.meeting_clicked) {
                    this.set('meeting_selected', 0);
                    $('.meeting[meeting="' + meeting_id + '"]').removeAttr('meeting_clicked');
                    $('.calendar-rooms[room="' + room_id + '"]').children('.room-name').removeAttr('room_clicked');
                } else {
                    this.set('meeting_selected', meeting_id);
                    $('.meeting[meeting!="' + meeting_id + '"]').removeAttr('meeting_clicked');
                    $('.meeting[meeting="' + meeting_id + '"]').attr('meeting_clicked', true);
                    $('.calendar-rooms[room!="' + room_id + '"]').children('.room-name').removeAttr('room_clicked');
                    $('.calendar-rooms[room="' + room_id + '"]').children('.room-name').attr('room_clicked', 'true');
                }
            }
    	});
        
    	$('.meeting').hover((item) => {
            if (item.target.attributes.meeting) {
                let meeting_id = item.target.attributes.meeting.value;
                $('.meeting[meeting="' + meeting_id + '"]').attr('meeting_hover', true);
                let room_id = item.target.attributes.room.value;
                $('.calendar-rooms[room="' + room_id + '"]').children('.room-name').attr('room_hover', 'true');
            }
    	}, () => {
            $('.meeting').removeAttr('meeting_hover');
            $('.calendar-rooms').children('.room-name').removeAttr('room_hover');
        });
    }
});
