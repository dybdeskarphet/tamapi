class ServiceError extends Error {
  status: number;
  errors: object | null;
  constructor(status: number, message: string, errors: object | null = null) {
    super(message);
    this.status = status;
    this.errors = errors && Object.keys(errors).length > 0 ? errors : null;
    //  Keep the below code for historical reasons.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export { ServiceError };
