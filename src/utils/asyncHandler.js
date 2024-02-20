const asyncHandler=(fn)=>async (req,res,next)=>{
    try {
        return await Promise.resolve(fn(req, res, next))
    } catch (err) {
        return next(err)
    }
}

// wrap up function to handaling async error
// Define an asyncHandler middleware function
// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     // Execute the asynchronous function provided (fn)
//     return await fn(req, res, next);
//   } catch (error) {
//     // Handle errors caught during the execution of the asynchronous function
//     return res.status(error.code || 500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// Export the asyncHandler for use in other modules
export { asyncHandler }
