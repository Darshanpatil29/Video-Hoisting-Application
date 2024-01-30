class ApiError extends Error{
    constructor(statusCode,message="something went wrong!!",errors=[],stack=""){
        super(message); // error class only has one parameter msg
        this.status=statusCode;
        this.data=null;
        this.success=false;
        this.errors=errors
    }
}

export {ApiError}