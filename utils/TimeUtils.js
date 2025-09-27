export const getAge = (date) => {
  const yearOfBirth = new Date(date).getFullYear();
  const recentYear = new Date().getFullYear();

  let difference = recentYear - yearOfBirth;

  return difference;
};

export const timeAgo = (date) => {
  const recentTime = new Date().getTime();
  const inputTime = new Date(date).getTime();
  const timeDifference = recentTime - inputTime;

  const millisecondsPerMinute = 60 * 1000;
  const millisecondsPerHour = millisecondsPerMinute * 60;
  const millisecondsPerDay = millisecondsPerHour * 24;
  const millisecondsPerMonth = millisecondsPerDay * 30;
  const millisecondsPerYear = millisecondsPerDay * 365;

  // Calculate time difference
  const minute = Math.floor(
    (timeDifference % millisecondsPerHour) / millisecondsPerMinute
  );
  const hour = Math.floor(
    (timeDifference % millisecondsPerDay) / millisecondsPerHour
  );
  const day = Math.floor(timeDifference / millisecondsPerDay);
  const month = Math.floor(timeDifference / millisecondsPerMonth);
  const year = Math.floor(timeDifference / millisecondsPerYear);

  if (year > 0) {
    return `${year} year${year === 1 ? "" : "s"} ago`;
  } else if (month > 0) {
    return `${month} month${month === 1 ? "" : "s"} ago`;
  } else if (day > 0) {
    return `${day} day${day === 1 ? "" : "s"} ago`;
  } else if (hour > 0) {
    return `${hour} hr${hour === 1 ? "" : "s"} ago`;
  } else if (minute > 0) {
    return `${minute} min${minute === 1 ? "" : "s"} ago`;
  } else {
    return "Just now";
  }
};
