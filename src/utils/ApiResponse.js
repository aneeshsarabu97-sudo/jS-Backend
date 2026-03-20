class ApiResponse{
    constructor(statusCode,data,message="Sucuess"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.sucuess=statusCode<400
    }
}
export {ApiResponse}