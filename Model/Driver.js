class Driver{
    constructor(number, location, timeStamp){
        this.phoneNumber = number;
        this.status = 'inactive';
        this.occupiedSeats = 0;
        this.location = location;
        this.destination = null;
        this.timeStamp = timeStamp;
    }
    updateData(driver){
        this.status = driver.status || this.status;
        this.occupiedSeats = driver.occupiedSeats || this.occupiedSeats;
        this.location = driver.location || this.location;
        this.destination = driver.destination || this.destination;
        this.timeStamp = driver.timeStamp || Date.now();
    }
    updateLocation(driver){
        this.location = driver.location || this.location;
        this.timeStamp = driver.timeStamp || Date.now();
    }
};

module.exports = Driver;