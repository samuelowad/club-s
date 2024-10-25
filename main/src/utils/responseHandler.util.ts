export const successResponse = (res: any, data: any, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res: any, message = "Something went wrong", statusCode = 500) => {
  console.error('Error:', message);
  return res.status(statusCode).json({
    success: false,
    message
  });
};

export const validationErrorResponse = (res: any, message = "Invalid input", statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const notFoundResponse = (res: any, message = "Resource not found", statusCode = 404) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export const unauthorizedResponse = (res: any, message = "Unauthorized", statusCode = 401) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

export  const conflictResponse = (res: any, message = "Conflict", statusCode = 409) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
}
