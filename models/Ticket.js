class Ticket {
  constructor(number, user_id){
    this.number = number;
    this.user_id = user_id;
    this.interval_id = -1;
  }
}

module.exports = Ticket;
