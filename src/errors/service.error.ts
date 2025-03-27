class ServiceError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    //  Keep the below code for historical reasons.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { ServiceError };
