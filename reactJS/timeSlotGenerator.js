import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './style.css';
const startTimeList = [
  '01:00:00 AM',
  '02:00:00 AM',
  '03:00:00 AM',
  '04:00:00 AM',
  '05:00:00 AM',
  '06:00:00 AM',
  '07:00:00 AM',
  '08:00:00 AM',
  '09:00:00 AM',
  '10:00:00 AM',
  '11:00:00 AM',
  '12:00:00 AM',
  '01:00:00 PM',
  '02:00:00 PM',
  '03:00:00 PM',
  '04:00:00 PM',
  '05:00:00 PM',
  '06:00:00 PM',
  '07:00:00 PM',
  '08:00:00 PM',
  '09:00:00 PM',
  '10:00:00 PM',
  '11:00:00 PM',
  '12:00:00 PM',
];
const endTimeList = [
  '01:60:00 AM',
  '02:60:00 AM',
  '03:60:00 AM',
  '04:60:00 AM',
  '05:60:00 AM',
  '06:60:00 AM',
  '07:60:00 AM',
  '08:60:00 AM',
  '09:60:00 AM',
  '10:60:00 AM',
  '11:60:00 AM',
  '12:60:00 AM',
  '01:60:00 PM',
  '02:60:00 PM',
  '03:60:00 PM',
  '04:60:00 PM',
  '05:60:00 PM',
  '06:60:00 PM',
  '07:60:00 PM',
  '08:60:00 PM',
  '09:60:00 PM',
  '10:60:00 PM',
  '11:60:00 PM',
  '12:60:00 PM',
];

const genTS = (data) => {
  const {
    selectedDate,
    startTime = '01:00: 00 AM',
    endTime = '10:60:00 PM',
    restrictedStartTime = '7:00:00 AM',
    restrictedEndTime = '7:60:00 AM',
    cookingTime = 45,
    restrictedDay = 'Wednesday',
  } = data;
  // const hour = 3600;
  const hour = 1800;
  const currentTime = moment().unix();
  const cookingBufferInSec = cookingTime * 60;
  const bookingStartsFrom = currentTime + cookingBufferInSec;
  const selectedDateEpoch = moment(selectedDate, 'MMM DD YYYY').unix();
  const currentStartTimeEpoch = moment(`${selectedDate} ${startTime}`).unix();
  const currentEndTimeEpoch = moment(`${selectedDate} ${endTime}`).unix();
  const restrictedStartTimeEpoch = moment(
    `${selectedDate} ${restrictedStartTime}`
  ).unix();
  const restrictedEndTimeEpoch = moment(
    `${selectedDate} ${restrictedEndTime}`
  ).unix();
  const hourlySlots = [];
  //  const halfHourlySlots = []
  // const currentTime = 1677580266;
  const isRestrictedDay = moment(selectedDate).format("dddd") === restrictedDay

  //generate slots with in the start and end time
  for (let i = currentStartTimeEpoch; i <= currentEndTimeEpoch; i = i + hour) {
    // time slot should be with in the end time / less than the end time
    if(i >= currentStartTimeEpoch && i < currentEndTimeEpoch){
    const startTimeEpoch = i;
    const endTimeEpoch = i + hour;
    const start = moment.unix(startTimeEpoch).format('LLLL').split(' ')[4];
    const end = moment.unix(endTimeEpoch).format('LLLL').split(' ')[4];
    const startFormat = moment
      .unix(startTimeEpoch)
      .format('LLLL')
      .split(' ')[5];
    const endFormat = moment.unix(endTimeEpoch).format('LLLL').split(' ')[5];
    const isFallingUnderCurrentTime =
      startTimeEpoch <= currentTime || endTimeEpoch <= currentTime;
      
    const isFallingUnderBufferTime =
      bookingStartsFrom >= startTimeEpoch && bookingStartsFrom <= endTimeEpoch;

    const active =
      (startTimeEpoch <= restrictedStartTimeEpoch &&
        endTimeEpoch <= restrictedStartTimeEpoch) ||
      (startTimeEpoch >= restrictedEndTimeEpoch &&
        endTimeEpoch >= restrictedEndTimeEpoch);

        console.log('active: ',{start: `${start} ${startFormat}`, end: `${end} ${endFormat}`, startTimeEpoch, endTimeEpoch, restrictedStartTimeEpoch, restrictedEndTimeEpoch})
    const timeSlot = {
      startTimeEpoch,
      endTimeEpoch,
      active: !isRestrictedDay && (active && !isFallingUnderCurrentTime && !isFallingUnderBufferTime),
      start: `${start} ${startFormat}`,
      end: `${end} ${endFormat}`,
      restrictedStartTimeEpoch,
      restrictedEndTimeEpoch,
    };
    // console.log(
    //   'isFallingUnderBufferTime',
    //   {
    //     isFallingUnderCurrentTime,
    //     isFallingUnderBufferTime,
    //     startTimeEpoch,
    //     endTimeEpoch,
    //   },
    //   timeSlot,
    //   isRestrictedDay
    // );
    hourlySlots.push(timeSlot);
  }
  }

  console.log('data', { ...data, bookingStartsFrom });
  return {
    selectedDate,
    selectedDateEpoch,
    currentStartTimeEpoch,
    currentEndTimeEpoch,
    restrictedStartTimeEpoch,
    restrictedEndTimeEpoch,
    slots: hourlySlots,
    currentTime,
  };
};

