//ES13

class Account {
    //private variables
    #username;
    #password;
    #email;
    darkMode = false; //initialize light mode

    #hours;
    #trips;
    #rank;

    //Constructor
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;

        this.trips = 0;
        this.rank = 0;
        this.hours = 0;
    };

    //setters and getters
    set username(username){
        this.username = username;
    };
    
    get username(){
        return username;
    };

    set password(password){
        this.password = password;
    };

    get password(){
        return password;
    };

    set email(email){
        this.email = email;
    };

    get email(){
        return email;
    };


    //user settings
    changeBrowserMode(){
        darkMode = !darkMode;
    };

    set hours(hours) {
        this.hours = hours;
    }

    set rank(rank) {
        this.rank = rank;
    }

    set trips(trips) {
        this.trips = trips;
    }

    get trips() {
        return this.trips;
    }

    get rank() {
        return this.rank;
    }

    get hours() {
        return this.hours;
    }
}