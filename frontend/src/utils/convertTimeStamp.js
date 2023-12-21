const pad = num => ("0" + num).slice(-2); // or use padStart

const getTimeFromDate = date => {
    let hours = date.getHours(),
        minutes = date.getMinutes();
    return pad(hours) + ":" + pad(minutes);
}
export default function convertTimeStamp(timeStamp) {
    let date = new Date(timeStamp)
    let today = new Date()
    today = new Date(today.toDateString())
    let yesterday = new Date().setDate(today.getDate() - 1)

    if (date > today) {
        return (getTimeFromDate(date));
    }
    if (date > yesterday) {
        return "Yesterday";
    }
    return (date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear().toString().substring(2, 4));
}
