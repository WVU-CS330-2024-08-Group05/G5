// Luke
class Review {
    // private variables

    #stars;
    #username;
    #date;
    #hours;

    constructor(stars, username, date, hours) {
        this.stars = stars;
        this.username = username;
        this.date = date;
        this.hours = hours;
    };

    set stars(stars) {
        this.stars = stars;
    }

    set username(username) {
        this.username = username;
    }

    set date(date) {
        this.date = date;
    }

    set hours(hours) {
        this.hours = hours;
    }

    get hours() {
        return hours;
    }

    get date() {
        return date;
    }

    get username() {
        return username;
    }

    get stars() {
        return stars;
    }
}