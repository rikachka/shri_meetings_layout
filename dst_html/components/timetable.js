import Ractive from 'ractive';
var template = require('./timetable.haml');
var dateFormat = require('dateformat');
import ComponentMeetingPopup from '../components/meeting_popup.js';

var day_begin = 8 * 60;
var day_end = 23 * 60;
var day_length = day_end - day_begin;

var meeting_selected = 0;

var floors_number = 8;

var meetings = [ 
    {meeting_id: 6, title: 'Собрание 6', start: 0 * 5 + day_begin, end: day_end, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 1},
    {meeting_id: 2, title: 'Собрание 2', start: 12 * 5 + day_begin, end: 30 * 5 + day_begin, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 2},
    {meeting_id: 4, title: 'Собрание 4', start: 90 * 5 + day_begin, end: day_end, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 2},
    {meeting_id: 3, title: 'Собрание 3', start: 70 * 5 + day_begin, end: 90 * 5 + day_begin, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 3},
    {meeting_id: 1, title: 'Собрание 1', start: 0 * 5 + day_begin, end: 50 * 5 + day_begin, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 3},
    {meeting_id: 5, title: 'Собрание 5', start: 120 * 5 + day_begin, end: 168 * 5 + day_begin, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 3},
    {meeting_id: 7, title: 'Собрание 7', start: 0 * 5 + day_begin, end: day_end, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 4},
    {meeting_id: 8, title: 'Собрание 8', start: 0 * 5 + day_begin, end: day_end, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 5},
    {meeting_id: 9, title: 'Собрание 9', start: 0 * 5 + day_begin, end: day_end, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 8},
    {meeting_id: 10, title: 'Собрание 10', start: 0 * 5 + day_begin, end: day_end, date: '14 декабря, 15:00—17:00', participant: 'Дарт Вейдер', number: 12, room_id: 9},
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
        return meeting1.start - meeting2.start;
    });
    var availability = [];
    var cur_minute = day_begin;
    var earlier_today = getTime().cur_shift;
    meetings.forEach((meeting) => {
        while (cur_minute < meeting.start) {
            if (cur_minute < earlier_today) {
                let block_end = Math.min(meeting.start, earlier_today);
                availability.push({start: cur_minute, length: (block_end - cur_minute) * 100 / day_length, occupied: true, meeting: meeting});
                cur_minute = block_end;
            } else {
                availability.push({start: cur_minute, length: (meeting.start - cur_minute) * 100 / day_length});
                cur_minute = meeting.start;
            }
        }
        availability.push({start: cur_minute, length: (meeting.end - meeting.start) * 100 / day_length, meeting_id: meeting.meeting_id, occupied: true, meeting: meeting});
        cur_minute = meeting.end;
    });
    if (cur_minute < earlier_today) {       
        availability.push({start: cur_minute, length: (earlier_today - cur_minute) * 100 / day_length, occupied: true});
        cur_minute = earlier_today;
    } 
    availability.push({start: cur_minute, length: (day_end - cur_minute) * 100 / day_length});
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
