const dayLeftUtil = (time1: string | Date, time2: string | Date) => {
  const dateCreate = new Date(time1);
  const dateTarget = new Date(time2);

  // Calculate the time difference in milliseconds
  const timeDiff = Math.abs(dateTarget.getTime() - dateCreate.getTime());

  // Convert milliseconds to daysPr
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysLeft;
};
export default dayLeftUtil;
