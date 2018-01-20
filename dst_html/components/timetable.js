import Ractive from 'ractive';
var template = require('./timetable.haml');
var dateFormat = require('dateformat');
import ComponentMeetingPopup from '../components/meeting_popup.js';

var day_begin = 8 * 60;
var day_end = 23 * 60;
var day_length = day_end - day_begin;

var meeting_selected = 0;

var availability1 = [
    {start: 12 * 5 + day_begin, end: 30 * 5 + day_begin, meeting_id: 2},
    {start: 90 * 5 + day_begin, end: day_end, meeting_id: 4},
];

var availability2 = [
    {start: 0 * 5 + day_begin, end: 50 * 5 + day_begin, meeting_id: 1},
    {start: 70 * 5 + day_begin, end: 90 * 5 + day_begin, meeting_id: 3},
    {start: 120 * 5 + day_begin, end: 168 * 5 + day_begin, meeting_id: 5},
];

var availability3 = [
    {start: 0 * 5 + day_begin, end: day_end, meeting_id: 6},
];

var meeting1 = {
    meeting_id: 4,
    title: 'Рассуждения о высоком',
    date: '14 декабря, 15:00—17:00',
    participant_example: 'Дарт Вейдер',
    participants_number: 12,
}

var rooms7 = [
    {name: 'Ржавый Фред', capacity: 6, room_id: 1, room_disabled: 'true', availability: buildMinutesAvailability(availability3), },
    {name: 'Прачечная', capacity: 10, room_id: 2, availability: buildMinutesAvailability(availability1), },
    {name: 'Желтый дом', capacity: 10, room_id: 3, availability: buildMinutesAvailability(availability2), },
    {name: 'Оранжевый тюльпан', capacity: 6, room_id: 4, room_disabled: 'true', availability: buildMinutesAvailability(availability3), },
];

var rooms6 = [
    {name: 'Джокер', capacity: 6, room_id: 5, room_disabled: 'true', availability: buildMinutesAvailability(availability3), },
    {name: 'Мариванна', capacity: 10, room_id: 6, availability: buildMinutesAvailability(availability2), },
    {name: 'Тонкий Боб', capacity: 10, room_id: 7, availability: buildMinutesAvailability(availability1), },
    {name: 'Черная вдова', capacity: 6, room_id: 8, room_disabled: 'true', availability: buildMinutesAvailability(availability3), },
    {name: 'Белорусский ликер', capacity: 6, room_id: 9, room_disabled: 'true', availability: buildMinutesAvailability(availability3), },
];

function buildMinutesAvailability(meetings) {
    var availability = [];
    var cur_minute = day_begin;
    var earlier_today = getTime().cur_shift;
    meetings.forEach((meeting) => {
        while (cur_minute < meeting.start) {
            if (cur_minute < earlier_today) {
                let block_end = Math.min(meeting.start, earlier_today);
                availability.push({start: cur_minute, length: (block_end - cur_minute) * 100 / day_length, occupied: true, meeting: meeting1});
                cur_minute = block_end;
            } else {
                availability.push({start: cur_minute, length: (meeting.start - cur_minute) * 100 / day_length});
                cur_minute = meeting.start;
            }
        }
        availability.push({start: cur_minute, length: (meeting.end - meeting.start) * 100 / day_length, meeting_id: meeting.meeting_id, occupied: true, meeting: meeting1});
        cur_minute = meeting.end;
    });
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
    date.setHours(date.getHours() - 3);
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

export default Ractive.extend({
    template: template.template,
    css: template.css,
    components: {
        ComponentMeetingPopup: ComponentMeetingPopup
    },
    data: {
        floors: [
            {number: 7, rooms: rooms7},
            {number: 6, rooms: rooms6},
        ],
        meeting_selected: 0,
    },
    computed: {
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
