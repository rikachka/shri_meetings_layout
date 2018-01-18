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
    meetings.forEach((meeting) => {
        for(; cur_minute < meeting.start; cur_minute++) {
            availability.push({minute: cur_minute});
        }
        for(; cur_minute < meeting.end; cur_minute++) {
            availability.push({minute: cur_minute, meeting_id: meeting.meeting_id, occupied: true});
        }
    });
    for(; cur_minute < 180; cur_minute++) {
        availability.push({start: cur_minute, end: cur_minute});
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

export default Ractive.extend({
    template: template.template,
    css: template.css,
    data: {
        floors: [
            {number: 7, rooms: rooms7},
            {number: 6, rooms: rooms6},
        ],
    },
});
