// Luke
class Review {
    // private variables

    #stars;
    #username;
    #date;
    #hours;
    #resort

    constructor(stars, username, date, hours, resort) {
        this.stars = stars;
        this.username = username;
        this.date = date;
        this.hours = hours;
    };
    set resort(resort) {
        this.resort = resort;
    }

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
    get resort() {
        return resort;
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