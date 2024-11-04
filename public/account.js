//ES13

class Account {
    //private variables
    #username;
    #password;
    #email;
    darkMode = false; //initialize light mode

    //Constructor
    constructor(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
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



}