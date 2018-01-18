import Ractive from 'ractive';
var template = require('./timetable.haml');

var availability1 = [
    {start: 12, end: 30, meeting_id: 2},
    {start: 90, end: 180, meeting_id: 4},
];

var availability2 = [
    {start: 0, end: 50, meeting_id: 1},
    {start: 70, end: 90, meeting_id: 3},
    {start: 120, end: 168, meeting_id: 5},
];

var availability3 = [
    {start: 0, end: 180, meeting_id: 6},
];

function buildMinutesAvailability(meetings) {
    var availability = [];
    var cur_minute = 0;
    var earlier_today = getTime().cur_shift;
    for(; cur_minute < earlier_today; cur_minute++) {
        availability.push({minute: cur_minute, occupied: true});
    }
    meetings.forEach((meeting) => {
        for(; cur_minute < meeting.start; cur_minute++) {
            availability.push({minute: cur_minute});
        }
        for(; cur_minute < meeting.end; cur_minute++) {
            availability.push({minute: cur_minute, meeting_id: meeting.meeting_id, occupied: true});
        }
    });
    for(; cur_minute < 180; cur_minute++) {
        availability.push({minute: cur_minute});
    }
    return availability;
};

var rooms7 = [
    {name: 'Ржавый Фред', capacity: 6, state: 'disabled', availability: buildMinutesAvailability(availability3), },
    {name: 'Прачечная', capacity: 10, availability: buildMinutesAvailability(availability1), },
    {name: 'Желтый дом', capacity: 10, state: 'hover', availability: buildMinutesAvailability(availability2), },
    {name: 'Оранжевый тюльпан', capacity: 6, state: 'disabled', availability: buildMinutesAvailability(availability3), },
];

var rooms6 = [
    {name: 'Джокер', capacity: 6, state: 'disabled', availability: buildMinutesAvailability(availability3), },
    {name: 'Мариванна', capacity: 10, state: 'active', availability: buildMinutesAvailability(availability2), },
    {name: 'Тонкий Боб', capacity: 10, availability: buildMinutesAvailability(availability1), },
    {name: 'Черная вдова', capacity: 6, state: 'disabled', availability: buildMinutesAvailability(availability3), },
    {name: 'Белорусский ликер', capacity: 6, state: 'disabled', availability: buildMinutesAvailability(availability3), },
];

function buildMinutesBlocks(now_block) {
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
    let hour = new Date().getHours() + 12;
    let minutes = new Date().getMinutes();
    let shift = Math.floor((hour * 60 + minutes - 8 * 60) / 5);
    return {
        now: hour.toString() + ':' + minutes.toString(), 
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
    data: {
        floors: [
            {number: 7, rooms: rooms7},
            {number: 6, rooms: rooms6},
        ],
    },
    computed: {
        time: getTime,
    },
    oncomplete: function() {
    	$('.minute').click((item) => {
            $('.minute').removeClass('clicked');
            let meeting_id = item.target.attributes.meeting.value;
            $('.minute[meeting="' + meeting_id + '"]').addClass('clicked');
    	});
        
    	$('.minute').hover((item) => {
            $('.minute').removeClass('hover');
            let meeting_id = item.target.attributes.meeting.value;
            $('.minute[meeting="' + meeting_id + '"]').addClass('hover');
    	}, () => {
            $('.minute').removeClass('hover');
        });
    }
});
