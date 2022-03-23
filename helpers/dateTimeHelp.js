const getStartOfWeek = (date) => {
    let newDate = new Date(date.toUTCString());
    let day = newDate.getDay();
    let dateAtStart = newDate.getDate() - day + (day === 0 ? -6 : 1);
    let startOfWeek = new Date(newDate.setDate(dateAtStart));
    startOfWeek.setHours(0); startOfWeek.setMinutes(0); startOfWeek.setSeconds(0);
    return startOfWeek;
}

const getEndOfWeek = (date) => {
    let start = getStartOfWeek(date);
    let endOfWeek = new Date(start.setDate(start.getDate() + 6));
    endOfWeek.setHours(23); endOfWeek.setMinutes(59); endOfWeek.setSeconds(59);
    return endOfWeek;
}

const structureAvailability = (availability, tz) => {
    // For each hour/half hour slot, add m/t/w/th/f/s/su if present.
    // Turns the database datetime object into an array with this week's availability at given time:
    // {time: '0100', m: 'available', t: 'available', w: 'available', th: '', f: '', s: '', su: ''},

    // Maps string representation for each day of the week to an index 0-6, according to JS datetime getDay()
    const mapDayOfWeek = ['su','m','t','w','th','f','s'];
    const availabilityMap = new Map();

    availability.forEach(avail => {

        console.log(tz);

        console.log(`UTC: ${avail.time}`);
        
        // Set time to UTC with adjustment for user's timezone
        let availTime = new Date(avail.time);
        availTime.setUTCMinutes(availTime.getUTCMinutes() - tz);

        console.log(`Local: ${availTime}`);

        // Set hours and minutes strings, adding a leading 0 if needed.
        let hours = `${availTime.getHours()}`;
        hours = hours < 10 ? `0${hours}` : hours;
        let minutes = `${availTime.getMinutes()}`;
        minutes = minutes < 10 ? `0${minutes}` : minutes;
        const time = `${hours}${minutes}`;

        let day = availTime.getDay();
        let week = {m: '', t: '', w: '', th: '', f: '', s: '', su: ''};

        // For each time-row (e.g. all 6:00pm for this week) add 'available' to the corresponding day of the week.
        if (availabilityMap.has(time)) {
            week = availabilityMap.get(time);
            week[mapDayOfWeek[day]] = 'available';
        } else {
            week[mapDayOfWeek[day]] = 'available';
        }
        availabilityMap.set(time, week);
    })
    
    // Prepare the return availability object according to what will be needed on the frontend
    // {time: '0100', m: 'available', t: 'available', w: 'available', th: '', f: '', s: '', su: ''},
    const structuredAvailability = [];
    availabilityMap.forEach((week, time) => {
        structuredAvailability.push({time: `${time}`, ...week});
    })

    return structuredAvailability;
}


module.exports = {getStartOfWeek, getEndOfWeek, structureAvailability};