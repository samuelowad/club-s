import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  conflictResponse,
} from '../responseHandler.util'; // Adjust the path accordingly

describe('Response Handlers', () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('successResponse', () => {
    it('should return a success response with default values', () => {
      successResponse(res, { id: 1 });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { id: 1 },
      });
    });

    it('should return a success response with custom message and status', () => {
      successResponse(res, { id: 1 }, 'Custom Success', 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Custom Success',
        data: { id: 1 },
      });
    });
  });

  describe('errorResponse', () => {
    it('should return an error response with default values', () => {
      errorResponse(res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong',
      });
    });

    it('should return an error response with custom message and status', () => {
      errorResponse(res, 'Custom Error Message', 400);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom Error Message',
      });
    });
  });

  describe('validationErrorResponse', () => {
    it('should return a validation error response with default values', () => {
      validationErrorResponse(res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input',
      });
    });

    it('should return a validation error response with custom message', () => {
      validationErrorResponse(res, 'Custom Validation Error');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom Validation Error',
      });
    });
  });

  describe('notFoundResponse', () => {
    it('should return a not found response with default values', () => {
      notFoundResponse(res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found',
      });
    });

    it('should return a not found response with custom message', () => {
      notFoundResponse(res, 'Custom Not Found Message');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom Not Found Message',
      });
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return an unauthorized response with default values', () => {
      unauthorizedResponse(res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
    });

    it('should return an unauthorized response with custom message', () => {
      unauthorizedResponse(res, 'Custom Unauthorized Message');

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom Unauthorized Message',
      });
    });
  });

  describe('conflictResponse', () => {
    it('should return a conflict response with default values', () => {
      conflictResponse(res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Conflict',
      });
    });

    it('should return a conflict response with custom message', () => {
      conflictResponse(res, 'Custom Conflict Message');

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom Conflict Message',
      });
    });
  });
});
