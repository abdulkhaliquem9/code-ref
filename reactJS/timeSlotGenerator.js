import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './style.css';

const genTS = (data) => {
  const {
    selectedDate,
    startTime = '01:00: 01 AM',
    endTime = '10:00:59 PM',
    restrictedStartTime = '7:00:01 AM',
    restrictedEndTime = '7:59:59 AM',
    cookingTime = 45,
  } = data;
  const hour = 3600;
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
  for (let i = currentStartTimeEpoch; i <= currentEndTimeEpoch; i = i + hour) {
    const startTimeEpoch = i;
    const endTimeEpoch = i + hour;
    const start = moment.unix(startTimeEpoch).format('LLLL').split(' ')[4];
    const end = moment.unix(endTimeEpoch).format('LLLL').split(' ')[4];
    const startFormat = moment
      .unix(startTimeEpoch)
      .format('LLLL')
      .split(' ')[5];
    const endFormat = moment.unix(endTimeEpoch).format('LLLL').split(' ')[5];
    //  const isFallingUnderCurrentTime = currentTime >= startTimeEpoch && currentTime <= endTimeEpoch;
    const isFallingUnderCurrentTime =
      startTimeEpoch <= currentTime || endTimeEpoch <= currentTime;
    const isFallingUnderBufferTime =
      bookingStartsFrom >= startTimeEpoch && bookingStartsFrom <= endTimeEpoch;
    const active =
      (startTimeEpoch < restrictedStartTimeEpoch &&
        endTimeEpoch < restrictedStartTimeEpoch) ||
      (startTimeEpoch > restrictedEndTimeEpoch &&
        endTimeEpoch > restrictedEndTimeEpoch);
    const timeSlot = {
      startTimeEpoch,
      endTimeEpoch,
      active: active && !isFallingUnderCurrentTime && !isFallingUnderBufferTime,
      start: `${start} ${startFormat}`,
      end: `${end} ${endFormat}`,
      restrictedStartTimeEpoch,
      restrictedEndTimeEpoch,
    };
    console.log(
      'isFallingUnderBufferTime',
      {
        isFallingUnderCurrentTime,
        isFallingUnderBufferTime,
        startTimeEpoch,
        endTimeEpoch,
      },
      timeSlot
    );
    hourlySlots.push(timeSlot);
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
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState();
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
  // const slots = generateDailyTimeSlots({
  //   selectedDate: moment('FEB 28 2023').format('MMM DD YYYY'),
  //   restrictedDeliveryStartTime: '04:00 PM',
  //   restrictedDeliveryEndTime: '08:00 PM',
  //   startTimeRef: 9,
  //   endTimeRef: 20,
  //   cookingTime: 45,
  //   isCurrentDayRef: { current: true },
  // });

  const slots = genTS({
    // selectedDate: moment('FEB 28 2023').format('MMM DD YYYY'),
    selectedDate: moment(selectedDay).format('MMM DD YYYY'),
    startTime: '01:00: 01 AM',
    endTime: '10:00:59 PM',
    restrictedStartTime: '7:00:01 AM',
    restrictedEndTime: '7:59:59 AM',
    cookingTime: 45,
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

const generateDailyTimeSlots = ({
  selectedDate,
  restrictedDeliveryStartTime,
  restrictedDeliveryEndTime,
  startTimeRef,
  endTimeRef,
  cookingTime,
  isCurrentDayRef = { current: true },
}) => {
  let slots = [];
  let selectedTime = '';
  const setSlots = (slotsArray) => {
    slots = slotsArray;
  };
  const setSelectedTime = (time) => {
    selectedTime = time;
  };

  const roundToNextSlot = (time) => {
    const start = moment(time);
    const remainder = 30 - (start.minute() % 30);
    const dateTime = moment(start).add(remainder, 'minutes').startOf('minute');
    return dateTime;
  };

  if (selectedDate) {
    const parsedDate = moment(selectedDate, 'MMM DD YYYY');
    const now = moment();
    // const cookingTime = 45;
    let dateToConsider = now;
    let startTime = null;
    let endTime = null;
    const restrictedStartTime = restrictedDeliveryStartTime
      ? moment(
          selectedDate + ' ' + restrictedDeliveryStartTime,
          'MMM DD YYYY hh:mm A'
        )
      : null;
    const restrictedEndTime = restrictedDeliveryEndTime
      ? moment(
          selectedDate + ' ' + restrictedDeliveryEndTime,
          'MMM DD YYYY hh:mm A'
        )
      : null;

    let STR = moment(dateToConsider).startOf('day');
    let startTimeReference = STR.add(startTimeRef, 'hours');
    let endTimeReference = moment(dateToConsider)
      .startOf('day')
      .add(endTimeRef, 'hours');

    console.log('st', {
      STR,
      restrictedStartTime,
      restrictedEndTime,
      startTimeReference,
      endTimeReference,
    });
    if (
      moment(parsedDate).startOf('day').format('DD MMM YYYY') !==
      moment().startOf('day').format('DD MMM YYYY')
    ) {
      dateToConsider = moment(parsedDate);
      startTimeReference = moment(dateToConsider)
        .startOf('day')
        .add(startTimeRef, 'hours');
      endTimeReference = moment(dateToConsider)
        .startOf('day')
        .add(endTimeRef, 'hours');
      isCurrentDayRef.current = false;
    }
    if (moment(dateToConsider) > endTimeReference) {
      setSlots([]);
      setSelectedTime('');
    } else {
      if (moment(dateToConsider) > startTimeReference) {
        startTime = roundToNextSlot(
          moment(dateToConsider).add(cookingTime, 'minute')
        );
      } else {
        startTime = roundToNextSlot(
          startTimeReference.add(cookingTime, 'minute')
        );
      }

      endTime = roundToNextSlot(
        endTimeReference.add(cookingTime + 60, 'minute')
      );
      const hours = moment.duration(endTime.diff(startTime)).asHours();
      if (hours < 0) {
        setSlots([]);
        setSelectedTime('');
      } else {
        const _slots = [];
        for (let i = 0; i < parseInt(hours, 10); i++) {
          const firstTime = moment(startTime).add(i * 60, 'minute');
          const secondTime = moment(startTime).add((i + 1) * 60, 'minute');
          if (
            !(
              restrictedStartTime &&
              restrictedEndTime &&
              (restrictedStartTime.isBetween(
                firstTime,
                secondTime,
                null,
                '[)'
              ) ||
                restrictedEndTime.isBetween(firstTime, secondTime, null, '(]'))
            )
          ) {
            _slots.push({
              label: `${moment(firstTime).format('h.mm')} - ${moment(
                secondTime
              ).format('h.mm A')}`,
              status: 'normal',
            });
          }
        }

        if (selectedTime) {
          const selectedSlot = _slots.find(
            (slot) => slot.label === selectedTime
          );
          if (selectedSlot) {
            selectedSlot.status = 'active';
          }
        } else {
          _slots[0].status = 'active';
          setSelectedTime(_slots[0].label);
        }
        setSlots([..._slots]);
      }
    }
  }
  return slots;
};

// https://stackblitz.com/edit/react-ts-cddjue?file=App.tsx