export default function App() {
  const cookingTime = 30;
  const restrictedDay = "Wednesday"
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState();
  const [startTime, setStartTime] = useState(startTimeList[0]);
  const [endTime, setEndTime] = useState(endTimeList[endTimeList.length-1]);
  const [restrictedStartTime, setRestrictedStartTime] = useState('05:00:00 AM');
  const [restrictedEndTime, setRestrictedEndTime] = useState('05:60:00 AM');
  const generateDays = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      let currentDay = moment().add(i, 'days').format('MMM DD YYYY');
      // console.log('c', currentDay)
      dates.push(currentDay);
    }
    setDays(dates);
    setSelectedDay(dates[0]);
  };
  useEffect(() => {
    generateDays();
  }, []);

  const onDaySelect = (date) => {
    setSelectedDay(date);
  };

  const slots = genTS({
    selectedDate: moment(selectedDay).format('MMM DD YYYY'),
    startTime,
    endTime,
    restrictedStartTime,
    restrictedEndTime,
    cookingTime,
    restrictedDay,
  });
  console.log('----slots', slots, days, selectedDay);

  return (
    <div>
      <div>
        {days.map((day) => (
          <button
            key={day}
            onClick={() => {
              onDaySelect(day);
            }}
          >
            <span>{day}</span>
            <span></span>
          </button>
        ))}
      </div>
      <hr />
      <div>Start And End Time</div>
      <label>From</label>
      {
        <select
          name="from"
          id="from"
          onChange={(e) => {
            console.log('From', e.target.value)
            setStartTime(e.target.value);
          }}
        >
          {startTimeList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      }
      <br />
      <label>To</label>
      {
        <select
          name="to"
          id="to"
          onChange={(e) => {
            console.log('To', e.target.value)
            setEndTime(e.target.value);
          }}
        >
          {endTimeList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      }
      <hr />
      <div>Restricted Start And End Time</div>
      <label>From</label>
      {
        <select
          name="from"
          id="from"
          onChange={(e) => {
            setRestrictedStartTime(e.target.value);
          }}
        >
          {startTimeList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      }
      <br />
      <label>To</label>
      {
        <select
          name="to"
          id="to"
          onChange={(e) => {
            setRestrictedEndTime(e.target.value);
          }}
        >
          {endTimeList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      }
      <hr />
      <div>Date {selectedDay} {moment(selectedDay).format('dddd')}</div>
      <div>
        Start & End: {startTime} - {endTime}
      </div>
      <div>
        InActive Hours: {restrictedStartTime} - {restrictedEndTime}
      </div>
      <div>Cooking time - {cookingTime} minutes</div>
      <hr />
      {slots.slots.map((slot, i) => (
        <li key={i}>
          <span>
            {!slot.active ? (
              <strike>{`${slot.start} - ${slot.end}`}</strike>
            ) : (
              <b>{`${slot.start} - ${slot.end}`}</b>
            )}
          </span>
        </li>
      ))}
    </div>
  );
}

// https://stackblitz.com/edit/react-ts-tfadya?file=App.tsx,index.tsx
